import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, AlertCircle, Shuffle, CheckCircle} from 'lucide-react';
import type { Flashcard, StudyFolder } from '../types/flashcard';
import MarkdownText from './MarkdownText';

interface PersistentState {
  studyCurrentIndex: number;
  studySelectedCategory: string;
  studyFolder: string;
  studyIsFlipped: boolean;
  manageSearchQuery: string;
  manageSelectedCategory: string;
  manageSelectedFolder: string;
  manageSortField: 'question' | 'category' | 'difficulty' | 'createdAt';
  manageSortDirection: 'asc' | 'desc';
  manageExpandedCard: string | null;
}

interface StudyTabProps {
  flashcards: Flashcard[];
  folders: StudyFolder[];
  currentFolder: string;
  setCurrentFolder: (folderId: string) => void;
  getCategories: () => string[];
  getCardsByCategory: (category: string) => Flashcard[];
  getCardsByFolder: (folderId: string) => Flashcard[];
  shuffleCards: (cards: Flashcard[]) => Flashcard[];
  markAsReviewed: (id: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  getFolderById: (id: string) => StudyFolder | undefined;
  persistentState: {
    state: PersistentState;
    updateState: (updates: Partial<PersistentState>) => void;
    resetState: () => void;
  };
}

const StudyTab: React.FC<StudyTabProps> = ({
  flashcards,
  folders,
  // currentFolder,
  getCategories,
  getCardsByCategory,
  getCardsByFolder,
  shuffleCards,
  markAsReviewed,
  updateFlashcard,
  // getFolderById,
  persistentState,
}) => {
  const [currentCards, setCurrentCards] = useState<Flashcard[]>([]);
  const [showEditor, setShowEditor] = useState(false);

  const categories = getCategories();
  
  // Use persistent state
  const currentIndex = persistentState.state.studyCurrentIndex;
  const isFlipped = persistentState.state.studyIsFlipped;
  const selectedCategory = persistentState.state.studySelectedCategory;
  const studyFolder = persistentState.state.studyFolder;

  // Initialize cards when component mounts or folder/category changes
  useEffect(() => {
    let cards: Flashcard[];
    
    if (studyFolder === 'all') {
      // Show all cards across all folders
      cards = selectedCategory ? flashcards.filter(card => card.category === selectedCategory) : flashcards;
    } else {
      // Show cards from specific folder
      const folderCards = flashcards.filter(card => card.folder === studyFolder);
      cards = selectedCategory ? folderCards.filter(card => card.category === selectedCategory) : folderCards;
    }
    
    setCurrentCards(cards);
    persistentState.updateState({ studyCurrentIndex: 0, studyIsFlipped: false });
  }, [studyFolder, selectedCategory, flashcards]);

  const currentCard = currentCards[currentIndex];

  const handleShuffle = () => {
    let cards: Flashcard[];
    
    if (studyFolder === 'all') {
      cards = selectedCategory ? getCardsByCategory(selectedCategory) : flashcards;
    } else {
      const folderCards = getCardsByFolder(studyFolder);
      cards = selectedCategory ? folderCards.filter(card => card.category === selectedCategory) : folderCards;
    }
    
    const shuffled = shuffleCards(cards);
    setCurrentCards(shuffled);
    persistentState.updateState({ studyCurrentIndex: 0, studyIsFlipped: false });
  };

  const handleNext = () => {
    if (currentIndex < currentCards.length - 1) {
      persistentState.updateState({ 
        studyCurrentIndex: currentIndex + 1, 
        studyIsFlipped: false 
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      persistentState.updateState({ 
        studyCurrentIndex: currentIndex - 1, 
        studyIsFlipped: false 
      });
    }
  };

  const handleFlip = () => {
    persistentState.updateState({ studyIsFlipped: !isFlipped });
  };

  const handleDifficultyMark = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (currentCard) {
      markAsReviewed(currentCard.id, difficulty);
      // Auto advance to next card
      setTimeout(() => {
        if (currentIndex < currentCards.length - 1) {
          handleNext();
        }
      }, 500);
    }
  };

  if (flashcards.length === 0) {
    return (
      <div className="study-tab">
        <div className="no-cards">
          <AlertCircle size={48} />
          <h3>No flashcards available</h3>
          <p>Add some cards first to start studying!</p>
        </div>
      </div>
    );
  }

  if (currentCards.length === 0) {
    return (
      <div className="study-tab">
        <div className="study-header">
          <h2>Study Mode</h2>
          <div className="study-controls">
            <select
              value={studyFolder}
              onChange={(e) => persistentState.updateState({ studyFolder: e.target.value })}
              className="category-select"
            >
              <option value="all">All Folders</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.icon} {folder.name}
                </option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => persistentState.updateState({ studySelectedCategory: e.target.value })}
              className="category-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="no-cards">
          <AlertCircle size={48} />
          <h3>No cards found</h3>
          <p>Try selecting a different folder/category or add more cards.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="study-tab">
      <div className="study-header">
        <h2>Study Mode</h2>
        <div className="study-controls">
          <select
            value={studyFolder}
            onChange={(e) => persistentState.updateState({ studyFolder: e.target.value })}
            className="category-select"
          >
            <option value="all">All Folders</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>
                {folder.icon} {folder.name}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => persistentState.updateState({ studySelectedCategory: e.target.value })}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button onClick={handleShuffle} className="btn btn-secondary">
            <Shuffle size={16} />
            Shuffle
          </button>
        </div>
      </div>

      <div className="flashcard-container">
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
          {/* Edit Button - positioned outside the flipping content */}
          <button
            className="edit-button"
            onClick={(e) => {
              e.stopPropagation(); // prevent card from flipping
              setShowEditor(true);
            }}
          >
            ✏️
          </button>
          
          <div className="flashcard-inner" onClick={handleFlip}>
            <div className="flashcard-front">
              {/* Category on front */}
              <div className="card-category">
                {currentCard.category}
              </div>
              <div className="card-content">
                <div className="card-text">
                  <MarkdownText>{currentCard.question}</MarkdownText>
                </div>
              </div>
              <div className="flip-hint">Click to reveal answer</div>
            </div>
            <div className="flashcard-back">
              {/* Category on back */}
              <div className="card-category">
                {currentCard.category}
              </div>
              <div className="card-content">
                <div className="card-text">
                  <MarkdownText>{currentCard.answer}</MarkdownText>
                </div>
              </div>
              <div className="flip-hint">Click to see question</div>
            </div>
          </div>
        </div>
      </div>
      {showEditor && (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Flashcard</h3>
        <div className="form-group">
          <label>Question</label>
          <textarea
            value={currentCard.question}
            onChange={(e) =>
              setCurrentCards((prev) =>
                prev.map((c, i) =>
                  i === currentIndex ? { ...c, question: e.target.value } : c
                )
              )
            }
          />
        </div>
        <div className="form-group">
          <label>Answer</label>
          <textarea
            value={currentCard.answer}
            onChange={(e) =>
              setCurrentCards((prev) =>
                prev.map((c, i) =>
                  i === currentIndex ? { ...c, answer: e.target.value } : c
                )
              )
            }
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            value={currentCard.category}
            onChange={(e) =>
              setCurrentCards((prev) =>
                prev.map((c, i) =>
                  i === currentIndex ? { ...c, category: e.target.value } : c
                )
              )
            }
          />
        </div>
        <div className="form-group">
          <label>Folder</label>
          <select
            value={currentCard.folder || 'general'}
            onChange={(e) =>
              setCurrentCards((prev) =>
                prev.map((c, i) =>
                  i === currentIndex ? { ...c, folder: e.target.value } : c
                )
              )
            }
            className="folder-select"
          >
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>
                {folder.icon} {folder.name}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowEditor(false)}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              // Save changes to the main flashcards array
              updateFlashcard(currentCard.id, {
                question: currentCard.question,
                answer: currentCard.answer,
                category: currentCard.category,
                folder: currentCard.folder,
              });
              setShowEditor(false);
            }}
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  )}

      <div className="study-navigation">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="btn btn-secondary"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        
        <span className="card-counter">
          {currentIndex + 1} / {currentCards.length}
        </span>
        
        <button
          onClick={handleNext}
          disabled={currentIndex === currentCards.length - 1}
          className="btn btn-secondary"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      {isFlipped && (
        <div className="study-actions">
          <button
            onClick={() => handleDifficultyMark('easy')}
            className="btn btn-success"
          >
            <CheckCircle size={16} />
            Easy
          </button>
          <button
            onClick={() => handleDifficultyMark('medium')}
            className="btn btn-warning"
          >
            <RotateCcw size={16} />
            Medium
          </button>
          <button
            onClick={() => handleDifficultyMark('hard')}
            className="btn btn-danger"
          >
            <AlertCircle size={16} />
            Hard
          </button>
        </div>
      )}
    </div>
  );
};

export default StudyTab;
