import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Flashcard } from '../types/flashcard';

const STORAGE_KEY = 'study-flashcards';

export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load flashcards from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Loading flashcards from localStorage:', stored);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const cards = parsed.map((card: any) => ({
          ...card,
          createdAt: new Date(card.createdAt),
          lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
        }));
        console.log(`Loaded ${cards.length} flashcards from localStorage`);
        setFlashcards(cards);
      } catch (error) {
        console.error('Error loading flashcards:', error);
        setFlashcards([]);
      }
    } else {
      console.log('No flashcards found in localStorage, starting with empty array');
      setFlashcards([]);
    }
    setIsLoaded(true);
  }, []);

  // Save flashcards to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(flashcards));
        console.log(`Saved ${flashcards.length} flashcards to localStorage`);
      } catch (error) {
        console.error('Error saving flashcards:', error);
      }
    }
  }, [flashcards, isLoaded]);

  const addFlashcard = (question: string, answer: string, category: string = '') => {
    const newCard: Flashcard = {
      id: uuidv4(),
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim(),
      createdAt: new Date(),
      difficulty: 'medium',
      reviewCount: 0,
    };

    setFlashcards(prev => [...prev, newCard]);
    return newCard;
  };

  const updateFlashcard = (id: string, updates: Partial<Flashcard>) => {
    setFlashcards(prev =>
      prev.map(card =>
        card.id === id ? { ...card, ...updates } : card
      )
    );
  };

  const deleteFlashcard = (id: string) => {
    setFlashcards(prev => prev.filter(card => card.id !== id));
  };

  const markAsReviewed = (id: string, difficulty: 'easy' | 'medium' | 'hard') => {
    const card = flashcards.find(c => c.id === id);
    updateFlashcard(id, {
      lastReviewed: new Date(),
      difficulty,
      reviewCount: (card?.reviewCount ?? 0) + 1,
    });
  };

  const getCategories = () => {
    const categories = new Set(flashcards.map(card => card.category).filter(Boolean));
    return Array.from(categories).sort();
  };

  const getCardsByCategory = (category: string = '') => {
    if (!category) return flashcards;
    return flashcards.filter(card => card.category === category);
  };

  const searchCards = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return flashcards.filter(
      card =>
        card.question.toLowerCase().includes(lowercaseQuery) ||
        card.answer.toLowerCase().includes(lowercaseQuery) ||
        card.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  const shuffleCards = (cards: Flashcard[]) => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const importFlashcards = (newCards: Flashcard[]) => {
    setFlashcards(prev => [...prev, ...newCards]);
  };

  return {
    flashcards,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    markAsReviewed,
    getCategories,
    getCardsByCategory,
    searchCards,
    shuffleCards,
    importFlashcards,
  };
};
