import React, { useState } from "react";
import { Plus, Edit2, Trash2, FolderOpen } from "lucide-react";
import type { StudyFolder } from "../types/flashcard";

interface FoldersTabProps {
  folders: StudyFolder[];
  currentFolder: string;
  setCurrentFolder: (folderId: string) => void;
  addFolder: (
    name: string,
    description: string,
    color: string,
    icon: string
  ) => StudyFolder;
  updateFolder: (id: string, updates: Partial<StudyFolder>) => void;
  deleteFolder: (id: string) => void;
  getFolderStats: (folderId: string) => {
    total: number;
    reviewed: number;
    easy: number;
    medium: number;
    hard: number;
  };
}

const FOLDER_COLORS = [
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
];

const FOLDER_ICONS = [
  "📚",
  "💻",
  "🎙️",
  "👥",
  "🏗️",
  "🎯",
  "🔬",
  "💡",
  "📊",
  "🎨",
  "🚀",
  "⚡",
  "🔥",
  "💎",
  "🌟",
  "🎪",
  "🎭",
  "🎨",
  "🎯",
  "🎲",
  "🎸",
  "🗄️",
];

const FoldersTab: React.FC<FoldersTabProps> = ({
  folders,
  currentFolder,
  setCurrentFolder,
  addFolder,
  updateFolder,
  deleteFolder,
  getFolderStats,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: FOLDER_COLORS[0],
    icon: FOLDER_ICONS[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingFolder) {
      updateFolder(editingFolder, formData);
      setEditingFolder(null);
      setShowAddForm(false);
    } else {
      addFolder(
        formData.name,
        formData.description,
        formData.color,
        formData.icon
      );
      setShowAddForm(false);
    }

    setFormData({
      name: "",
      description: "",
      color: FOLDER_COLORS[0],
      icon: FOLDER_ICONS[0],
    });
  };

  const handleEdit = (folder: StudyFolder) => {
    setFormData({
      name: folder.name,
      description: folder.description,
      color: folder.color,
      icon: folder.icon,
    });
    setEditingFolder(folder.id);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingFolder(null);
    setFormData({
      name: "",
      description: "",
      color: FOLDER_COLORS[0],
      icon: FOLDER_ICONS[0],
    });
  };

  const handleDelete = (folderId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this folder? All cards will be moved to General Review."
      )
    ) {
      deleteFolder(folderId);
    }
  };

  return (
    <div className="folders-tab">
      <div className="folders-layout">
        {/* Pinned Folder Navigation */}
        <div className="folders-nav">
          <div className="nav-header">
            <h3>Quick Access</h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary btn-sm"
              disabled={showAddForm}
              title="Add New Folder"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="nav-folders">
            {folders.map((folder) => {
              const stats = getFolderStats(folder.id);
              const isActive = currentFolder === folder.id;

              return (
                <button
                  key={folder.id}
                  className={`nav-folder-btn ${isActive ? "active" : ""}`}
                  onClick={() => setCurrentFolder(folder.id)}
                  title={folder.name}
                >
                  <div
                    className="nav-folder-icon"
                    style={{ backgroundColor: folder.color }}
                  >
                    {folder.icon}
                  </div>
                  <div className="nav-folder-info">
                    <span className="nav-folder-name">{folder.name}</span>
                    <span className="nav-folder-count">
                      {stats.total} cards
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="folders-content">
          <div className="folders-header">
            <div className="header-section">
              <h2>Study Folders</h2>
              <p>
                Organize your flashcards into different study modes and topics
              </p>
            </div>
          </div>

          {showAddForm && (
            <div className="add-folder-form">
              <h3>{editingFolder ? "Edit Folder" : "Create New Folder"}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Folder Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Behavioral Interviews"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of this folder's purpose"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Color</label>
                    <div className="color-picker">
                      {FOLDER_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`color-option ${
                            formData.color === color ? "selected" : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Icon</label>
                    <div className="icon-picker">
                      {FOLDER_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className={`icon-option ${
                            formData.icon === icon ? "selected" : ""
                          }`}
                          onClick={() => setFormData({ ...formData, icon })}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingFolder ? "Update Folder" : "Create Folder"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="folders-list">
            {folders.map((folder) => {
              const stats = getFolderStats(folder.id);
              const isActive = currentFolder === folder.id;

              return (
                <div
                  key={folder.id}
                  className={`folder-row ${isActive ? "active" : ""}`}
                  style={{ borderLeftColor: folder.color }}
                >
                  <div className="folder-main">
                    <div
                      className="folder-icon"
                      style={{ backgroundColor: folder.color }}
                    >
                      {folder.icon}
                    </div>
                    <div className="folder-info">
                      <h3>{folder.name}</h3>
                      <p>{folder.description}</p>
                    </div>
                    <div className="folder-stats">
                      <div className="stat-item">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Cards</span>
                      </div>
                    </div>
                  </div>
                  <div className="folder-actions">
                    <button
                      onClick={() => setCurrentFolder(folder.id)}
                      className={`btn ${
                        isActive ? "btn-success" : "btn-primary"
                      } btn-sm`}
                    >
                      <FolderOpen size={16} />
                      {isActive ? "Current" : "Switch"}
                    </button>
                    <button
                      onClick={() => handleEdit(folder)}
                      className="btn btn-secondary btn-sm"
                      title="Edit folder"
                    >
                      <Edit2 size={14} />
                    </button>
                    {folder.id !== "general" && (
                      <button
                        onClick={() => handleDelete(folder.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete folder"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoldersTab;
