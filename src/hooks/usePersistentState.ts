import { useState, useEffect } from 'react';

interface PersistentState {
  // Study Tab state
  studyCurrentIndex: number;
  studySelectedCategory: string;
  studyFolder: string;
  studyIsFlipped: boolean;
  
  // Manage Tab state
  manageSearchQuery: string;
  manageSelectedCategory: string;
  manageSelectedFolder: string;
  manageSortField: 'question' | 'category' | 'difficulty' | 'createdAt';
  manageSortDirection: 'asc' | 'desc';
  manageExpandedCard: string | null;
}

const defaultState: PersistentState = {
  studyCurrentIndex: 0,
  studySelectedCategory: '',
  studyFolder: 'all',
  studyIsFlipped: false,
  manageSearchQuery: '',
  manageSelectedCategory: '',
  manageSelectedFolder: 'all',
  manageSortField: 'createdAt',
  manageSortDirection: 'desc',
  manageExpandedCard: null,
};

const STORAGE_KEY = 'flashcards-ui-state';

export const usePersistentState = () => {
  const [state, setState] = useState<PersistentState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
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
