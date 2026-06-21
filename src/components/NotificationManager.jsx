import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

export default function NotificationManager() {
  const location = useLocation();
  const [lastChecked, setLastChecked] = useState(0);
  // Initialize from localStorage to survive page refreshes and browser restarts
  const [notifiedTasks, setNotifiedTasks] = useState(() => {
    const saved = localStorage.getItem('planify_notified_tasks');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const checkNotifications = useCallback(async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    
    const user = JSON.parse(storedUser);
    if (!user.notification_preference || user.notification_preference === 'none') return;

    // Prevent checking too frequently (throttle to 30 seconds)
    const nowTs = Date.now();
    if (nowTs - lastChecked < 30000) return;
    setLastChecked(nowTs);

    try {
      const [tasksRes, schedulesRes] = await Promise.all([
        fetch(`${API_URL}/tasks/${user.id}`),
        fetch(`${API_URL}/schedules/${user.id}`)
      ]);
      
      const tasks = await tasksRes.json();
      const schedules = await schedulesRes.json();
      
      const now = new Date();
      let leadTimeMs = 0;
      if (user.notification_preference === '12h') leadTimeMs = 12 * 60 * 60 * 1000;
      else if (user.notification_preference === '1d') leadTimeMs = 24 * 60 * 60 * 1000;
      else if (user.notification_preference === '2d') leadTimeMs = 48 * 60 * 60 * 1000;

      const currentNotified = new Set(notifiedTasks);
      let foundNew = false;

      // Check Tasks
      tasks.forEach(task => {
        if (task.done || !task.date) return;
        const deadline = new Date(`${task.date}T${task.time || '00:00'}:00`);
        const diff = deadline.getTime() - now.getTime();
        const notificationKey = `task-${task.id}`;

        if (diff > 0 && diff <= leadTimeMs && !currentNotified.has(notificationKey)) {
          if (Notification.permission === "granted") {
            new Notification("Planify Reminder", {
              body: `Tugas "${task.title}" mendekati deadline!`,
              icon: "/favicon.ico"
            });
            currentNotified.add(notificationKey);
            foundNew = true;
          }
        }
      });

      // Check Schedules
      schedules.forEach(schedule => {
        if (schedule.status !== 'upcoming' || !schedule.schedule_date) return;
        const start = new Date(`${schedule.schedule_date}T${schedule.start_time || '00:00'}:00`);
        const diff = start.getTime() - now.getTime();
        const notificationKey = `schedule-${schedule.id}`;

        if (diff > 0 && diff <= leadTimeMs && !currentNotified.has(notificationKey)) {
          if (Notification.permission === "granted") {
            new Notification("Planify Reminder", {
              body: `Jadwal "${schedule.title}" akan segera dimulai!`,
              icon: "/favicon.ico"
            });
            currentNotified.add(notificationKey);
            foundNew = true;
          }
        }
      });

      if (foundNew) {
        setNotifiedTasks(currentNotified);
        localStorage.setItem('planify_notified_tasks', JSON.stringify([...currentNotified]));
      }
    } catch (error) {
      console.error('Error in background notification check:', error);
    }
  }, [notifiedTasks, lastChecked]);

  useEffect(() => {
    // Initial check
    checkNotifications();

    // Set up interval for background checking (every 5 minutes)
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkNotifications]);

  // Also check whenever location changes (user moves between pages)
  useEffect(() => {
    checkNotifications();
  }, [location.pathname, checkNotifications]);

  return null; // This component doesn't render anything UI-wise
}
