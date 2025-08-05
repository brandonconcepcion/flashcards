import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, Info } from 'lucide-react';
import type { StudyFolder } from '../types/flashcard';

interface FoldersTabProps {
  folders: StudyFolder[];
  currentFolder: string;
  setCurrentFolder: (folderId: string) => void;
  addFolder: (name: string, description: string, color: string, icon: string) => StudyFolder;
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
  '#667eea', '#dab16bff', '#66b884ff', '#ef4444', '#7765a2ff', 
  '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#8a8bccff'
];

const FOLDER_ICONS = [
  '📚', '💻', '🎙️',  '👥', '🏗️', '🎯', '🔬', '💡', '📊', '🎨', '🚀',
  '⚡', '🔥', '💎', '🌟', '🎪', '🎭', '🎨', '🎯', '🎲', '🎸', '🗄️'
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
    name: '',
    description: '',
    color: FOLDER_COLORS[0],
    icon: FOLDER_ICONS[0],
  });
  const [showStatsFor, setShowStatsFor] = useState<string | null>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStatsFor && !(event.target as Element).closest('.stats-info-container')) {
        setShowStatsFor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatsFor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingFolder) {
      updateFolder(editingFolder, formData);
      setEditingFolder(null);
      setShowAddForm(false);
    } else {
      addFolder(formData.name, formData.description, formData.color, formData.icon);
      setShowAddForm(false);
    }

    setFormData({
      name: '',
      description: '',
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
      name: '',
      description: '',
      color: FOLDER_COLORS[0],
      icon: FOLDER_ICONS[0],
    });
  };

  const handleDelete = (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder? All cards will be moved to General Review.')) {
      deleteFolder(folderId);
    }
  };

  return (
    <div className="folders-tab">
      <div className="folders-header">
        <div className="header-section">
          <h2>Study Folders</h2>
          <p>Organize your flashcards into different study modes and topics</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
          disabled={showAddForm}
        >
          <Plus size={20} />
          Add New Folder
        </button>
      </div>

      {showAddForm && (
        <div className="add-folder-form">
          <h3>{editingFolder ? 'Edit Folder' : 'Create New Folder'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Folder Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Behavioral Interviews"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this folder's purpose"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {FOLDER_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Icon</label>
                <div className="icon-picker">
                  {FOLDER_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
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
                {editingFolder ? 'Update Folder' : 'Create Folder'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="folders-grid">
        {folders.map(folder => {
          const stats = getFolderStats(folder.id);
          const isActive = currentFolder === folder.id;
          
          return (
            <div
              key={folder.id}
              className={`folder-card ${isActive ? 'active' : ''}`}
              style={{ borderColor: folder.color }}
            >
              <div className="folder-header">
                <div className="folder-icon" style={{ backgroundColor: folder.color }}>
                  {folder.icon}
                </div>
                <div className="folder-info">
                  <h3>{folder.name}</h3>
                  <p>{folder.description}</p>
                </div>
                <div className="folder-actions">
                  <button
                    onClick={() => handleEdit(folder)}
                    className="btn btn-secondary btn-sm"
                    title="Edit folder"
                  >
                    <Edit2 size={14} />
                  </button>
                  {folder.id !== 'general' && (
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

              <div className="folder-stats">
                <div className="stats-header">
                  <span className="cards-count">{stats.total} cards</span>
                  <div className="stats-info-container">
                    <button
                      className="stats-info-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStatsFor(showStatsFor === folder.id ? null : folder.id);
                      }}
                      title="View detailed statistics"
                    >
                      <Info size={16} />
                    </button>
                    {showStatsFor === folder.id && (
                      <div className="stats-tooltip">
                        <div className="tooltip-content">
                          <div className="stat-row">
                            <span>Total Cards:</span>
                            <span>{stats.total}</span>
                          </div>
                          <div className="stat-row">
                            <span>Reviewed:</span>
                            <span>{stats.reviewed}</span>
                          </div>
                          <div className="stat-row">
                            <span>Easy:</span>
                            <span>{stats.easy}</span>
                          </div>
                          <div className="stat-row">
                            <span>Medium:</span>
                            <span>{stats.medium}</span>
                          </div>
                          <div className="stat-row">
                            <span>Hard:</span>
                            <span>{stats.hard}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="folder-footer">
                <button
                  onClick={() => setCurrentFolder(folder.id)}
                  className={`btn ${isActive ? 'btn-success' : 'btn-primary'} btn-sm`}
                >
                  <FolderOpen size={16} />
                  {isActive ? 'Current Folder' : 'Switch to Folder'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FoldersTab;
