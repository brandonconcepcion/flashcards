import React, { useState, useRef } from "react";
import {
  Search,
  Edit2,
  Trash2,
  Download,
  Upload,
  X,
  BookOpen,
  SortAsc,
  SortDesc,
  FileText,
  Image,
  Plus,
} from "lucide-react";
import type { Flashcard, StudyFolder } from "../types/flashcard";
import MarkdownText from "./MarkdownText";
import GoogleDocsExportModal from "./GoogleDocsExportModal";
import type { PersistentState } from "../hooks/usePersistentState";

interface ManageTabProps {
  flashcards: Flashcard[];
  folders: StudyFolder[];
  currentFolder: string;
  setCurrentFolder: (folderId: string) => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  searchCards: (query: string) => Flashcard[];
  getCategoriesByFolder: (folderId: string) => string[];
  getCardsByFolder: (folderId: string) => Flashcard[];
  importFlashcards: (flashcards: Flashcard[]) => void;
  updateFolder: (id: string, updates: Partial<StudyFolder>) => void;
  deleteFolder: (id: string) => void;
  addFolder: (
    name: string,
    description: string,
    color: string,
    icon: string
  ) => StudyFolder;
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
  getCategoriesByFolder,
  getCardsByFolder,
  importFlashcards,
  updateFolder,
  deleteFolder,
  addFolder,
  persistentState,
}) => {
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    question: "",
    answer: "",
    category: "",
    folder: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconFileInputRef = useRef<HTMLInputElement>(null);
  const createIconFileInputRef = useRef<HTMLInputElement>(null);
  const [showGoogleDocsModal, setShowGoogleDocsModal] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const [showFolderEdit, setShowFolderEdit] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderEditForm, setFolderEditForm] = useState({
    name: "",
    description: "",
    color: "#667eea",
    icon: "📚",
  });
  const [createFolderForm, setCreateFolderForm] = useState({
    name: "",
    description: "",
    color: "#667eea",
    icon: "📚",
  });
  const [customEmoji, setCustomEmoji] = useState("");
  const [createCustomEmoji, setCreateCustomEmoji] = useState("");
  const [iconImage, setIconImage] = useState<string | null>(null);
  const [createIconImage, setCreateIconImage] = useState<string | null>(null);
  const [showBulkCategoryUpdate, setShowBulkCategoryUpdate] = useState(false);
  const [bulkCategoryValue, setBulkCategoryValue] = useState("");

  // Use persistent state
  const searchQuery = persistentState.state.manageSearchQuery;
  const selectedCategory = persistentState.state.manageSelectedCategory;
  const selectedFolder = persistentState.state.manageSelectedFolder;

  const categories = getCategoriesByFolder(selectedFolder);
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
    setExpandedCard(card.id); // Expand the card when editing
  };

  const handleCardClick = (cardId: string) => {
    if (expandedCard === cardId) {
      setExpandedCard(null); // Collapse if already expanded
    } else {
      setExpandedCard(cardId); // Expand the clicked card
    }
    setEditingCard(null); // Cancel any editing
  };

  const handleSaveEdit = () => {
    if (editingCard) {
      updateFlashcard(editingCard, editForm);
      setEditingCard(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setExpandedCard(null); // Collapse the card when canceling edit
  };

  const handleDelete = (cardId: string) => {
    if (window.confirm("Are you sure you want to delete this flashcard?")) {
      deleteFlashcard(cardId);
    }
  };

  const toggleCardSelection = (
    cardId: string,
    cardIndex: number,
    isShiftClick: boolean = false
  ) => {
    setSelectedCards((prev) => {
      const newSet = new Set(prev);

      if (isShiftClick && lastSelectedIndex !== null) {
        // Handle shift+click range selection - select all cards in range
        const startIndex = Math.min(lastSelectedIndex, cardIndex);
        const endIndex = Math.max(lastSelectedIndex, cardIndex);

        for (let i = startIndex; i <= endIndex; i++) {
          if (displayCards[i]) {
            newSet.add(displayCards[i].id);
          }
        }
      } else {
        // Handle normal click - toggle selection
        if (newSet.has(cardId)) {
          newSet.delete(cardId);
        } else {
          newSet.add(cardId);
        }
      }

      return newSet;
    });

    // Always update lastSelectedIndex when a card is clicked
    setLastSelectedIndex(cardIndex);
  };

  const deselectAllCards = () => {
    setSelectedCards(new Set());
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      // Exiting selection mode - clear selections
      setSelectedCards(new Set());
      setLastSelectedIndex(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedCards.size === 0) return;

    const confirmMessage =
      selectedCards.size === 1
        ? "Are you sure you want to delete this flashcard?"
        : `Are you sure you want to delete ${selectedCards.size} flashcards?`;

    if (window.confirm(confirmMessage)) {
      selectedCards.forEach((cardId) => {
        deleteFlashcard(cardId);
      });
      setSelectedCards(new Set());
    }
  };

  const handleFolderEdit = () => {
    const currentFolderData = folders.find((f) => f.id === selectedFolder);
    if (currentFolderData) {
      setFolderEditForm({
        name: currentFolderData.name,
        description: currentFolderData.description,
        color: currentFolderData.color,
        icon: currentFolderData.icon,
      });
      // Check if current icon is a custom emoji or image
      const isCustomEmoji =
        currentFolderData.icon && !currentFolderData.icon.startsWith("data:");
      const isImage =
        currentFolderData.icon && currentFolderData.icon.startsWith("data:");

      if (isCustomEmoji) {
        setCustomEmoji(currentFolderData.icon);
        setIconImage(null);
      } else if (isImage) {
        setIconImage(currentFolderData.icon);
        setCustomEmoji("");
      } else {
        setCustomEmoji("");
        setIconImage(null);
      }
      setShowFolderEdit(true);
    }
  };

  const handleFolderSave = () => {
    if (folderEditForm.name.trim()) {
      const iconToUse = customEmoji.trim() || iconImage || "📁";
      updateFolder(selectedFolder, { ...folderEditForm, icon: iconToUse });
      setShowFolderEdit(false);
      setCustomEmoji("");
      setIconImage(null);
    }
  };

  const handleFolderCancel = () => {
    setShowFolderEdit(false);
    setFolderEditForm({
      name: "",
      description: "",
      color: "#667eea",
      icon: "📚",
    });
    setCustomEmoji("");
    setIconImage(null);
  };

  const handleFolderDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the folder "${folderEditForm.name}"? All cards in this folder will be moved to the "General Review" folder.`
      )
    ) {
      deleteFolder(selectedFolder);
      setShowFolderEdit(false);
      setCustomEmoji("");
      setIconImage(null);
      // Switch to general folder after deletion
      persistentState.updateState({ manageSelectedFolder: "general" });
    }
  };

  const handleCreateFolder = () => {
    setCreateFolderForm({
      name: "",
      description: "",
      color: "#667eea",
      icon: "📚",
    });
    setCreateCustomEmoji("");
    setCreateIconImage(null);
    setShowCreateFolder(true);
  };

  const handleCreateFolderSave = () => {
    if (createFolderForm.name.trim()) {
      const iconToUse = createCustomEmoji.trim() || createIconImage || "📁";
      const newFolder = addFolder(
        createFolderForm.name,
        createFolderForm.description,
        createFolderForm.color,
        iconToUse
      );
      // Switch to the new folder
      persistentState.updateState({ manageSelectedFolder: newFolder.id });
      setShowCreateFolder(false);
      setCreateCustomEmoji("");
      setCreateIconImage(null);
    }
  };

  const handleCreateFolderCancel = () => {
    setShowCreateFolder(false);
    setCreateCustomEmoji("");
    setCreateIconImage(null);
  };

  const handleCreateIconImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCreateIconImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFolderSwitch = (folderId: string) => {
    persistentState.updateState({ manageSelectedFolder: folderId });
  };

  const handleBulkCategoryUpdate = () => {
    if (selectedCards.size === 0) return;

    setShowBulkCategoryUpdate(true);
    setBulkCategoryValue("");
  };

  const handleBulkCategorySave = () => {
    if (selectedCards.size === 0) return;

    // Update all selected cards with the new category
    selectedCards.forEach((cardId) => {
      updateFlashcard(cardId, { category: bulkCategoryValue.trim() });
    });

    // Clear selection and close form
    setSelectedCards(new Set());
    setSelectionMode(false);
    setShowBulkCategoryUpdate(false);
    setBulkCategoryValue("");
  };

  const handleBulkCategoryCancel = () => {
    setShowBulkCategoryUpdate(false);
    setBulkCategoryValue("");
  };

  const handleIconImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setIconImage(result);
        setCustomEmoji(""); // Clear custom emoji when image is selected
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(flashcards, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "flashcards.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
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
          alert("Error importing flashcards. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
    // Reset the input
    if (event.target) {
      event.target.value = "";
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

  const hasActiveFilters =
    selectedFolder !== "all" || selectedCategory || searchQuery;

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
              <Download size={20} />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowGoogleDocsModal(true)}
              className="action-btn google-docs"
              title="Export to Google Docs"
            >
              <FileText size={20} />
              <span>Docs</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="action-btn import"
            >
              <Upload size={20} />
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
      </div>

      {/* Folder Management Section */}
      <div className="folder-management-section">
        <div className="folder-selector">
          <label>Current Project:</label>
          <div className="folder-switcher">
            <select
              value={selectedFolder}
              onChange={(e) => handleFolderSwitch(e.target.value)}
              className="folder-dropdown"
            >
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
            <div className="folder-display">
              {(() => {
                const currentFolderData = folders.find(
                  (f) => f.id === selectedFolder
                );
                if (!currentFolderData) return null;

                const isImage =
                  currentFolderData.icon &&
                  currentFolderData.icon.startsWith("data:");

                return (
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
                );
              })()}
              <span className="folder-name">
                {folders.find((f) => f.id === selectedFolder)?.name}
              </span>
            </div>
          </div>
          <div className="folder-actions">
            <button
              onClick={handleFolderEdit}
              className="btn btn-secondary btn-sm"
              title="Edit folder properties"
            >
              <Edit2 size={16} />
              Edit
            </button>
            <button
              onClick={handleCreateFolder}
              className="btn btn-primary btn-sm"
              title="Create new folder"
            >
              <Plus size={16} />
              New Folder
            </button>
          </div>
        </div>
      </div>

      {/* Folder Edit Form */}
      {showFolderEdit && (
        <div className="folder-edit-form">
          <h3>Edit Folder Properties</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFolderSave();
            }}
          >
            <div className="form-row">
              <div className="form-group">
                <label>Folder Name</label>
                <input
                  type="text"
                  value={folderEditForm.name}
                  onChange={(e) =>
                    setFolderEditForm({
                      ...folderEditForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Folder name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={folderEditForm.description}
                  onChange={(e) =>
                    setFolderEditForm({
                      ...folderEditForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Folder description"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {[
                    "#667eea",
                    "#dab16bff",
                    "#66b884ff",
                    "#ef4444",
                    "#7765a2ff",
                    "#06b6d4",
                    "#f97316",
                    "#ec4899",
                    "#84cc16",
                    "#8a8bccff",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${
                        folderEditForm.color === color ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        setFolderEditForm({ ...folderEditForm, color })
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Icon</label>

                {/* Custom Emoji Input */}
                <div className="custom-emoji-section">
                  <div className="custom-emoji-input">
                    <input
                      type="text"
                      value={customEmoji}
                      onChange={(e) => {
                        setCustomEmoji(e.target.value);
                        setIconImage(null); // Clear image when emoji is typed
                      }}
                      placeholder="Type any emoji (e.g., 🎯, 🚀, 💡)"
                      maxLength={2}
                    />
                    <span className="emoji-preview">{customEmoji || "😊"}</span>
                  </div>
                  <small>Enter any emoji to use as your folder icon</small>
                </div>

                {/* Photo Upload */}
                <div className="photo-upload-section">
                  <label>Upload Photo</label>
                  <div className="photo-upload-area">
                    <input
                      ref={iconFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleIconImageUpload}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => iconFileInputRef.current?.click()}
                      className="upload-photo-btn"
                    >
                      <Image size={20} />
                      <span>Choose Photo</span>
                    </button>
                    {iconImage && (
                      <div className="image-preview">
                        <img src={iconImage} alt="Icon preview" />
                        <button
                          type="button"
                          onClick={() => setIconImage(null)}
                          className="remove-image-btn"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <small>
                    Upload a square photo to use as your folder icon
                  </small>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleFolderCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFolderDelete}
                className="btn btn-danger"
                style={{
                  background: "var(--error-color)",
                  color: "white",
                  border: "1px solid var(--error-color)",
                }}
              >
                <Trash2 size={16} />
                Delete Folder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Folder Form */}
      {showCreateFolder && (
        <div className="folder-edit-form">
          <h3>Create New Folder</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateFolderSave();
            }}
          >
            <div className="form-row">
              <div className="form-group">
                <label>Folder Name</label>
                <input
                  type="text"
                  value={createFolderForm.name}
                  onChange={(e) =>
                    setCreateFolderForm({
                      ...createFolderForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter folder name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={createFolderForm.description}
                  onChange={(e) =>
                    setCreateFolderForm({
                      ...createFolderForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter folder description"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Background Color</label>
                <input
                  type="color"
                  value={createFolderForm.color}
                  onChange={(e) =>
                    setCreateFolderForm({
                      ...createFolderForm,
                      color: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="custom-emoji-section">
              <label>Custom Emoji</label>
              <div className="emoji-input-group">
                <input
                  type="text"
                  value={createCustomEmoji}
                  onChange={(e) => setCreateCustomEmoji(e.target.value)}
                  placeholder="Enter emoji (e.g., 🚀, 📚, 💡)"
                  className="custom-emoji-input"
                />
                <div className="emoji-preview">
                  {createCustomEmoji && (
                    <span className="preview-emoji">{createCustomEmoji}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="photo-upload-section">
              <label>Upload Photo</label>
              <div className="photo-upload-area">
                <input
                  ref={createIconFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCreateIconImageUpload}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => createIconFileInputRef.current?.click()}
                  className="upload-photo-btn"
                >
                  <Image size={20} />
                  Choose Photo
                </button>
                {createIconImage && (
                  <div className="image-preview">
                    <img src={createIconImage} alt="Preview" />
                    <button
                      type="button"
                      onClick={() => setCreateIconImage(null)}
                      className="remove-image-btn"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Create Folder
              </button>
              <button
                type="button"
                onClick={handleCreateFolderCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Category Update Form */}
      {showBulkCategoryUpdate && (
        <div className="folder-edit-form">
          <h3>
            Update Category for {selectedCards.size} Card
            {selectedCards.size === 1 ? "" : "s"}
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleBulkCategorySave();
            }}
          >
            <div className="form-row">
              <div className="form-group">
                <label>New Category</label>
                <input
                  type="text"
                  value={bulkCategoryValue}
                  onChange={(e) => setBulkCategoryValue(e.target.value)}
                  placeholder="Enter new category name"
                  className="category-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Update {selectedCards.size} Card
                {selectedCards.size === 1 ? "" : "s"}
              </button>
              <button
                type="button"
                onClick={handleBulkCategoryCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
                persistentState.updateState({
                  manageSearchQuery: e.target.value,
                })
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
            {selectionMode && (
              <div className="selection-controls">
                <button
                  onClick={deselectAllCards}
                  className="selection-btn"
                  disabled={selectedCards.size === 0}
                >
                  Deselect All
                </button>
                {selectedCards.size > 0 && (
                  <>
                    <button
                      onClick={handleBulkDelete}
                      className="selection-btn delete"
                      title={`Delete ${selectedCards.size} selected card${
                        selectedCards.size === 1 ? "" : "s"
                      }`}
                    >
                      <Trash2 size={16} />
                      Delete ({selectedCards.size})
                    </button>
                    <button
                      onClick={handleBulkCategoryUpdate}
                      className="selection-btn edit"
                      title={`Update category for ${
                        selectedCards.size
                      } selected card${selectedCards.size === 1 ? "" : "s"}`}
                    >
                      <Edit2 size={16} />
                      Update Category ({selectedCards.size})
                    </button>
                  </>
                )}
                {selectedCards.size > 0 && (
                  <span className="selection-count">
                    {selectedCards.size} selected
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="view-sort-row">
          <div className="view-toggle"></div>

          <div className="sort-controls">
            <button
              onClick={toggleSelectionMode}
              className={`selection-mode-btn ${
                selectionMode ? "selection-mode-active" : "selection-mode"
              }`}
              title={
                selectionMode ? "Exit Selection Mode" : "Enter Selection Mode"
              }
            >
              <BookOpen size={16} />
              <span>{selectionMode ? "Exit Select" : "Select"}</span>
            </button>
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
              {sortDirection === "asc" ? (
                <SortAsc size={18} />
              ) : (
                <SortDesc size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="cards-list-container">
        {displayCards.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={64} />
            <h3>No cards found</h3>
            <p>Try adjusting your filters or add some new flashcards.</p>
          </div>
        ) : (
          <div className="cards-vertical-list">
            {displayCards.map((card, index) => (
              <div key={card.id} className="card-list-item">
                {editingCard === card.id ? (
                  <div className="edit-form-inline">
                    <div className="form-group">
                      <label>Question</label>
                      <textarea
                        value={editForm.question}
                        onChange={(e) =>
                          setEditForm({ ...editForm, question: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                    <div className="form-group">
                      <label>Answer</label>
                      <textarea
                        value={editForm.answer}
                        onChange={(e) =>
                          setEditForm({ ...editForm, answer: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Category</label>
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              category: e.target.value,
                            })
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
                    <div className="form-actions">
                      <button onClick={handleCancelEdit} className="btn-cancel">
                        Cancel
                      </button>
                      <button onClick={handleSaveEdit} className="btn-save">
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="card-list-content"
                      onClick={() => !selectionMode && handleCardClick(card.id)}
                    >
                      {selectionMode && (
                        <div className="card-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedCards.has(card.id)}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardSelection(card.id, index, e.shiftKey);
                            }}
                          />
                        </div>
                      )}
                      <div className="card-number">{index + 1}</div>
                      <div className="card-question">
                        <MarkdownText>{card.question}</MarkdownText>
                      </div>
                      <div className="card-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(card);
                          }}
                          className="action-btn edit"
                          title="Edit card"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(card.id);
                          }}
                          className="action-btn delete"
                          title="Delete card"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {expandedCard === card.id && (
                      <div className="card-expanded-content">
                        <div className="expanded-section">
                          <h4>Question</h4>
                          <div className="expanded-text">
                            <MarkdownText>{card.question}</MarkdownText>
                          </div>
                        </div>
                        <div className="expanded-section">
                          <h4>Answer</h4>
                          <div className="expanded-text">
                            <MarkdownText>{card.answer}</MarkdownText>
                          </div>
                        </div>
                        <div className="expanded-meta">
                          <div className="meta-item">
                            <span className="meta-label">Category:</span>
                            <span className="meta-value">{card.category}</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Folder:</span>
                            <span className="meta-value">
                              {folders.find((f) => f.id === card.folder)?.icon}{" "}
                              {folders.find((f) => f.id === card.folder)?.name}
                            </span>
                          </div>
                          {card.difficulty && (
                            <div className="meta-item">
                              <span className="meta-label">Difficulty:</span>
                              <span
                                className="meta-value difficulty-badge"
                                style={{
                                  backgroundColor: getDifficultyColor(
                                    card.difficulty
                                  ),
                                }}
                              >
                                {card.difficulty}
                              </span>
                            </div>
                          )}
                          <div className="meta-item">
                            <span className="meta-label">Created:</span>
                            <span className="meta-value">
                              {formatDate(card.createdAt.toISOString())}
                            </span>
                          </div>
                          {card.lastReviewed && (
                            <div className="meta-item">
                              <span className="meta-label">Last Reviewed:</span>
                              <span className="meta-value">
                                {formatDate(card.lastReviewed.toISOString())}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Google Docs Export Modal */}
      <GoogleDocsExportModal
        isOpen={showGoogleDocsModal}
        onClose={() => setShowGoogleDocsModal(false)}
        flashcards={flashcards}
        folders={folders}
        selectedCards={selectedCards}
      />
    </div>
  );
};

export default ManageTab;
