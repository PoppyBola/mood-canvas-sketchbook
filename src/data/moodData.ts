
export interface MoodData {
  moodKeyword: string;
  imagePlaceholder: string;
  quote: string;
  quoteAuthor: string;
  gradientClasses: string[];
}

export const localMoodData: MoodData[] = [
  {
    moodKeyword: "happy",
    imagePlaceholder: "https://picsum.photos/seed/happyday/800/1000",
    quote: "Happiness is not something ready made. It comes from your own actions.",
    quoteAuthor: "Dalai Lama",
    gradientClasses: ["from-amber-100", "to-orange-200"]
  },
  {
    moodKeyword: "calm",
    imagePlaceholder: "https://picsum.photos/seed/calmwaters/800/1000",
    quote: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.",
    quoteAuthor: "Hermann Hesse",
    gradientClasses: ["from-sky-100", "to-blue-200"]
  },
  {
    moodKeyword: "inspired",
    imagePlaceholder: "https://picsum.photos/seed/inspiredart/800/1000",
    quote: "The best way to predict the future is to invent it.",
    quoteAuthor: "Alan Kay",
    gradientClasses: ["from-purple-100", "to-indigo-200"]
  },
  {
    moodKeyword: "curious",
    imagePlaceholder: "https://picsum.photos/seed/curiousmind/800/1000",
    quote: "The important thing is not to stop questioning.",
    quoteAuthor: "Albert Einstein",
    gradientClasses: ["from-emerald-100", "to-teal-200"]
  },
  {
    moodKeyword: "grateful",
    imagePlaceholder: "https://picsum.photos/seed/gratefulheart/800/1000",
    quote: "Gratitude turns what we have into enough.",
    quoteAuthor: "Anonymous",
    gradientClasses: ["from-rose-100", "to-pink-200"]
  }
];

export const defaultArtData: MoodData = {
  moodKeyword: "expressive",
  imagePlaceholder: "https://picsum.photos/seed/defaultcanvas/800/1000",
  quote: "Every artist dips his brush in his own soul.",
  quoteAuthor: "Henry Ward Beecher",
  gradientClasses: ["from-gray-100", "to-slate-200"]
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
