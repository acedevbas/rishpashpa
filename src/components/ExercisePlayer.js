import React, { useState, useEffect } from 'react';

const ExercisePlayer = ({ exercise, onDone }) => {
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(exercise.duration);

  useEffect(() => {
    if (!started) return;
    if (count <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(t);
  }, [started, count]);

  if (!started) {
    return (
      <div className="card">
        <h4>{exercise.title}</h4>
        <img src={exercise.mediaUrl} alt={exercise.title} width="200" />
        <p>{exercise.instructions}</p>
        <button onClick={() => setStarted(true)}>Начать</button>
      </div>
    );
  }

  return (
    <div className="card">
      <h4>{exercise.title}</h4>
      <p>Осталось: {count} сек.</p>
    </div>
  );
};

export default ExercisePlayer;
