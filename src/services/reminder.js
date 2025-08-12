import { enqueueNotification, addHistory } from './storage.js';

export default class ReminderService {
  constructor(onReminder) {
    this.onReminder = onReminder;
    this.timer = null;
    this.pending = false;
    this.settings = null;
  }

  start(settings) {
    this.settings = settings;
    this.stop();
    this.timer = setInterval(() => this.tick(), settings.reminderFrequency * 60 * 1000);
  }

  tick() {
    if (this.pending) return;
    const now = new Date();
    const [sH, sM] = this.settings.workSchedule.start.split(':').map(Number);
    const [eH, eM] = this.settings.workSchedule.end.split(':').map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = sH * 60 + sM;
    const endMinutes = eH * 60 + eM;
    if (currentMinutes < startMinutes || currentMinutes > endMinutes) return;

    this.pending = true;
    enqueueNotification(now.getTime());
    addHistory({ time: now.getTime(), status: 'sent' });
    this.onReminder();
  }

  complete() {
    this.pending = false;
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
