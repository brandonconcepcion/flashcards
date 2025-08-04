import { useState } from 'react';
// import { BookOpen, Plus, Brain } from 'lucide-react';
import { BookOpen, Plus, Settings, Brain } from 'lucide-react';
import type { TabType } from './types/flashcard';
import { useFlashcards } from './hooks/useFlashcards';
import AIEnhancedAddTab from './components/AIEnhancedAddTab';
import StudyTab from './components/StudyTab';
import ManageTab from './components/ManageTab';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('add');
  const flashcardHook = useFlashcards();

  const tabs = [
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
            <span className="stat">
              {flashcardHook.flashcards.length} cards
            </span>
            <span className="stat">
              {flashcardHook.getCategories().length} categories
            </span>
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
        {activeTab === 'add' && <AIEnhancedAddTab {...flashcardHook} />}
        {activeTab === 'study' && <StudyTab {...flashcardHook} />}
        {activeTab === 'manage' && <ManageTab {...flashcardHook} />}
      </main>
    </div>
  );
}

export default App;
