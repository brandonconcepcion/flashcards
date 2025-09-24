import { useState, useEffect } from 'react';

export interface PersistentState {
  // Study Tab state
  studyCurrentIndex: number;
  studySelectedCategories: string[];
  studyFolder: string;
  studyIsFlipped: boolean;
  
  // Manage Tab state
  manageSearchQuery: string;
  manageSelectedCategory: string;
  manageSelectedFolder: string;
  manageSortField: 'question' | 'category' | 'difficulty' | 'createdAt';
  manageSortDirection: 'asc' | 'desc';
  manageExpandedCard: string | null;
  
  // Add Card Tab state - persistent category per folder
  addCardLastCategory: Record<string, string>; // folderId -> last used category
  addCardSelectedFolder: string;
}

const defaultState: PersistentState = {
  studyCurrentIndex: 0,
  studySelectedCategories: [],
  studyFolder: 'all',
  studyIsFlipped: false,
  manageSearchQuery: '',
  manageSelectedCategory: '',
  manageSelectedFolder: 'all',
  manageSortField: 'createdAt',
  manageSortDirection: 'desc',
  manageExpandedCard: null,
  addCardLastCategory: {},
  addCardSelectedFolder: 'general',
};

const STORAGE_KEY = 'flashcards-ui-state';

export const usePersistentState = () => {
  const [state, setState] = useState<PersistentState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Migration: Convert old studySelectedCategory to studySelectedCategories
        if (parsed.studySelectedCategory && !parsed.studySelectedCategories) {
          parsed.studySelectedCategories = parsed.studySelectedCategory ? [parsed.studySelectedCategory] : [];
          delete parsed.studySelectedCategory;
        }
        
        return { ...defaultState, ...parsed };
      }
      return defaultState;
    } catch {
      return defaultState;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save UI state to localStorage:', error);
    }
  }, [state]);

  const updateState = (updates: Partial<PersistentState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    state,
    updateState,
    resetState,
  };
};
