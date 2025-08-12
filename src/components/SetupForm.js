import React, { useState } from 'react';

const SetupForm = ({ initialSettings, onSave }) => {
  const [frequency, setFrequency] = useState(initialSettings.reminderFrequency);
  const [start, setStart] = useState(initialSettings.workSchedule.start);
  const [end, setEnd] = useState(initialSettings.workSchedule.end);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ reminderFrequency: parseInt(frequency, 10), workSchedule: { start, end } });
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>Настройки</h3>
      <label>
        Частота (мин):
        <input type="number" value={frequency} onChange={e => setFrequency(e.target.value)} min="5" />
      </label>
      <label>
        Начало:
        <input type="time" value={start} onChange={e => setStart(e.target.value)} />
      </label>
      <label>
        Конец:
        <input type="time" value={end} onChange={e => setEnd(e.target.value)} />
      </label>
      <button type="submit">Сохранить</button>
    </form>
  );
};

export default SetupForm;
