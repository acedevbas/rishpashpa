import React, { useState } from 'react';
import ExercisePlayer from './ExercisePlayer.js';
import { markWorkout } from '../services/storage.js';

const ExerciseList = ({ exercises, onComplete }) => {
  const [index, setIndex] = useState(0);

  const handleDone = () => {
    const ex = exercises[index];
    markWorkout(ex.id, 'completed');
    if (index + 1 < exercises.length) {
      setIndex(index + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div>
      {index < exercises.length && (
        <ExercisePlayer exercise={exercises[index]} onDone={handleDone} />
      )}
    </div>
  );
};

export default ExerciseList;
