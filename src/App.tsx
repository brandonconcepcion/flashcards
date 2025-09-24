import { useState } from "react";
import { BookOpen, Plus, Edit3, Cog, Play, Pause, Square } from "lucide-react";
import type { TabType } from "./types/flashcard";
import { useFlashcards } from "./hooks/useFlashcards";
import { usePersistentState } from "./hooks/usePersistentState";
import { useHeaderFeatures } from "./hooks/useHeaderFeatures";
import AddTab from "./components/AddTab";
import StudyTab from "./components/StudyTab";
import ManageTab from "./components/ManageTabNew";
import ResumeGrillerTab from "./components/ResumeGrillerTab";
import AnimatedCounter from "./components/AnimatedCounter";
// PhotoUploadModal removed
import SettingsTab from "./components/SettingsTab";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("study");
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [timerInputValue, setTimerInputValue] = useState("25");
  const flashcardHook = useFlashcards();
  const persistentState = usePersistentState();
  const headerFeatures = useHeaderFeatures();

  // Development flag - set to true to show Resume Griller tab in development
  const SHOW_RESUME_GRILLER = false;

  const tabs = [
    { id: "study" as TabType, label: "Study Mode", icon: BookOpen },
    { id: "add" as TabType, label: "Add Cards", icon: Plus },
    { id: "manage" as TabType, label: "Manage Cards", icon: Edit3 },
    { id: "settings" as TabType, label: "Settings", icon: Cog },
  ];

  return (
    <div className="app">
      <header
        className="app-header"
        style={{
          backgroundImage: "var(--header-gradient)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="header-content">
          <div className="header-brand">
            <div className="brand-icon">
              <span className="brain-emoji">🧠</span>
            </div>
            <div className="brand-text">
              <h1>Brainzlet</h1>
            </div>

            {/* Timer Controls - moved next to brand */}
            <div className="timer-controls">
              <div className="timer-display">
                {isEditingTimer ? (
                  <input
                    type="number"
                    value={timerInputValue}
                    onChange={(e) => setTimerInputValue(e.target.value)}
                    onBlur={() => {
                      const minutes = parseInt(timerInputValue) || 25;
                      headerFeatures.resetTimer(minutes);
                      setIsEditingTimer(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const minutes = parseInt(timerInputValue) || 25;
                        headerFeatures.resetTimer(minutes);
                        setIsEditingTimer(false);
                      }
                      if (e.key === "Escape") {
                        setIsEditingTimer(false);
                      }
                    }}
                    className="timer-input-inline"
                    min="1"
                    max="180"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => {
                      if (!headerFeatures.timer.isRunning) {
                        setTimerInputValue(
                          Math.ceil(
                            headerFeatures.timer.remainingTime / (60 * 1000)
                          ).toString()
                        );
                        setIsEditingTimer(true);
                      }
                    }}
                    className={`timer-time ${
                      !headerFeatures.timer.isRunning ? "editable" : ""
                    }`}
                    title={
                      !headerFeatures.timer.isRunning
                        ? "Click to edit timer duration"
                        : "Timer is running"
                    }
                  >
                    {headerFeatures.formatTime(
                      headerFeatures.timer.remainingTime
                    )}
                  </span>
                )}
              </div>
              <div className="timer-buttons">
                {!headerFeatures.timer.isRunning ? (
                  <button
                    onClick={() => headerFeatures.startTimer()}
                    className="timer-btn start-btn"
                    title="Start 25min timer"
                  >
                    <Play size={16} />
                  </button>
                ) : (
                  <button
                    onClick={headerFeatures.stopTimer}
                    className="timer-btn stop-btn"
                    title="Pause timer"
                  >
                    <Pause size={16} />
                  </button>
                )}
                <button
                  onClick={() => headerFeatures.resetTimer()}
                  className="timer-btn reset-btn"
                  title="Reset to 25min"
                >
                  <Square size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Text Overlay */}
          {headerFeatures.textOverlay.enabled &&
            headerFeatures.textOverlay.text && (
              <div
                className={`header-text-overlay ${headerFeatures.textOverlay.position}`}
                style={{
                  opacity: headerFeatures.textOverlay.opacity,
                  fontSize: `${headerFeatures.textOverlay.fontSize}rem`,
                  color: headerFeatures.textOverlay.color,
                  fontFamily:
                    headerFeatures.textOverlay.fontFamily === "arial"
                      ? "'Arial', 'Helvetica', sans-serif"
                      : headerFeatures.textOverlay.fontFamily === "helvetica"
                      ? "'Helvetica', 'Arial', sans-serif"
                      : headerFeatures.textOverlay.fontFamily === "times"
                      ? "'Times New Roman', 'Times', serif"
                      : headerFeatures.textOverlay.fontFamily === "georgia"
                      ? "'Georgia', 'Times New Roman', serif"
                      : headerFeatures.textOverlay.fontFamily === "garamond"
                      ? "'Garamond', 'Times New Roman', serif"
                      : headerFeatures.textOverlay.fontFamily === "verdana"
                      ? "'Verdana', 'Geneva', sans-serif"
                      : headerFeatures.textOverlay.fontFamily === "calibri"
                      ? "'Calibri', 'Candara', sans-serif"
                      : headerFeatures.textOverlay.fontFamily === "trebuchet"
                      ? "'Trebuchet MS', 'Helvetica', sans-serif"
                      : headerFeatures.textOverlay.fontFamily === "serif"
                      ? "'Times New Roman', serif"
                      : headerFeatures.textOverlay.fontFamily === "sans-serif"
                      ? "'Helvetica', 'Arial', sans-serif"
                      : headerFeatures.textOverlay.fontFamily === "monospace"
                      ? "'Monaco', 'Courier New', monospace"
                      : "'Brush Script MT', cursive",
                }}
              >
                {headerFeatures.textOverlay.text}
              </div>
            )}

          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">
                <AnimatedCounter
                  target={flashcardHook.flashcards.length}
                  duration={1500}
                  delay={0}
                />
              </span>
              <span className="stat-label">Cards</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">
                <AnimatedCounter
                  target={flashcardHook.folders.length}
                  duration={1000}
                  delay={400}
                />
              </span>
              <span className="stat-label">Folders</span>
            </div>
          </div>
        </div>
      </header>

      <div className="app-body">
        <nav className="sidebar-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`sidebar-btn ${
                  activeTab === tab.id ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </nav>

        <main className="main-content">
          {activeTab === "add" && (
            <AddTab {...flashcardHook} persistentState={persistentState} />
          )}
          {activeTab === "study" && (
            <StudyTab {...flashcardHook} persistentState={persistentState} />
          )}
          {activeTab === "manage" && (
            <ManageTab {...flashcardHook} persistentState={persistentState} />
          )}
          {activeTab === "settings" && (
            <SettingsTab
              textOverlay={headerFeatures.textOverlay}
              timer={headerFeatures.timer}
              onUpdateTextOverlay={headerFeatures.updateTextOverlay}
              formatTime={headerFeatures.formatTime}
              onStartTimer={headerFeatures.startTimer}
              onResetTimer={headerFeatures.resetTimer}
            />
          )}
          {/* Resume Griller tab hidden for development - set SHOW_RESUME_GRILLER to true to enable */}
          {SHOW_RESUME_GRILLER && activeTab === "resume-griller" && (
            <ResumeGrillerTab
              addFlashcard={flashcardHook.addFlashcard}
              folders={flashcardHook.folders}
              currentFolder={flashcardHook.currentFolder}
            />
          )}
        </main>
      </div>

      {/* Photo upload removed */}
    </div>
  );
}

export default App;
