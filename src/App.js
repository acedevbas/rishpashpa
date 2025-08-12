import React, { useState, useEffect, useRef } from 'react';
import SetupForm from './components/SetupForm.js';
import ExerciseList from './components/ExerciseList.js';
import ReminderService from './services/reminder.js';
import { getSettings, saveSettings, getNextExercises } from './services/storage.js';
import { TELEGRAM_BOT_TOKEN } from './config.js';

const App = () => {
  const [settings, setSettings] = useState(getSettings());
  const [mode, setMode] = useState('idle');
  const [exercises, setExercises] = useState([]);
  const reminderRef = useRef();

  useEffect(() => {
    console.log('Bot token loaded:', TELEGRAM_BOT_TOKEN ? 'yes' : 'no');
    reminderRef.current = new ReminderService(() => {
      setExercises(getNextExercises());
      setMode('workout');
    });
    reminderRef.current.start(settings);
  }, []);

  const handleSave = (s) => {
    setSettings(s);
    saveSettings(s);
    reminderRef.current.start(s);
    setMode('idle');
  };

  const handleWorkoutComplete = () => {
    reminderRef.current.complete();
    setMode('idle');
  };

  if (mode === 'setup') {
    return <SetupForm initialSettings={settings} onSave={handleSave} />;
  }

  if (mode === 'workout') {
    return <ExerciseList exercises={exercises} onComplete={handleWorkoutComplete} />;
  }

  return (
    <div className="card">
      <img src="mascot.svg" alt="Ришпашпа" className="mascot" />
      <h1>Ришпашпа</h1>
      <button onClick={() => setMode('setup')}>Настройки</button>
      <p className="muted">Ожидание напоминаний...</p>
    </div>
  );
};

export default App;
