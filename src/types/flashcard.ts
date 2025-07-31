export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: Date;
  lastReviewed?: Date;
  difficulty: 'easy' | 'medium' | 'hard';
  reviewCount: number;
}

export interface StudySession {
  currentIndex: number;
  cards: Flashcard[];
  isFlipped: boolean;
  showAnswer: boolean;
}

export type TabType = 'add' | 'study' | 'manage';
