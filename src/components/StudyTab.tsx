import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  Shuffle,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import type { Flashcard, StudyFolder } from "../types/flashcard";
import MarkdownText from "./MarkdownText";
import type { PersistentState } from "../hooks/usePersistentState";

interface StudyTabProps {
  flashcards: Flashcard[];
  folders: StudyFolder[];
  getCategories: () => string[];
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
  getCategories,
  getCategoriesByFolder,
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDifficultyDropdownOpen, setIsDifficultyDropdownOpen] =
    useState(false);
  const isShuffledRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);

  // Use persistent state
  const currentIndex = persistentState.state.studyCurrentIndex;
  const isFlipped = persistentState.state.studyIsFlipped;
  const selectedCategories = persistentState.state.studySelectedCategories;
  const selectedDifficulties = persistentState.state.studySelectedDifficulties;
  const studyFolder = persistentState.state.studyFolder;

  const categories =
    studyFolder === "all"
      ? getCategories()
      : getCategoriesByFolder(studyFolder);

  const difficultyOptions = ["Easy", "Medium", "Hard"];

  // Clear selected categories if they don't exist in current folder
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const validCategories = selectedCategories.filter((cat) =>
        categories.includes(cat)
      );
      if (validCategories.length !== selectedCategories.length) {
        console.log(
          "Clearing invalid categories:",
          selectedCategories,
          "Valid:",
          validCategories
        );
        persistentState.updateState({
          studySelectedCategories: validCategories,
        });
      }
    }
  }, [categories, selectedCategories, persistentState]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        difficultyDropdownRef.current &&
        !difficultyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDifficultyDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isDifficultyDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isDifficultyDropdownOpen]);

  // Initialize cards when component mounts or folder/category changes
  useEffect(() => {
    // Reset shuffle state when folder/category changes
    isShuffledRef.current = false;

    console.log("StudyTab useEffect:", {
      studyFolder,
      selectedCategories,
      selectedCategoriesValue: selectedCategories[0],
      flashcardsCount: flashcards.length,
      categories,
    });

    let cards: Flashcard[];

    if (studyFolder === "all") {
      // Show all cards across all folders
      cards = flashcards;

      // Filter by categories
      if (selectedCategories.length > 0) {
        cards = cards.filter((card) =>
          selectedCategories.includes(card.category)
        );
      }

      // Filter by difficulties
      if (selectedDifficulties.length > 0) {
        cards = cards.filter((card) =>
          selectedDifficulties.includes(card.difficulty)
        );
      }
    } else {
      // Show cards from specific folder
      const folderCards = flashcards.filter(
        (card) => card.folder === studyFolder
      );
      console.log(
        "Folder cards:",
        folderCards.length,
        folderCards.map((c) => ({
          category: c.category,
          folder: c.folder,
          difficulty: c.difficulty,
        }))
      );
      cards = folderCards;

      // Filter by categories
      if (selectedCategories.length > 0) {
        cards = cards.filter((card) =>
          selectedCategories.includes(card.category)
        );
      }

      // Filter by difficulties
      if (selectedDifficulties.length > 0) {
        cards = cards.filter((card) =>
          selectedDifficulties.includes(card.difficulty)
        );
      }
    }

    console.log("Filtered cards:", cards.length, cards);
    setCurrentCards(cards);
    persistentState.updateState({
      studyCurrentIndex: 0,
      studyIsFlipped: false,
    });
  }, [studyFolder, selectedCategories, selectedDifficulties, flashcards]);

  const currentCard = currentCards[currentIndex];

  const handleShuffle = () => {
    let cards: Flashcard[];

    if (studyFolder === "all") {
      cards = flashcards;

      // Filter by categories
      if (selectedCategories.length > 0) {
        cards = cards.filter((card) =>
          selectedCategories.includes(card.category)
        );
      }

      // Filter by difficulties
      if (selectedDifficulties.length > 0) {
        cards = cards.filter((card) =>
          selectedDifficulties.includes(card.difficulty)
        );
      }
    } else {
      const folderCards = getCardsByFolder(studyFolder);
      cards = folderCards;

      // Filter by categories
      if (selectedCategories.length > 0) {
        cards = cards.filter((card) =>
          selectedCategories.includes(card.category)
        );
      }

      // Filter by difficulties
      if (selectedDifficulties.length > 0) {
        cards = cards.filter((card) =>
          selectedDifficulties.includes(card.difficulty)
        );
      }
    }

    const shuffled = shuffleCards(cards);
    setCurrentCards(shuffled);
    isShuffledRef.current = true;
    persistentState.updateState({
      studyCurrentIndex: 0,
      studyIsFlipped: false,
    });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];

    persistentState.updateState({
      studySelectedCategories: newCategories,
    });
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDifficultyToggle = (difficulty: string) => {
    const newDifficulties = selectedDifficulties.includes(difficulty)
      ? selectedDifficulties.filter((diff) => diff !== difficulty)
      : [...selectedDifficulties, difficulty];

    persistentState.updateState({
      studySelectedDifficulties: newDifficulties,
    });
  };

  const handleDifficultyDropdownToggle = () => {
    setIsDifficultyDropdownOpen(!isDifficultyDropdownOpen);
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

  console.log("StudyTab render:", {
    currentCardsLength: currentCards.length,
    currentCards,
    studyFolder,
    selectedCategories,
  });

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

      {/* Study Controls Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "20px",
          padding: "16px",
          background: "var(--bg-secondary)",
          borderRadius: "12px",
          border: "1px solid var(--border-primary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
              color: "var(--text-secondary)",
            }}
          >
            Study Controls:
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Filter by Topic:
              </label>
              <div style={{ position: "relative" }} ref={dropdownRef}>
                <button
                  type="button"
                  onClick={handleDropdownToggle}
                  style={{
                    minWidth: "200px",
                    padding: "8px 12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: "left",
                  }}
                >
                  <span>
                    {selectedCategories.length === 0
                      ? "All Topics"
                      : selectedCategories.length === 1
                      ? selectedCategories[0]
                      : `${selectedCategories.length} topics selected`}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: isDropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>

                {isDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: "4px",
                      background: "var(--card-bg)",
                      border: "1px solid var(--border-primary)",
                      borderRadius: "6px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      zIndex: 1000,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {categories.length === 0 ? (
                      <div
                        style={{
                          padding: "12px",
                          color: "var(--text-muted)",
                          fontSize: "0.9rem",
                          textAlign: "center",
                        }}
                      >
                        No topics available
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            padding: "8px 12px",
                            borderBottom: "1px solid var(--border-primary)",
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            background: "var(--bg-secondary)",
                          }}
                        >
                          Select topics to study:
                        </div>
                        {categories.map((category) => (
                          <label
                            key={category}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 12px",
                              cursor: "pointer",
                              fontSize: "0.9rem",
                              color: "var(--text-primary)",
                              transition: "background-color 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "var(--bg-secondary)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category)}
                              onChange={() => handleCategoryToggle(category)}
                              style={{
                                marginRight: "8px",
                                accentColor: "var(--primary-color)",
                              }}
                            />
                            {category}
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Filter by Difficulty:
              </label>
              <div style={{ position: "relative" }} ref={difficultyDropdownRef}>
                <button
                  type="button"
                  onClick={handleDifficultyDropdownToggle}
                  style={{
                    minWidth: "160px",
                    padding: "8px 12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: "left",
                  }}
                >
                  <span>
                    {selectedDifficulties.length === 0
                      ? "All Difficulties"
                      : selectedDifficulties.length === 1
                      ? selectedDifficulties[0]
                      : `${selectedDifficulties.length} difficulties selected`}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: isDifficultyDropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>

                {isDifficultyDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: "4px",
                      background: "var(--card-bg)",
                      border: "1px solid var(--border-primary)",
                      borderRadius: "6px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      zIndex: 1000,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid var(--border-primary)",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        background: "var(--bg-secondary)",
                      }}
                    >
                      Select difficulties to study:
                    </div>
                    {difficultyOptions.map((difficulty) => (
                      <label
                        key={difficulty}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          color: "var(--text-primary)",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "var(--bg-secondary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDifficulties.includes(difficulty)}
                          onChange={() => handleDifficultyToggle(difficulty)}
                          style={{
                            marginRight: "8px",
                            accentColor: "var(--primary-color)",
                          }}
                        />
                        {difficulty}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleShuffle}
            className="btn btn-secondary"
            style={{
              padding: "8px 16px",
              fontSize: "0.9rem",
              background: "var(--card-bg)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              alignSelf: "flex-end",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--primary-color)";
              e.currentTarget.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "var(--card-bg)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
          >
            <Shuffle size={16} />
            Shuffle Cards
          </button>
        </div>
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
