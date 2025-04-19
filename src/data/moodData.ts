
export interface MoodData {
  moodKeyword: string;
  imagePlaceholder: string;
  quote: string;
  quoteAuthor: string;
}

export const localMoodData: MoodData[] = [
  {
    moodKeyword: "happy",
    imagePlaceholder: "https://picsum.photos/seed/happyday/800/1000",
    quote: "Happiness is not something ready made. It comes from your own actions.",
    quoteAuthor: "Dalai Lama"
  },
  {
    moodKeyword: "calm",
    imagePlaceholder: "https://picsum.photos/seed/calmwaters/800/1000",
    quote: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.",
    quoteAuthor: "Hermann Hesse"
  },
  {
    moodKeyword: "inspired",
    imagePlaceholder: "https://picsum.photos/seed/inspiredart/800/1000",
    quote: "The best way to predict the future is to invent it.",
    quoteAuthor: "Alan Kay"
  },
  {
    moodKeyword: "curious",
    imagePlaceholder: "https://picsum.photos/seed/curiousmind/800/1000",
    quote: "The important thing is not to stop questioning.",
    quoteAuthor: "Albert Einstein"
  },
  {
    moodKeyword: "grateful",
    imagePlaceholder: "https://picsum.photos/seed/gratefulheart/800/1000",
    quote: "Gratitude turns what we have into enough.",
    quoteAuthor: "Anonymous"
  }
];

export const defaultArtData: MoodData = {
  moodKeyword: "expressive",
  imagePlaceholder: "https://picsum.photos/seed/defaultcanvas/800/1000",
  quote: "Every artist dips his brush in his own soul.",
  quoteAuthor: "Henry Ward Beecher"
};

export function findArtForMood(mood: string): MoodData {
  const trimmedMood = mood.toLowerCase().trim();
  if (!trimmedMood) return defaultArtData;
  return (
    localMoodData.find((item) => 
      trimmedMood.includes(item.moodKeyword)
    ) || defaultArtData
  );
}

