import React, { useState, useRef } from 'react';
import { Search, Edit2, Trash2, Calendar, BarChart3, Download, Upload } from 'lucide-react';
import type { Flashcard } from '../types/flashcard';
import LaTeXText from './LaTeXText';

interface ManageTabProps {
  flashcards: Flashcard[];
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  searchCards: (query: string) => Flashcard[];
  getCategories: () => string[];
  importFlashcards: (flashcards: Flashcard[]) => void;
}

const ManageTab: React.FC<ManageTabProps> = ({
  flashcards,
  updateFlashcard,
  deleteFlashcard,
  searchCards,
  getCategories,
  importFlashcards,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    question: '',
    answer: '',
    category: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayCards = searchQuery ? searchCards(searchQuery) : flashcards;
  const categories = getCategories();

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card.id);
    setEditForm({
      question: card.question,
      answer: card.answer,
      category: card.category,
    });
  };

  const handleSaveEdit = () => {
    if (editingCard) {
      updateFlashcard(editingCard, editForm);
      setEditingCard(null);
      setEditForm({ question: '', answer: '', category: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditForm({ question: '', answer: '', category: '' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      deleteFlashcard(id);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(flashcards, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flashcards-${new Date().toISOString().split('T')[0]}.json`;
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
        
        // Validate the imported data
        if (!Array.isArray(importedCards)) {
          throw new Error('Invalid file format: Expected an array of flashcards');
        }

        // Basic validation of flashcard structure
        const validCards = importedCards.filter(card => 
          card && 
          typeof card.id === 'string' &&
          typeof card.question === 'string' &&
          typeof card.answer === 'string'
        );

        if (validCards.length === 0) {
          throw new Error('No valid flashcards found in the file');
        }

        // Generate new IDs to avoid conflicts
        const cardsWithNewIds = validCards.map(card => ({
          ...card,
          id: crypto.randomUUID(),
          createdAt: new Date(card.createdAt || Date.now()),
          lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
          reviewCount: card.reviewCount || 0,
          difficulty: card.difficulty || 'medium',
          category: card.category || ''
        }));

        importFlashcards(cardsWithNewIds);
        alert(`Successfully imported ${cardsWithNewIds.length} flashcards!`);
        
        if (validCards.length < importedCards.length) {
          alert(`Note: ${importedCards.length - validCards.length} invalid cards were skipped.`);
        }
      } catch (error) {
        console.error('Import error:', error);
        alert(`Error importing flashcards: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const stats = {
    total: flashcards.length,
    categories: categories.length,
    reviewed: flashcards.filter(card => card.lastReviewed).length,
    easy: flashcards.filter(card => card.difficulty === 'easy').length,
    medium: flashcards.filter(card => card.difficulty === 'medium').length,
    hard: flashcards.filter(card => card.difficulty === 'hard').length,
  };

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
              style={{ display: 'none' }}
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
              <span style={{ color: getDifficultyColor('easy') }}>{stats.easy} Easy</span>
              <span style={{ color: getDifficultyColor('medium') }}>{stats.medium} Medium</span>
              <span style={{ color: getDifficultyColor('hard') }}>{stats.hard} Hard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search your flashcards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="cards-list">
        {displayCards.length === 0 ? (
          <div className="no-results">
            <p>No flashcards found.</p>
          </div>
        ) : (
          displayCards.map(card => (
            <div key={card.id} className="card-item">
              {editingCard === card.id ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Question:</label>
                    <textarea
                      value={editForm.question}
                      onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Answer:</label>
                    <textarea
                      value={editForm.answer}
                      onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category:</label>
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      list="edit-categories"
                    />
                    <datalist id="edit-categories">
                      {categories.map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                  <div className="edit-actions">
                    <button onClick={handleSaveEdit} className="btn btn-primary">
                      Save
                    </button>
                    <button onClick={handleCancelEdit} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="card-content">
                    <div className="card-question">
                      <strong>Q:</strong> <LaTeXText>{card.question}</LaTeXText>
                    </div>
                    <div className="card-answer">
                      <strong>A:</strong> <LaTeXText>{card.answer}</LaTeXText>
                    </div>
                  </div>
                  
                  <div className="card-meta">
                    {card.category && (
                      <span className="category-tag">{card.category}</span>
                    )}
                    <span 
                      className="difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(card.difficulty) }}
                    >
                      {card.difficulty}
                    </span>
                    <div className="card-dates">
                      <div className="date-info">
                        <Calendar size={14} />
                        Created: {formatDate(card.createdAt)}
                      </div>
                      {card.lastReviewed && (
                        <div className="date-info">
                          Last reviewed: {formatDate(card.lastReviewed)}
                        </div>
                      )}
                      <div className="review-count">
                        Reviews: {card.reviewCount}
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={() => handleEdit(card)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageTab;
