
export const getSessionStreak = (): number => {
  const streak = sessionStorage.getItem('moodSessionStreak');
  return streak ? parseInt(streak, 10) : 0;
};

export const incrementSessionStreak = (): number => {
  const currentStreak = getSessionStreak();
  const newStreak = currentStreak + 1;
  sessionStorage.setItem('moodSessionStreak', newStreak.toString());
  return newStreak;
};
