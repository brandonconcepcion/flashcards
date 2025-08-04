import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';

interface AddCardTabProps {
  addFlashcard: (question: string, answer: string, category: string) => void;
  getCategories: () => string[];
}

const AddCardTab: React.FC<AddCardTabProps> = ({ addFlashcard, getCategories }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const existingCategories = getCategories();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !answer.trim()) {
      return;
    }

    addFlashcard(question, answer, category);
    
    // Reset form
    setQuestion('');
    setAnswer('');
    setCategory('');
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="add-card-tab">
      <div className="card-form">
        <h2>Add a New Flashcard</h2>
        
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
            <label htmlFor="answer">Answer/Notes:</label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer or notes here..."
              required
              rows={6}
            />
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

          <button type="submit" className="btn btn-primary">
            <Plus size={20} />
            Add Flashcard
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCardTab;
