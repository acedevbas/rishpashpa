import { EXERCISES } from '../data/exercises.js';

export const STORAGE_KEYS = {
  settings: 'rp_settings',
  history: 'rp_history',
  progress: 'rp_progress',
  queue: 'rp_queue'
};

export function getSettings() {
  const raw = localStorage.getItem(STORAGE_KEYS.settings);
  return raw
    ? JSON.parse(raw)
    : { reminderFrequency: 60, workSchedule: { start: '09:00', end: '18:00' } };
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function getHistory() {
  const raw = localStorage.getItem(STORAGE_KEYS.history);
  return raw ? JSON.parse(raw) : [];
}

export function addHistory(entry) {
  const history = getHistory();
  history.push(entry);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
}

export function getProgress() {
  const raw = localStorage.getItem(STORAGE_KEYS.progress);
  return raw ? JSON.parse(raw) : { completed: [], skipped: [] };
}

export function markWorkout(id, status) {
  const progress = getProgress();
  progress[status].push({ id, time: Date.now() });
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
}

export function getQueue() {
  const raw = localStorage.getItem(STORAGE_KEYS.queue);
  return raw ? JSON.parse(raw) : [];
}

export function setQueue(queue) {
  localStorage.setItem(STORAGE_KEYS.queue, JSON.stringify(queue));
}

export function enqueueNotification(time) {
  const q = getQueue();
  q.push({ time, handled: false });
  setQueue(q);
}

export function dequeueNotification() {
  const q = getQueue();
  const next = q.shift();
  setQueue(q);
  return next;
}

export function getNextExercises(count = 3) {
  const shuffled = [...EXERCISES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
