import { useState } from 'react';
import { BookOpen, Plus, Settings, Brain, Folder } from 'lucide-react';
import type { TabType } from './types/flashcard';
import { useFlashcards } from './hooks/useFlashcards';
import { usePersistentState } from './hooks/usePersistentState';
import AIEnhancedAddTab from './components/AIEnhancedAddTab';
import StudyTab from './components/StudyTab';
import ManageTab from './components/ManageTab';
import FoldersTab from './components/FoldersTab';
import AnimatedCounter from './components/AnimatedCounter';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('folders');
  const flashcardHook = useFlashcards();
  const persistentState = usePersistentState();

  const tabs = [
    { id: 'folders' as TabType, label: 'Study Folders', icon: Folder },
    { id: 'add' as TabType, label: 'Add Cards', icon: Plus },
    { id: 'study' as TabType, label: 'Study Mode', icon: Brain },
    { id: 'manage' as TabType, label: 'Manage Cards', icon: Settings },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <BookOpen size={32} />
            <div>
              <h1>Brainzlet Concepcion</h1>
              <p>Personal flashcards for interview preparation</p>
              <small style={{ opacity: 0.8, fontSize: '0.75rem' }}>
                🔒 All data stored locally on your device
              </small>
            </div>
          </div>
          <div className="stats">
            <div className="stat total-cards-stat">
              <div className="stat-content">
                <div className="stat-number">
                  <AnimatedCounter target={flashcardHook.flashcards.length} duration={1500} delay={0} />
                </div>
                <div className="stat-label">total cards</div>
              </div>
            </div>
            <div className="stat folders-stat">
              <div className="stat-content">
                <div className="stat-number">
                  <AnimatedCounter target={flashcardHook.folders.length} duration={1000} delay={400} />
                </div>
                <div className="stat-label">folders</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <main className="main-content">
        {activeTab === 'folders' && <FoldersTab {...flashcardHook} />}
        {activeTab === 'add' && <AIEnhancedAddTab {...flashcardHook} persistentState={persistentState} />}
        {activeTab === 'study' && <StudyTab {...flashcardHook} persistentState={persistentState} />}
        {activeTab === 'manage' && <ManageTab {...flashcardHook} persistentState={persistentState} />}
      </main>
    </div>
  );
}

export default App;
