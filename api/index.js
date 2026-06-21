import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://nisfgcpmjidittczmaeo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_HZ63QWbMMuhGTqC4Q-W5gg_aegN3ye6';
const supabase = createClient(supabaseUrl, supabaseKey);

// Multer Configuration for Memory Storage (Since Vercel is Serverless)
const upload = multer({ storage: multer.memoryStorage() });

// --- Auth Endpoints ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  const username = email.split('@')[0];
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, username, email, password, notification_preference: '1d' }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Email atau username sudah terdaftar' });
    }
    return res.status(500).json({ error: error.message });
  }
  
  res.json(data);
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }
  res.json(data);
});

// --- User Profile Endpoints ---
app.get('/api/profile/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/profile/:id', async (req, res) => {
  const { name, username, email, bio, website, notification_preference } = req.body;
  const { error } = await supabase
    .from('users')
    .update({ name, username, email, bio, website, notification_preference: notification_preference || '1d' })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Profile updated' });
});

app.post('/api/upload-avatar/:id', upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const fileExt = req.file.originalname.split('.').pop();
  const fileName = `avatar-${req.params.id}-${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true
    });

  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar: publicUrl })
    .eq('id', req.params.id);

  if (updateError) return res.status(500).json({ error: updateError.message });

  res.json({ message: 'Avatar updated', avatarUrl: publicUrl });
});

// --- Tasks Endpoints ---
app.get('/api/tasks/:userId', async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', req.params.userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  const tasks = data.map(t => ({ ...t, done: !!t.done }));
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const { userId, title, description, date, time, end_time, category, location, type, priority } = req.body;
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      user_id: userId, title, description, date, time, end_time, category, location, type: type || 'task', priority, done: 0
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ...data, done: false });
});

// --- Stats Endpoint ---
app.get('/api/stats/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid User ID' });
  const last7Days = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    last7Days.push(`${year}-${month}-${day}`);
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('date, done')
    .eq('user_id', userId)
    .in('date', last7Days);

  if (error) return res.status(500).json({ error: error.message });

  const statsMap = last7Days.reduce((acc, date) => {
    acc[date] = { total: 0, done: 0, percentage: 0 };
    return acc;
  }, {});

  data.forEach(task => {
    if (statsMap[task.date]) {
      statsMap[task.date].total += 1;
      if (task.done === 1) statsMap[task.date].done += 1;
    }
  });

  const result = last7Days.map(date => {
    const stat = statsMap[date];
    stat.percentage = stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0;
    return stat;
  });

  res.json(result);
});

app.put('/api/tasks/:id', async (req, res) => {
  const { title } = req.body;
  if (title !== undefined) {
    const { title, description, date, time, end_time, category, location, type, priority, done } = req.body;
    const { error } = await supabase
      .from('tasks')
      .update({ title, description, date, time, end_time, category, location, type, priority, done: done ? 1 : 0 })
      .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Task updated' });
  } else {
    const { done } = req.body;
    const { error } = await supabase
      .from('tasks')
      .update({ done: done ? 1 : 0 })
      .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Task status updated' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { error } = await supabase.from('tasks').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Task deleted' });
});

// --- Schedules Endpoints ---
app.get('/api/schedules/:userId', async (req, res) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

  const { data: upcoming } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_id', req.params.userId)
    .eq('status', 'upcoming');
  
  if (upcoming) {
    for (let s of upcoming) {
      if (s.schedule_date < today || (s.schedule_date === today && ((s.end_time && s.end_time < currentTime) || (!s.end_time && s.start_time < currentTime)))) {
        await supabase.from('schedules').update({ status: 'completed' }).eq('id', s.id);
      }
    }
  }

  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_id', req.params.userId)
    .order('schedule_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/schedules/upcoming/:userId', async (req, res) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

  const { data: upcoming } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_id', req.params.userId)
    .eq('status', 'upcoming');
  
  if (upcoming) {
    for (let s of upcoming) {
      if (s.schedule_date < today || (s.schedule_date === today && ((s.end_time && s.end_time < currentTime) || (!s.end_time && s.start_time < currentTime)))) {
        await supabase.from('schedules').update({ status: 'completed' }).eq('id', s.id);
      }
    }
  }

  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_id', req.params.userId)
    .eq('status', 'upcoming')
    .gte('schedule_date', today)
    .order('schedule_date', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(5);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/schedules', async (req, res) => {
  const { userId, title, description, schedule_date, start_time, end_time, location, status } = req.body;
  const { data, error } = await supabase
    .from('schedules')
    .insert([{ user_id: userId, title, description, schedule_date, start_time, end_time, location, status: status || 'upcoming' }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/schedules/:id', async (req, res) => {
  const { title, description, schedule_date, start_time, end_time, location, status } = req.body;
  const { error } = await supabase
    .from('schedules')
    .update({ title, description, schedule_date, start_time, end_time, location, status })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Schedule updated' });
});

app.delete('/api/schedules/:id', async (req, res) => {
  const { error } = await supabase.from('schedules').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Schedule deleted' });
});

// --- Testimonials Endpoints ---
app.get('/api/testimonials', async (req, res) => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*, users(name, avatar)')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) return res.status(500).json({ error: error.message });
  
  const formattedData = data.map(t => ({
    ...t,
    name: t.users?.name,
    avatar: t.users?.avatar
  }));
  res.json(formattedData);
});

app.post('/api/testimonials', async (req, res) => {
  const { userId, content, rating, role } = req.body;
  const { data, error } = await supabase
    .from('testimonials')
    .insert([{ user_id: userId, content, rating, role }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id, message: 'Testimonial added successfully' });
});

// Export app for Vercel Serverless
export default app;

// Listen only if not running in a serverless environment
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
