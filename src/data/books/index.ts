// Define the interface here to avoid module resolution issues
export interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  asin: string;
  link: string;
}

import { englishBooksByType } from "./englishBooks";
import { portugueseBooksByType } from "./portugueseBooks";
import { spanishBooksByType } from "./spanishBooks";

// Centralized book data access
export const booksByLanguage: Record<
  string,
  Record<string, BookRecommendation[]>
> = {
  en: englishBooksByType,
  "pt-BR": portugueseBooksByType,
  es: spanishBooksByType,
};

// Helper function to get book recommendations by language and type
export const getBookRecommendations = (
  language: string,
  debateType: string
): BookRecommendation[] => {
  const languageBooks = booksByLanguage[language] || booksByLanguage.en;
  return languageBooks[debateType] || languageBooks.couple;
};

// Export individual language books for direct access if needed
export { englishBooksByType, portugueseBooksByType, spanishBooksByType };
