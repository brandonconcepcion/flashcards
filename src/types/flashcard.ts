export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  folder: string; // New field for organizing cards into folders/modes
  createdAt: Date;
  lastReviewed?: Date;
  difficulty: 'easy' | 'medium' | 'hard';
  reviewCount: number;
}

export interface StudyFolder {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface StudySession {
  currentIndex: number;
  cards: Flashcard[];
  isFlipped: boolean;
  showAnswer: boolean;
}

export type TabType = 'add' | 'study' | 'manage' | 'folders';
