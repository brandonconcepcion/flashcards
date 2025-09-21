import React, { useState, useRef } from "react";
import {
  Search,
  Edit2,
  Trash2,
  BarChart3,
  Download,
  Upload,
  Filter,
  X,
  Folder,
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

interface ManageTabProps {
  flashcards: Flashcard[];
  folders: StudyFolder[];
  currentFolder: string;
  setCurrentFolder: (folderId: string) => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  searchCards: (query: string) => Flashcard[];
  getCategories: () => string[];
  getCardsByFolder: (folderId: string) => Flashcard[];
  importFlashcards: (flashcards: Flashcard[]) => void;
  persistentState: {
    state: PersistentState;
    updateState: (updates: Partial<PersistentState>) => void;
    resetState: () => void;
  };
}

// type SortField = "question" | "category" | "difficulty" | "createdAt";
// type SortDirection = 'asc' | 'desc';

const ManageTab: React.FC<ManageTabProps> = ({
  flashcards,
  folders,
  updateFlashcard,
  deleteFlashcard,
  searchCards,
  getCategories,
  getCardsByFolder,
  importFlashcards,
  persistentState,
}) => {
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    question: "",
    answer: "",
    category: "",
    folder: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = getCategories();

  // Use persistent state
  const searchQuery = persistentState.state.manageSearchQuery;
  const selectedCategory = persistentState.state.manageSelectedCategory;
  const selectedFolder = persistentState.state.manageSelectedFolder;
  const sortField = persistentState.state.manageSortField;
  const sortDirection = persistentState.state.manageSortDirection;
  const expandedCard = persistentState.state.manageExpandedCard;

  // Filter and sort cards
  const getFilteredAndSortedCards = () => {
    let filtered: Flashcard[];

    // Apply folder filter first
    if (selectedFolder === "all") {
      filtered = searchQuery ? searchCards(searchQuery) : flashcards;
    } else {
      const folderCards = getCardsByFolder(selectedFolder);
      filtered = searchQuery
        ? folderCards.filter(
            (card) =>
              card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              card.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
              card.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : folderCards;
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((card) => card.category === selectedCategory);
    }

    // Sort cards
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle date fields
      if (sortField === "createdAt") {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // Handle string fields
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const displayCards = getFilteredAndSortedCards();

  const handleCardClick = (cardId: string) => {
    persistentState.updateState({
      manageExpandedCard: expandedCard === cardId ? null : cardId,
    });
  };

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card.id);
    setEditForm({
      question: card.question,
      answer: card.answer,
      category: card.category,
      folder: card.folder || "general",
    });
    // Ensure the card is expanded when editing
    persistentState.updateState({ manageExpandedCard: card.id });
  };

  const handleSaveEdit = () => {
    if (editingCard) {
      updateFlashcard(editingCard, editForm);
      setEditingCard(null);
      setEditForm({ question: "", answer: "", category: "", folder: "" });
    }
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditForm({ question: "", answer: "", category: "", folder: "" });
  };

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card expansion
    if (window.confirm("Are you sure you want to delete this flashcard?")) {
      deleteFlashcard(id);
      if (expandedCard === id) {
        persistentState.updateState({ manageExpandedCard: null });
      }
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(flashcards, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flashcards-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedCards = JSON.parse(content) as Flashcard[];

        if (!Array.isArray(importedCards)) {
          throw new Error(
            "Invalid file format: Expected an array of flashcards"
          );
        }

        const validCards = importedCards.filter(
          (card) =>
            card &&
            typeof card.id === "string" &&
            typeof card.question === "string" &&
            typeof card.answer === "string"
        );

        if (validCards.length === 0) {
          throw new Error("No valid flashcards found in the file");
        }

        const cardsWithNewIds = validCards.map((card) => ({
          ...card,
          id: crypto.randomUUID(),
          createdAt: new Date(card.createdAt || Date.now()),
          lastReviewed: card.lastReviewed
            ? new Date(card.lastReviewed)
            : undefined,
          reviewCount: card.reviewCount || 0,
          difficulty: card.difficulty || "medium",
          category: card.category || "",
        }));

        importFlashcards(cardsWithNewIds);
        alert(`Successfully imported ${cardsWithNewIds.length} flashcards!`);

        if (validCards.length < importedCards.length) {
          alert(
            `Note: ${
              importedCards.length - validCards.length
            } invalid cards were skipped.`
          );
        }
      } catch (error) {
        console.error("Import error:", error);
        alert(
          `Error importing flashcards: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#22c55e";
      case "medium":
        return "#f59e0b";
      case "hard":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const clearFilters = () => {
    persistentState.updateState({
      manageSelectedFolder: "all",
      manageSelectedCategory: "",
      manageSearchQuery: "",
    });
  };

  const stats = {
    total: flashcards.length,
    categories: categories.length,
    reviewed: flashcards.filter((card) => card.lastReviewed).length,
    easy: flashcards.filter((card) => card.difficulty === "easy").length,
    medium: flashcards.filter((card) => card.difficulty === "medium").length,
    hard: flashcards.filter((card) => card.difficulty === "hard").length,
  };

  const hasActiveFilters =
    selectedFolder !== "all" || selectedCategory || searchQuery;

  return (
    <div className="manage-tab">
      <div className="manage-header">
        <div className="manage-title-section">
          <h2>Manage Your Flashcards</h2>
          <div className="import-export-actions">
            <button onClick={handleExport} className="btn btn-secondary btn-sm">
              <Download size={16} />
              Export Cards
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary btn-sm"
            >
              <Upload size={16} />
              Import Cards
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <BarChart3 size={24} />
            <div>
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Cards</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.categories}</div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.reviewed}</div>
            <div className="stat-label">Reviewed</div>
          </div>
          <div className="stat-card difficulty-stats">
            <div className="difficulty-breakdown">
              <span style={{ color: getDifficultyColor("easy") }}>
                {stats.easy} Easy
              </span>
              <span style={{ color: getDifficultyColor("medium") }}>
                {stats.medium} Medium
              </span>
              <span style={{ color: getDifficultyColor("hard") }}>
                {stats.hard} Hard
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-and-filters">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search your flashcards..."
            value={searchQuery}
            onChange={(e) =>
              persistentState.updateState({ manageSearchQuery: e.target.value })
            }
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <Folder size={16} />
            <select
              value={selectedFolder}
              onChange={(e) =>
                persistentState.updateState({
                  manageSelectedFolder: e.target.value,
                })
              }
              className="filter-select"
            >
              <option value="all">All Folders</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.icon} {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Filter size={16} />
            <select
              value={selectedCategory}
              onChange={(e) =>
                persistentState.updateState({
                  manageSelectedCategory: e.target.value,
                })
              }
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn btn-secondary btn-sm">
              <X size={16} />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="cards-table-container">
        {displayCards.length === 0 ? (
          <div className="no-results">
            <p>No flashcards found.</p>
          </div>
        ) : (
          <div className="cards-table">
            {displayCards.map((card) => (
              <div key={card.id} className="card-row-container">
                <div
                  className={`card-row ${
                    expandedCard === card.id ? "expanded" : ""
                  }`}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div className="card-header">
                    <h3 className="card-title">
                      {truncateText(
                        card.question.replace(/[#*`]/g, "").trim(),
                        80
                      )}
                    </h3>
                    <div className="card-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(card);
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Edit card"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(card.id, e)}
                        className="btn btn-danger btn-sm"
                        title="Delete card"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="card-meta">
                    <span className="card-category">
                      {card.category || "Uncategorized"}
                    </span>
                    <div className="card-difficulty">
                      <span className={`difficulty-badge ${card.difficulty}`}>
                        {card.difficulty}
                      </span>
                    </div>
                    <span className="card-date">
                      {formatDate(card.createdAt)}
                    </span>
                  </div>

                  {/* Expanded Card Content */}
                  {expandedCard === card.id && (
                    <div className="expanded-content">
                      {editingCard === card.id ? (
                        <div className="edit-form">
                          <div className="form-group">
                            <label>Question:</label>
                            <textarea
                              value={editForm.question}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  question: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          </div>
                          <div className="form-group">
                            <label>Answer:</label>
                            <textarea
                              value={editForm.answer}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  answer: e.target.value,
                                })
                              }
                              rows={6}
                            />
                          </div>
                          <div className="form-group">
                            <label>Category:</label>
                            <input
                              type="text"
                              value={editForm.category}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  category: e.target.value,
                                })
                              }
                              list="edit-categories"
                            />
                            <datalist id="edit-categories">
                              {categories.map((cat) => (
                                <option key={cat} value={cat} />
                              ))}
                            </datalist>
                          </div>
                          <div className="form-group">
                            <label>Folder:</label>
                            <select
                              value={editForm.folder}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  folder: e.target.value,
                                })
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
                          <div className="edit-actions">
                            <button
                              onClick={handleSaveEdit}
                              className="btn btn-primary"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="btn btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="content-section">
                            <div className="content-label">Question:</div>
                            <div className="content-text">
                              <MarkdownText>{card.question}</MarkdownText>
                            </div>
                          </div>
                          <div className="content-section">
                            <div className="content-label">Answer:</div>
                            <div className="content-text">
                              <MarkdownText>{card.answer}</MarkdownText>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTab;
