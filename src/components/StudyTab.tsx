import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  Shuffle,
  CheckCircle,
} from "lucide-react";
import type { Flashcard, StudyFolder } from "../types/flashcard";
import MarkdownText from "./MarkdownText";

interface PersistentState {
  studyCurrentIndex: number;
  studySelectedCategory: string;
  studyFolder: string;
  studyIsFlipped: boolean;
  manageSearchQuery: string;
  manageSelectedCategory: string;
  manageSelectedFolder: string;
  manageSortField: "question" | "category" | "difficulty" | "createdAt";
  manageSortDirection: "asc" | "desc";
  manageExpandedCard: string | null;
}

interface StudyTabProps {
  flashcards: Flashcard[];
  folders: StudyFolder[];
  currentFolder: string;
  setCurrentFolder: (folderId: string) => void;
  getCategoriesByFolder: (folderId: string) => string[];
  getCardsByCategory: (category: string) => Flashcard[];
  getCardsByFolder: (folderId: string) => Flashcard[];
  shuffleCards: (cards: Flashcard[]) => Flashcard[];
  markAsReviewed: (id: string, difficulty: "easy" | "medium" | "hard") => void;
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
  currentFolder,
  getCategoriesByFolder,
  getCardsByCategory,
  getCardsByFolder,
  shuffleCards,
  markAsReviewed,
  updateFlashcard,
  getFolderById,
  persistentState,
}) => {
  const [currentCards, setCurrentCards] = useState<Flashcard[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [isNavigating] = useState(false);
  const [skipFlipAnimation, setSkipFlipAnimation] = useState(false);
  const isShuffledRef = useRef(false);

  const categories = getCategoriesByFolder(currentFolder);

  // Use persistent state
  const currentIndex = persistentState.state.studyCurrentIndex;
  const isFlipped = persistentState.state.studyIsFlipped;
  const selectedCategory = persistentState.state.studySelectedCategory;
  const studyFolder = persistentState.state.studyFolder;

  // Initialize cards when component mounts or folder/category changes
  useEffect(() => {
    // Reset shuffle state when folder/category changes
    isShuffledRef.current = false;

    let cards: Flashcard[];

    if (studyFolder === "all") {
      // Show all cards across all folders
      cards = selectedCategory
        ? flashcards.filter((card) => card.category === selectedCategory)
        : flashcards;
    } else {
      // Show cards from specific folder
      const folderCards = flashcards.filter(
        (card) => card.folder === studyFolder
      );
      cards = selectedCategory
        ? folderCards.filter((card) => card.category === selectedCategory)
        : folderCards;
    }

    setCurrentCards(cards);
    persistentState.updateState({
      studyCurrentIndex: 0,
      studyIsFlipped: false,
    });
  }, [studyFolder, selectedCategory]);

  const currentCard = currentCards[currentIndex];

  const handleShuffle = () => {
    let cards: Flashcard[];

    if (studyFolder === "all") {
      cards = selectedCategory
        ? getCardsByCategory(selectedCategory)
        : flashcards;
    } else {
      const folderCards = getCardsByFolder(studyFolder);
      cards = selectedCategory
        ? folderCards.filter((card) => card.category === selectedCategory)
        : folderCards;
    }

    const shuffled = shuffleCards(cards);
    setCurrentCards(shuffled);
    isShuffledRef.current = true;
    persistentState.updateState({
      studyCurrentIndex: 0,
      studyIsFlipped: false,
    });
  };

  const handleNext = () => {
    if (currentIndex < currentCards.length - 1) {
      // If card is flipped, disable flip animation completely
      if (isFlipped) {
        setSkipFlipAnimation(true);
        persistentState.updateState({
          studyCurrentIndex: currentIndex + 1,
          studyIsFlipped: false,
        });
        // Reset after state update
        setTimeout(() => setSkipFlipAnimation(false), 50);
      } else {
        // Normal navigation when on front
        persistentState.updateState({
          studyCurrentIndex: currentIndex + 1,
          studyIsFlipped: false,
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      // If card is flipped, disable flip animation completely
      if (isFlipped) {
        setSkipFlipAnimation(true);
        persistentState.updateState({
          studyCurrentIndex: currentIndex - 1,
          studyIsFlipped: false,
        });
        // Reset after state update
        setTimeout(() => setSkipFlipAnimation(false), 50);
      } else {
        // Normal navigation when on front
        persistentState.updateState({
          studyCurrentIndex: currentIndex - 1,
          studyIsFlipped: false,
        });
      }
    }
  };

  const handleFlip = () => {
    persistentState.updateState({ studyIsFlipped: !isFlipped });
  };

  const handleDifficultyMark = (difficulty: "easy" | "medium" | "hard") => {
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
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginBottom: "8px",
            padding: "12px",
            background: "var(--bg-secondary)",
            borderRadius: "8px",
            border: "1px solid var(--border-primary)",
          }}
        >
          <select
            value={studyFolder}
            onChange={(e) =>
              persistentState.updateState({ studyFolder: e.target.value })
            }
            className="category-select"
            style={{ minWidth: "150px" }}
          >
            <option value="all">All Folders</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.icon} {folder.name}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) =>
              persistentState.updateState({
                studySelectedCategory: e.target.value,
              })
            }
            className="category-select"
            style={{ minWidth: "120px" }}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
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
      {/* Folder Display Section */}
      <div className="folder-management-section">
        <div className="folder-selector">
          <label>Studying:</label>
          <div className="folder-switcher">
            <select
              value={studyFolder}
              onChange={(e) =>
                persistentState.updateState({ studyFolder: e.target.value })
              }
              className="folder-dropdown"
            >
              <option value="all">All Folders</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
            <div className="folder-display">
              {(() => {
                if (studyFolder === "all") {
                  return (
                    <>
                      <div
                        className="folder-icon-display"
                        style={{ backgroundColor: "#6b7280" }}
                      >
                        <span className="folder-icon-emoji">📚</span>
                      </div>
                      <span className="folder-name">All Folders</span>
                    </>
                  );
                }

                const currentFolderData = getFolderById(studyFolder);
                if (!currentFolderData) return null;

                const isImage =
                  currentFolderData.icon &&
                  currentFolderData.icon.startsWith("data:");

                return (
                  <>
                    <div
                      className="folder-icon-display"
                      style={{ backgroundColor: currentFolderData.color }}
                    >
                      {isImage ? (
                        <img
                          src={currentFolderData.icon}
                          alt={currentFolderData.name}
                          className="folder-icon-image"
                        />
                      ) : (
                        <span className="folder-icon-emoji">
                          {currentFolderData.icon}
                        </span>
                      )}
                    </div>
                    <span className="folder-name">
                      {currentFolderData.name}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "16px",
          padding: "12px",
          background: "var(--bg-secondary)",
          borderRadius: "8px",
          border: "1px solid var(--border-primary)",
        }}
      >
        <select
          value={selectedCategory}
          onChange={(e) =>
            persistentState.updateState({
              studySelectedCategory: e.target.value,
            })
          }
          className="category-select"
          style={{ minWidth: "120px" }}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <button
          onClick={handleShuffle}
          className="btn btn-secondary"
          style={{
            padding: "6px 12px",
            fontSize: "0.9rem",
            background: "var(--card-bg)",
            border: "1px solid var(--border-primary)",
            color: "var(--text-primary)",
          }}
        >
          <Shuffle size={16} />
          Shuffle
        </button>
      </div>

      <div
        className="flashcard-container"
        style={{ flexDirection: "column", gap: "20px" }}
      >
        <div className={`flashcard ${isFlipped ? "flipped" : ""}`}>
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

          <div
            className={`flashcard-inner ${isNavigating ? "navigating" : ""} ${
              skipFlipAnimation ? "no-flip" : ""
            }`}
            onClick={handleFlip}
          >
            <div className="flashcard-front">
              {/* Category on front */}
              <div className="card-category">{currentCard.category}</div>
              <div className="card-content">
                <div className="card-text">
                  <MarkdownText>{currentCard.question}</MarkdownText>
                </div>
              </div>
              <div className="flip-hint">Click to reveal answer</div>
            </div>
            <div className="flashcard-back">
              {/* Category on back */}
              <div className="card-category">{currentCard.category}</div>
              <div className="card-content">
                <div className="card-text">
                  <MarkdownText>{currentCard.answer}</MarkdownText>
                </div>
              </div>
              <div className="flip-hint">Click to see question</div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="nav-btn"
            title="Previous card"
            style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
          >
            <ChevronLeft size={16} />
          </button>

          <span
            style={{
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              minWidth: "60px",
              textAlign: "center",
            }}
          >
            {currentIndex + 1} / {currentCards.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex === currentCards.length - 1}
            className="nav-btn"
            title="Next card"
            style={{
              opacity: currentIndex === currentCards.length - 1 ? 0.3 : 1,
            }}
          >
            <ChevronRight size={16} />
          </button>
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
                      i === currentIndex
                        ? { ...c, question: e.target.value }
                        : c
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
                      i === currentIndex
                        ? { ...c, category: e.target.value }
                        : c
                    )
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>Folder</label>
              <select
                value={currentCard.folder || "general"}
                onChange={(e) =>
                  setCurrentCards((prev) =>
                    prev.map((c, i) =>
                      i === currentIndex ? { ...c, folder: e.target.value } : c
                    )
                  )
                }
                className="folder-select"
              >
                {folders.map((folder) => (
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

      {isFlipped && (
        <div className="study-actions">
          <button
            onClick={() => handleDifficultyMark("easy")}
            className="btn btn-success"
          >
            <CheckCircle size={16} />
            Easy
          </button>
          <button
            onClick={() => handleDifficultyMark("medium")}
            className="btn btn-warning"
          >
            <RotateCcw size={16} />
            Medium
          </button>
          <button
            onClick={() => handleDifficultyMark("hard")}
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
