import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, AlertCircle, Shuffle, CheckCircle, Folder } from 'lucide-react';
import type { Flashcard, StudyFolder } from '../types/flashcard';
import MarkdownText from './MarkdownText';

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
}

const StudyTab: React.FC<StudyTabProps> = ({
  flashcards,
  folders,
  currentFolder,
  getCategories,
  getCardsByCategory,
  getCardsByFolder,
  shuffleCards,
  markAsReviewed,
  updateFlashcard,
}) => {
  const [currentCards, setCurrentCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [studyFolder, setStudyFolder] = useState(currentFolder);

  const categories = getCategories();
  const [showEditor, setShowEditor] = useState(false);

  // Initialize cards when component mounts or folder/category changes
  useEffect(() => {
    let cards: Flashcard[];
    
    if (studyFolder === 'all') {
      // Show all cards across all folders
      cards = selectedCategory ? getCardsByCategory(selectedCategory) : flashcards;
    } else {
      // Show cards from specific folder
      const folderCards = getCardsByFolder(studyFolder);
      cards = selectedCategory ? folderCards.filter(card => card.category === selectedCategory) : folderCards;
    }
    
    setCurrentCards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [studyFolder, selectedCategory, flashcards, getCardsByCategory, getCardsByFolder]);

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
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    if (currentIndex < currentCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
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
              onChange={(e) => setStudyFolder(e.target.value)}
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
              onChange={(e) => setSelectedCategory(e.target.value)}
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
            onChange={(e) => setStudyFolder(e.target.value)}
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
            onChange={(e) => setSelectedCategory(e.target.value)}
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
        <button 
          className="btn btn-primary" 
          onClick={() => {
            // Save changes to the main flashcards array
            updateFlashcard(currentCard.id, {
              question: currentCard.question,
              answer: currentCard.answer,
              category: currentCard.category,
            });
            setShowEditor(false);
          }}
        >
          Save & Close
        </button>
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
