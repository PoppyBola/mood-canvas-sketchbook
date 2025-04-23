
import React from 'react';
import { Button } from '@/components/ui/button';

interface MoodErrorProps {
  error: Error;
  onBack: () => void;
}

const MoodError: React.FC<MoodErrorProps> = ({ error, onBack }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h2 className="text-xl font-bold">Oops!</h2>
      <p className="text-center">Something went wrong: {error.message}</p>
      <Button onClick={onBack}>Try Again</Button>
    </div>
  );
};

export default MoodError;
