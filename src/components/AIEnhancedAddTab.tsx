import React, { useState } from 'react';
import { Plus, Check, Sparkles, Brain, Lightbulb, Key, Eye, EyeOff, Calculator } from 'lucide-react';
import { aiService } from '../services/aiService';
import type { AISuggestions } from '../services/aiService';
import MarkdownText from './MarkdownText';

interface AIEnhancedAddTabProps {
  addFlashcard: (question: string, answer: string, category: string, folder?: string) => void;
  getCategories: () => string[];
  getCategoriesByFolder: (folderId: string) => string[];
  folders: any[];
  currentFolder: string;
  getFolderById: (id: string) => any;
  persistentState: {
    state: {
      addCardLastCategory: Record<string, string>;
      addCardSelectedFolder: string;
    };
    updateState: (updates: any) => void;
  };
}

const AIEnhancedAddTab: React.FC<AIEnhancedAddTabProps> = ({ 
  addFlashcard, 
  getCategories, 
  getCategoriesByFolder,
  folders, 
  currentFolder, 
  getFolderById,
  persistentState
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState(() => {
    const selectedFolder = persistentState.state.addCardSelectedFolder || currentFolder;
    return persistentState.state.addCardLastCategory[selectedFolder] || '';
  });
  const [selectedFolder, setSelectedFolder] = useState(persistentState.state.addCardSelectedFolder || currentFolder);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showLatexHelp, setShowLatexHelp] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const existingCategories = getCategoriesByFolder(selectedFolder);
  const hasApiKey = aiService.hasApiKey();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !answer.trim()) {
      return;
    }

    addFlashcard(question, answer, category, selectedFolder);
    
    // Save the category and folder selection for persistence
    persistentState.updateState({
      addCardLastCategory: {
        ...persistentState.state.addCardLastCategory,
        [selectedFolder]: category
      },
      addCardSelectedFolder: selectedFolder
    });
    
    // Reset form
    setQuestion('');
    setAnswer('');
    // Don't reset category - keep it persistent
    setAiSuggestions(null);
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleAIAnalysis = async () => {
    if (!answer.trim()) {
      alert('Please enter some content in the answer field to analyze.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const suggestions = await aiService.analyzeText(answer, category);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('Error analyzing text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddSuggestedCard = (suggestedCard: { question: string; answer: string; category: string }) => {
    addFlashcard(suggestedCard.question, suggestedCard.answer, suggestedCard.category);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSetApiKey = () => {
    if (apiKey.trim()) {
      aiService.setApiKey(apiKey.trim());
      setApiKey('');
      setShowApiKeyInput(false);
      alert('API key saved! You can now use AI features.');
    }
  };

  const handleUseSummary = () => {
    if (aiSuggestions?.summary) {
      setAnswer(aiSuggestions.summary);
    }
  };

  const handleFolderChange = (newFolderId: string) => {
    setSelectedFolder(newFolderId);
    // Load the last used category for this folder
    const lastCategory = persistentState.state.addCardLastCategory[newFolderId] || '';
    setCategory(lastCategory);
    // Update persistent state
    persistentState.updateState({
      addCardSelectedFolder: newFolderId
    });
  };

  return (
    <div className="add-card-tab">
      <div className="card-form">
        <div className="form-header">
          <h2>Add New Flashcard</h2>
          <div className="header-actions">
            <button
              onClick={() => setShowLatexHelp(!showLatexHelp)}
              className="btn btn-secondary btn-sm"
            >
              <Calculator size={16} />
              LaTeX Help
            </button>
            <div className="ai-status">
              {hasApiKey ? (
                <span className="ai-enabled">
                  <Sparkles size={16} />
                  AI Enhanced
                </span>
              ) : (
                <button
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  className="btn btn-secondary btn-sm"
                >
                  <Key size={16} />
                  Enable AI Features
                </button>
              )}
            </div>
          </div>
        </div>

        {showApiKeyInput && (
          <div className="api-key-input">
            <h3>Enable AI Features</h3>
            <p>Enter your OpenAI API key to enable AI-powered summaries and concept extraction:</p>
            <div className="api-key-form">
              <div className="input-with-toggle">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="toggle-visibility"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button onClick={handleSetApiKey} className="btn btn-primary btn-sm">
                Save API Key
              </button>
            </div>
            <p className="api-key-note">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>
        )}

        {showLatexHelp && (
          <div className="latex-help">
            <h4>LaTeX Math Support</h4>
            <p>You can include mathematical formulas in your flashcards using LaTeX notation:</p>
            <div className="latex-examples">
              <div className="example">Inline: $E = mc^2$</div>
              <div className="example">Block: $$\int_0^1 x^2 dx$$</div>
              <div className="example">Fraction: $\frac{'{a}'}{'{b}'}$</div>
              <div className="example">Square root: $\sqrt{'{x}'}$</div>
              <div className="example">Subscript: $x_1$</div>
              <div className="example">Superscript: $x^2$</div>
              <div className="example">Greek: $\alpha, \beta, \gamma$</div>
              <div className="example">Sum: $\sum_{'{i=1}'}^n x_{'{i}'}$</div>
            </div>
          </div>
        )}
        
        {showSuccess && (
          <div className="success-message">
            <Check size={20} />
            Flashcard added successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="question">Question/Topic:</label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question or topic here..."
              required
              rows={4}
            />
          </div>

          <div className="form-group">
            <div className="answer-header">
              <label htmlFor="answer">Answer/Notes:</label>
              <div className="ai-actions">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn btn-secondary btn-sm"
                >
                  <Eye size={16} />
                  {showPreview ? 'Hide Preview' : 'Preview LaTeX'}
                </button>
                {aiSuggestions?.summary && (
                  <button
                    type="button"
                    onClick={handleUseSummary}
                    className="btn btn-secondary btn-sm"
                  >
                    <Lightbulb size={16} />
                    Use AI Summary
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing || !answer.trim()}
                  className="btn btn-primary btn-sm"
                >
                  <Brain size={16} />
                  {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
                </button>
              </div>
            </div>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer or notes here... Use $...$ for inline math or $$...$$ for block math"
              required
              rows={6}
            />
            {showPreview && answer.trim() && (
              <div className="latex-preview">
                <h4>Preview:</h4>
                <MarkdownText>{answer}</MarkdownText>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="folder">Study Folder:</label>
              <select
                id="folder"
                value={selectedFolder}
                onChange={(e) => handleFolderChange(e.target.value)}
                className="folder-select"
              >
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.icon} {folder.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="category">Category (optional):</label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., JavaScript, System Design, Behavioral"
                list="categories"
              />
              <datalist id="categories">
                {existingCategories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="current-folder-info">
            <p>
              <span style={{ fontSize: '1.2rem' }}>{getFolderById(selectedFolder)?.icon}</span>
              Adding to: <strong>{getFolderById(selectedFolder)?.name}</strong>
            </p>
            <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
              {getFolderById(selectedFolder)?.description}
            </p>
          </div>

          <button type="submit" className="btn btn-primary">
            <Plus size={20} />
            Add Flashcard
          </button>
        </form>

        {aiSuggestions && (
          <div className="ai-suggestions">
            <h3>
              <Sparkles size={20} />
              AI Analysis Results
            </h3>

            {aiSuggestions.summary && (
              <div className="suggestion-section">
                <h4>Summary</h4>
                <div className="summary-box">
                  <p>{aiSuggestions.summary}</p>
                </div>
              </div>
            )}

            {aiSuggestions.concepts.length > 0 && (
              <div className="suggestion-section">
                <h4>Extracted Concepts</h4>
                <div className="concepts-grid">
                  {aiSuggestions.concepts.map((concept, index) => (
                    <div key={index} className="concept-card">
                      <div className="concept-name">{concept.concept}</div>
                      <div className="concept-definition">{concept.definition}</div>
                      <div className="concept-confidence">
                        Confidence: {Math.round(concept.confidence * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiSuggestions.suggestedFlashcards.length > 0 && (
              <div className="suggestion-section">
                <h4>Suggested Flashcards</h4>
                <div className="suggested-cards">
                  {aiSuggestions.suggestedFlashcards.map((card, index) => (
                    <div key={index} className="suggested-card">
                      <div className="suggested-card-content">
                        <div className="suggested-question">
                          <strong>Q:</strong> {card.question}
                        </div>
                        <div className="suggested-answer">
                          <strong>A:</strong> {card.answer}
                        </div>
                        <div className="suggested-category">
                          Category: {card.category}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddSuggestedCard(card)}
                        className="btn btn-success btn-sm"
                      >
                        <Plus size={16} />
                        Add This Card
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEnhancedAddTab;
