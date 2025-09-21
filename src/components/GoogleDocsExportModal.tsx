import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Flashcard, StudyFolder } from "../types/flashcard";
import {
  googleDocsService,
  type GoogleDriveFolder,
} from "../services/googleDocsService";

interface GoogleDocsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: Flashcard[];
  folders: StudyFolder[];
  selectedCards?: Set<string>;
}

const GoogleDocsExportModal: React.FC<GoogleDocsExportModalProps> = ({
  isOpen,
  onClose,
  flashcards,
  folders: _folders,
  selectedCards = new Set(),
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [documentUrl, setDocumentUrl] = useState<string>("");
  const [driveFolders, setDriveFolders] = useState<GoogleDriveFolder[]>([]);

  // Export options
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [includeCategory, setIncludeCategory] = useState(true);
  const [includeFolder, setIncludeFolder] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [appendToExisting, setAppendToExisting] = useState(false);
  const [existingDocumentId, setExistingDocumentId] = useState("");
  const [sortBy, setSortBy] = useState<
    "recent" | "alphabetical" | "category" | "none"
  >("recent");
  const [cardsToExport, setCardsToExport] = useState<Set<string>>(new Set());

  // Initialize with selected cards or all cards
  useEffect(() => {
    if (selectedCards.size > 0) {
      setCardsToExport(new Set(selectedCards));
      setDocumentTitle(`Flashcards Export - ${selectedCards.size} cards`);
    } else {
      const allCardIds = new Set(flashcards.map((card) => card.id));
      setCardsToExport(allCardIds);
      setDocumentTitle(`Flashcards Export - ${flashcards.length} cards`);
    }
  }, [selectedCards, flashcards]);

  // Check authentication status when modal opens
  useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen]);

  const checkAuthStatus = async () => {
    await googleDocsService.initialize();
    setIsAuthenticated(googleDocsService.isAuthenticated());

    if (googleDocsService.isAuthenticated()) {
      loadDriveFolders();
    }
  };

  const loadDriveFolders = async () => {
    try {
      const folders = await googleDocsService.getDriveFolders();
      setDriveFolders(folders);
    } catch (error) {
      console.error("Failed to load Drive folders:", error);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const success = await googleDocsService.signIn();
      if (success) {
        setIsAuthenticated(true);
        await loadDriveFolders();
      }
    } catch (error) {
      console.error("Sign-in failed:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleDocsService.signOut();
    setIsAuthenticated(false);
    setDriveFolders([]);
  };

  const handleExport = async () => {
    if (!isAuthenticated || cardsToExport.size === 0) return;

    setIsExporting(true);
    setExportStatus("idle");

    try {
      // Double-check authentication before export
      if (!googleDocsService.isAuthenticated()) {
        throw new Error("Authentication expired. Please sign in again.");
      }
      const cardsToExportArray = flashcards.filter((card) =>
        cardsToExport.has(card.id)
      );

      const documentId = await googleDocsService.exportToGoogleDocs({
        title: documentTitle || "Flashcards Export",
        flashcards: cardsToExportArray,
        driveFolder: selectedFolder || undefined,
        includeCategory,
        includeFolder,
        includeStats,
        appendToExisting,
        existingDocumentId: existingDocumentId || undefined,
        sortBy,
      });

      const url = googleDocsService.getDocumentUrl(documentId);
      setDocumentUrl(url);
      setExportStatus("success");
    } catch (error) {
      console.error("Export failed:", error);
      setExportStatus("error");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleCardSelection = (cardId: string) => {
    const newSelection = new Set(cardsToExport);
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId);
    } else {
      newSelection.add(cardId);
    }
    setCardsToExport(newSelection);
  };

  const selectAllCards = () => {
    const allCardIds = new Set(flashcards.map((card) => card.id));
    setCardsToExport(allCardIds);
  };

  const deselectAllCards = () => {
    setCardsToExport(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content google-docs-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="header-content">
            <FileText size={24} />
            <div>
              <h3>Export to Google Docs</h3>
              <p>Create a formatted document with your flashcards</p>
            </div>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {!isAuthenticated ? (
            <div className="auth-section">
              <div className="auth-info">
                <h4>Google Account Required</h4>
                <p>
                  Sign in with your Google account to export flashcards to
                  Google Docs and save them to Google Drive.
                </p>
              </div>
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="btn btn-primary"
              >
                {isSigningIn ? "Signing in..." : "Sign in with Google"}
              </button>
            </div>
          ) : (
            <>
              {exportStatus === "success" ? (
                <div className="export-success">
                  <CheckCircle2 size={48} color="#22c55e" />
                  <h4>Export Successful!</h4>
                  <p>Your flashcards have been exported to Google Docs.</p>
                  <div className="success-actions">
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      <ExternalLink size={16} />
                      Open Document
                    </a>
                    <button onClick={onClose} className="btn btn-secondary">
                      Close
                    </button>
                  </div>
                </div>
              ) : exportStatus === "error" ? (
                <div className="export-error">
                  <AlertCircle size={48} color="#ef4444" />
                  <h4>Export Failed</h4>
                  <p>
                    There was an error exporting your flashcards. This might be
                    due to authentication issues.
                  </p>
                  <div className="error-actions">
                    <button
                      onClick={() => setExportStatus("idle")}
                      className="btn btn-secondary"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleSignIn}
                      disabled={isSigningIn}
                      className="btn btn-primary"
                    >
                      {isSigningIn ? "Signing in..." : "Re-authenticate"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="export-options">
                    <div className="option-group">
                      <label htmlFor="document-title">Document Title</label>
                      <input
                        id="document-title"
                        type="text"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        placeholder="Enter document title"
                      />
                    </div>

                    <div className="option-group">
                      <label htmlFor="drive-folder">
                        Google Drive Folder (Optional)
                      </label>
                      <select
                        id="drive-folder"
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                      >
                        <option value="">Save to My Drive</option>
                        {driveFolders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="option-group">
                      <label htmlFor="sort-options">Sort Cards By</label>
                      <select
                        id="sort-options"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                      >
                        <option value="recent">Most Recent First</option>
                        <option value="alphabetical">Alphabetical (A-Z)</option>
                        <option value="category">By Category</option>
                        <option value="none">No Sorting</option>
                      </select>
                    </div>

                    <div className="option-group">
                      <h5>Export Options</h5>
                      <div className="checkbox-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={includeCategory}
                            onChange={(e) =>
                              setIncludeCategory(e.target.checked)
                            }
                          />
                          Category information
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={includeFolder}
                            onChange={(e) => setIncludeFolder(e.target.checked)}
                          />
                          Folder information
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={includeStats}
                            onChange={(e) => setIncludeStats(e.target.checked)}
                          />
                          Summary statistics
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={appendToExisting}
                            onChange={(e) =>
                              setAppendToExisting(e.target.checked)
                            }
                          />
                          Append to existing document
                        </label>
                      </div>
                    </div>

                    {appendToExisting && (
                      <div className="option-group">
                        <label htmlFor="existing-doc-id">
                          Existing Document ID
                        </label>
                        <input
                          id="existing-doc-id"
                          type="text"
                          value={existingDocumentId}
                          onChange={(e) =>
                            setExistingDocumentId(e.target.value)
                          }
                          placeholder="Paste the document ID from the Google Docs URL"
                        />
                        <small
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.75rem",
                          }}
                        >
                          Get this from the Google Docs URL:
                          docs.google.com/document/d/[DOCUMENT_ID]/edit
                        </small>
                      </div>
                    )}
                  </div>

                  <div className="card-selection">
                    <div className="selection-header">
                      <h5>
                        Select Cards to Export ({cardsToExport.size} selected)
                      </h5>
                      <div className="selection-actions">
                        <button
                          onClick={selectAllCards}
                          className="btn btn-secondary btn-sm"
                        >
                          Select All
                        </button>
                        <button
                          onClick={deselectAllCards}
                          className="btn btn-secondary btn-sm"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    <div className="cards-list">
                      {flashcards.map((card) => (
                        <div
                          key={card.id}
                          className={`card-item ${
                            cardsToExport.has(card.id) ? "selected" : ""
                          }`}
                          onClick={() => toggleCardSelection(card.id)}
                        >
                          <div className="card-checkbox">
                            <input
                              type="checkbox"
                              checked={cardsToExport.has(card.id)}
                              onChange={() => toggleCardSelection(card.id)}
                            />
                          </div>
                          <div className="card-info">
                            <div className="card-question">{card.question}</div>
                            <div className="card-meta">
                              <span className="card-category">
                                {card.category}
                              </span>
                              <span className="card-folder">{card.folder}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {isAuthenticated && exportStatus === "idle" && (
          <div className="modal-footer">
            <div className="footer-info">
              <span>Signed in • {cardsToExport.size} cards selected</span>
              <button onClick={handleSignOut} className="btn btn-text btn-sm">
                Sign out
              </button>
            </div>
            <div className="footer-actions">
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || cardsToExport.size === 0}
                className="btn btn-primary"
              >
                <Download size={16} />
                {isExporting
                  ? "Exporting..."
                  : `Export ${cardsToExport.size} Cards`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleDocsExportModal;
