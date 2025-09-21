import React, { useState, useRef } from "react";
import {
  Search,
  Edit2,
  Trash2,
  Download,
  Upload,
  X,
  Folder,
  Clock,
  Target,
  BookOpen,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

      if (sortField === "createdAt") {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

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

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card.id);
    setEditForm({
      question: card.question,
      answer: card.answer,
      category: card.category,
      folder: card.folder || "general",
    });
  };

  const handleSaveEdit = () => {
    if (editingCard) {
      updateFlashcard(editingCard, editForm);
      setEditingCard(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
  };

  const handleDelete = (cardId: string) => {
    if (window.confirm("Are you sure you want to delete this flashcard?")) {
      deleteFlashcard(cardId);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(flashcards, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'flashcards.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedCards = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedCards)) {
            importFlashcards(importedCards);
          }
        } catch (error) {
          alert('Error importing flashcards. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
    // Reset the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  const stats = {
    total: flashcards.length,
    categories: categories.length,
    reviewed: flashcards.filter((card) => card.lastReviewed).length,
    easy: flashcards.filter((card) => card.difficulty === "easy").length,
    medium: flashcards.filter((card) => card.difficulty === "medium").length,
    hard: flashcards.filter((card) => card.difficulty === "hard").length,
  };

  const hasActiveFilters = selectedFolder !== "all" || selectedCategory || searchQuery;

  return (
    <div className="manage-tab-new">
      {/* Header Section */}
      <div className="manage-header-new">
        <div className="header-top">
          <div className="title-section">
            <h1>Card Management</h1>
            <p>Organize, edit, and manage your flashcard collection</p>
          </div>
          <div className="action-buttons">
            <button onClick={handleExport} className="action-btn export">
              <Download size={18} />
              <span>Export</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="action-btn import"
            >
              <Upload size={18} />
              <span>Import</span>
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

        {/* Stats Dashboard */}
        <div className="stats-dashboard">
          <div className="stat-item">
            <div className="stat-icon">
              <BookOpen size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Cards</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <Folder size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.categories}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.reviewed}</span>
              <span className="stat-label">Reviewed</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{displayCards.length}</span>
              <span className="stat-label">Filtered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-filter-row">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) =>
                persistentState.updateState({ manageSearchQuery: e.target.value })
              }
            />
            {searchQuery && (
              <button
                onClick={() =>
                  persistentState.updateState({ manageSearchQuery: "" })
                }
                className="clear-search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="filters">
            <select
              value={selectedFolder}
              onChange={(e) =>
                persistentState.updateState({ manageSelectedFolder: e.target.value })
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

            <select
              value={selectedCategory}
              onChange={(e) =>
                persistentState.updateState({ manageSelectedCategory: e.target.value })
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

            {hasActiveFilters && (
              <button
                onClick={() => {
                  persistentState.updateState({
                    manageSelectedFolder: "all",
                    manageSelectedCategory: "",
                    manageSearchQuery: "",
                  });
                }}
                className="clear-filters"
              >
                <X size={16} />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="view-sort-row">
          <div className="view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <List size={18} />
            </button>
          </div>

          <div className="sort-controls">
            <select
              value={sortField}
              onChange={(e) =>
                persistentState.updateState({
                  manageSortField: e.target.value as any,
                })
              }
              className="sort-select"
            >
              <option value="createdAt">Date Created</option>
              <option value="question">Question</option>
              <option value="category">Category</option>
              <option value="difficulty">Difficulty</option>
            </select>
            <button
              onClick={() =>
                persistentState.updateState({
                  manageSortDirection: sortDirection === "asc" ? "desc" : "asc",
                })
              }
              className="sort-direction"
            >
              {sortDirection === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className={`cards-container ${viewMode}`}>
        {displayCards.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={64} />
            <h3>No cards found</h3>
            <p>Try adjusting your filters or add some new flashcards.</p>
          </div>
        ) : (
          displayCards.map((card) => (
            <div key={card.id} className="card-item">
              {editingCard === card.id ? (
                <div className="edit-form">
                  <div className="form-header">
                    <h4>Edit Flashcard</h4>
                  </div>
                  <div className="form-body">
                    <div className="form-group">
                      <label>Question</label>
                      <textarea
                        value={editForm.question}
                        onChange={(e) =>
                          setEditForm({ ...editForm, question: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="form-group">
                      <label>Answer</label>
                      <textarea
                        value={editForm.answer}
                        onChange={(e) =>
                          setEditForm({ ...editForm, answer: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Category</label>
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm({ ...editForm, category: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Folder</label>
                        <select
                          value={editForm.folder}
                          onChange={(e) =>
                            setEditForm({ ...editForm, folder: e.target.value })
                          }
                        >
                          {folders.map((folder) => (
                            <option key={folder.id} value={folder.id}>
                              {folder.icon} {folder.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button onClick={handleCancelEdit} className="btn-cancel">
                      Cancel
                    </button>
                    <button onClick={handleSaveEdit} className="btn-save">
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card-content">
                  <div className="card-header">
                    <div className="card-meta">
                      <span className="category">{card.category}</span>
                      {card.difficulty && (
                        <span
                          className="difficulty"
                          style={{ backgroundColor: getDifficultyColor(card.difficulty) }}
                        >
                          {card.difficulty}
                        </span>
                      )}
                    </div>
                    <div className="card-actions">
                      <button
                        onClick={() => handleEdit(card)}
                        className="action-btn-small edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="action-btn-small delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="question-section">
                      <h4>Question</h4>
                      <div className="content">
                        <MarkdownText>{card.question}</MarkdownText>
                      </div>
                    </div>
                    <div className="answer-section">
                      <h4>Answer</h4>
                      <div className="content">
                        <MarkdownText>{card.answer}</MarkdownText>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    {card.lastReviewed && (
                      <span className="last-reviewed">
                        Reviewed: {formatDate(card.lastReviewed.toISOString())}
                      </span>
                    )}
                    <span className="created-date">
                      Created: {formatDate(card.createdAt.toISOString())}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageTab;

