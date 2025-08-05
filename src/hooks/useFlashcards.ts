import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Flashcard, StudyFolder } from '../types/flashcard';

const STORAGE_KEY = 'study-flashcards';
const FOLDERS_STORAGE_KEY = 'study-folders';

// Default folders
const DEFAULT_FOLDERS: StudyFolder[] = [
  {
    id: 'behavioral',
    name: 'Behavioral Interviews',
    description: 'Questions about past experiences, leadership, teamwork, and problem-solving',
    color: '#667eea',
    icon: '👥',
    createdAt: new Date(),
  },
  {
    id: 'technical',
    name: 'Technical Questions',
    description: 'Coding problems, system design, and technical concepts',
    color: '#f59e0b',
    icon: '💻',
    createdAt: new Date(),
  },
  {
    id: 'general',
    name: 'General Review',
    description: 'General knowledge, company research, and miscellaneous topics',
    color: '#22c55e',
    icon: '📚',
    createdAt: new Date(),
  },
  {
    id: 'system-design',
    name: 'System Design',
    description: 'Architecture, scalability, and system design concepts',
    color: '#ef4444',
    icon: '🏗️',
    createdAt: new Date(),
  },
];

export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [folders, setFolders] = useState<StudyFolder[]>(DEFAULT_FOLDERS);
  const [currentFolder, setCurrentFolder] = useState<string>('general');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load flashcards and folders from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedFolders = localStorage.getItem(FOLDERS_STORAGE_KEY);
    
    console.log('Loading flashcards from localStorage:', stored);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects and add folder field if missing
        const cards = parsed.map((card: any) => ({
          ...card,
          folder: card.folder || 'general', // Default to general folder for existing cards
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

    // Load folders
    if (storedFolders) {
      try {
        const parsedFolders = JSON.parse(storedFolders);
        const foldersWithDates = parsedFolders.map((folder: any) => ({
          ...folder,
          createdAt: new Date(folder.createdAt),
        }));
        setFolders(foldersWithDates);
      } catch (error) {
        console.error('Error loading folders:', error);
        setFolders(DEFAULT_FOLDERS);
      }
    } else {
      setFolders(DEFAULT_FOLDERS);
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

  // Save folders to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
        console.log(`Saved ${folders.length} folders to localStorage`);
      } catch (error) {
        console.error('Error saving folders:', error);
      }
    }
  }, [folders, isLoaded]);

  const addFlashcard = (question: string, answer: string, category: string = '', folder: string = 'general') => {
    const newCard: Flashcard = {
      id: uuidv4(),
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim(),
      folder: folder || currentFolder,
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

  const getCategoriesByFolder = (folderId: string) => {
    const folderCards = getCardsByFolder(folderId);
    const categories = new Set(folderCards.map(card => card.category).filter(Boolean));
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

  // Folder management functions
  const addFolder = (name: string, description: string, color: string, icon: string) => {
    const newFolder: StudyFolder = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
      createdAt: new Date(),
    };
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<StudyFolder>) => {
    setFolders(prev =>
      prev.map(folder =>
        folder.id === id ? { ...folder, ...updates } : folder
      )
    );
  };

  const deleteFolder = (id: string) => {
    // Move all cards from this folder to general folder
    setFlashcards(prev =>
      prev.map(card =>
        card.folder === id ? { ...card, folder: 'general' } : card
      )
    );
    // Remove the folder
    setFolders(prev => prev.filter(folder => folder.id !== id));
    // If current folder is being deleted, switch to general
    if (currentFolder === id) {
      setCurrentFolder('general');
    }
  };

  const getCardsByFolder = (folderId: string = '') => {
    if (!folderId) return flashcards;
    return flashcards.filter(card => card.folder === folderId);
  };

  const getFolderById = (id: string) => {
    return folders.find(folder => folder.id === id);
  };

  const getFolderStats = (folderId: string) => {
    const folderCards = getCardsByFolder(folderId);
    return {
      total: folderCards.length,
      reviewed: folderCards.filter(card => card.lastReviewed).length,
      easy: folderCards.filter(card => card.difficulty === 'easy').length,
      medium: folderCards.filter(card => card.difficulty === 'medium').length,
      hard: folderCards.filter(card => card.difficulty === 'hard').length,
    };
  };

  return {
    flashcards,
    folders,
    currentFolder,
    setCurrentFolder,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    markAsReviewed,
    getCategories,
    getCategoriesByFolder,
    getCardsByCategory,
    getCardsByFolder,
    searchCards,
    shuffleCards,
    importFlashcards,
    addFolder,
    updateFolder,
    deleteFolder,
    getFolderById,
    getFolderStats,
  };
};
