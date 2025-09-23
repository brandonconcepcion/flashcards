import { useState } from "react";
import { Plus, Eye, Check } from "lucide-react";
import type { StudyFolder } from "../types/flashcard";
import MarkdownText from "./MarkdownText";

interface AddTabProps {
  addFlashcard: (
    question: string,
    answer: string,
    category: string,
    folder: string
  ) => void;
  getCategoriesByFolder: (folderId: string) => string[];
  folders: StudyFolder[];
  currentFolder: string;
  getFolderById: (id: string) => StudyFolder | undefined;
  persistentState: {
    state: {
      addCardSelectedFolder: string;
      addCardLastCategory: Record<string, string>;
    };
    updateState: (updates: any) => void;
  };
}

const AddTab: React.FC<AddTabProps> = ({
  addFlashcard,
  getCategoriesByFolder,
  folders,
  currentFolder,
  getFolderById,
  persistentState,
}) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState(() => {
    const selectedFolder =
      persistentState.state.addCardSelectedFolder || currentFolder;
    return persistentState.state.addCardLastCategory[selectedFolder] || "";
  });
  const [selectedFolder, setSelectedFolder] = useState(
    persistentState.state.addCardSelectedFolder || currentFolder
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const existingCategories = getCategoriesByFolder(selectedFolder);

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
        [selectedFolder]: category,
      },
      addCardSelectedFolder: selectedFolder,
    });

    // Reset form
    setQuestion("");
    setAnswer("");
    // Don't reset category - keep it persistent

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleFolderChange = (newFolderId: string) => {
    setSelectedFolder(newFolderId);
    // Update category to the last used category for this folder
    const lastCategory =
      persistentState.state.addCardLastCategory[newFolderId] || "";
    setCategory(lastCategory);

    // Update persistent state
    persistentState.updateState({
      addCardSelectedFolder: newFolderId,
    });
  };

  return (
    <div className="add-cards-tab">
      <div
        className="current-folder-info"
        style={{
          marginBottom: "24px",
          padding: "20px",
          background: "var(--bg-secondary)",
          borderRadius: "12px",
          border: "1px solid var(--border-primary)",
        }}
      >
        <div className="folder-management-section">
          <div className="folder-selector">
            <label>Adding to:</label>
            <div className="folder-switcher">
              <select
                value={selectedFolder}
                onChange={(e) => handleFolderChange(e.target.value)}
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
                  const currentFolderData = getFolderById(selectedFolder);
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
                  {getFolderById(selectedFolder)?.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="category-input-section">
          <label>Category:</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Optional category"
            list="categories"
            className="category-input"
          />
          <datalist id="categories">
            {existingCategories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
        <p style={{ fontSize: "0.875rem", opacity: 0.7, margin: "0" }}>
          {getFolderById(selectedFolder)?.description}
        </p>
      </div>

      <div className="add-card-form">
        {showSuccess && (
          <div className="success-message">
            <Check size={20} />
            Flashcard added successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            className="enhanced-form-row"
            style={{ alignItems: "flex-start", gap: "24px" }}
          >
            <div className="form-section" style={{ flex: "1", margin: "0" }}>
              <h3>Question</h3>
              <div className="input-group">
                <label htmlFor="question">What do you want to learn?</label>
                <textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question or topic here..."
                  required
                  rows={6}
                />
              </div>
            </div>

            <div className="form-section" style={{ flex: "1", margin: "0" }}>
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                Answer
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn-secondary-enhanced"
                  style={{
                    fontSize: "0.8rem",
                    padding: "4px 8px",
                    minWidth: "auto",
                  }}
                >
                  <Eye size={14} />
                  {showPreview ? "Hide" : "Preview"}
                </button>
              </h3>
              <div className="input-group">
                <label htmlFor="answer">Your knowledge and notes</label>
                <textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter the answer or notes here... Use $...$ for inline math or $$...$$ for block math"
                  required
                  rows={6}
                />
              </div>
              {showPreview && answer.trim() && (
                <div className="latex-preview" style={{ marginTop: "12px" }}>
                  <h4>Preview:</h4>
                  <MarkdownText>{answer}</MarkdownText>
                </div>
              )}
            </div>
          </div>
          {/* Add Flashcard Button - bottom right of form */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid var(--border-primary)",
            }}
          >
            <button
              type="submit"
              className="btn-primary-enhanced"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any);
              }}
            >
              <Plus size={20} />
              Add Flashcard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTab;
