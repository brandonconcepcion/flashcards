# Study Flashcards App - Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [State Management](#state-management)
6. [Styling System](#styling-system)
7. [Feature Implementation Guide](#feature-implementation-guide)
8. [Adding New Features](#adding-new-features)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

The Study Flashcards App is a React-based single-page application built with TypeScript and Vite. It provides a complete flashcard study system with AI-enhanced features, markdown/LaTeX support, and local data persistence.

### Key Technologies
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Pure CSS with custom design system
- **Math Rendering**: KaTeX via react-katex
- **Markdown**: Custom parser with LaTeX integration
- **AI Integration**: OpenAI API
- **Storage**: Browser localStorage
- **Icons**: Lucide React

### Core Features
- Create, edit, and delete flashcards
- Study mode with spaced repetition tracking
- AI-powered content analysis and suggestions
- Full markdown support with LaTeX math rendering
- Import/export functionality
- Category-based organization
- Responsive design

---

## Architecture

### Project Structure
```
src/
├── components/          # React components
│   ├── AddCardTab.tsx          # Basic card creation (legacy)
│   ├── AIEnhancedAddTab.tsx    # AI-powered card creation
│   ├── StudyTab.tsx            # Study mode interface
│   ├── ManageTab.tsx           # Card management interface
│   ├── LaTeXText.tsx           # Legacy LaTeX renderer
│   └── MarkdownText.tsx        # New markdown+LaTeX renderer
├── hooks/               # Custom React hooks
│   └── useFlashcards.ts        # Main data management hook
├── services/            # External service integrations
│   └── aiService.ts            # OpenAI API integration
├── types/               # TypeScript type definitions
│   └── flashcard.ts            # Core data types
├── App.tsx              # Main application component
├── App.css              # Global styles and design system
├── main.tsx             # Application entry point
└── index.css            # Base CSS reset and fonts
```

### Component Hierarchy
```
App
├── Header (inline)
├── Tab Navigation (inline)
└── Main Content
    ├── AIEnhancedAddTab (when "Add Cards" selected)
    ├── StudyTab (when "Study Mode" selected)
    └── ManageTab (when "Manage Cards" selected)
```

---

## Core Components

### 1. App.tsx - Main Application
**Purpose**: Root component that manages global state and tab navigation.

**Key Responsibilities**:
- Tab state management
- Flashcard data coordination
- Header statistics display
- Component routing

**State**:
```typescript
const [activeTab, setActiveTab] = useState<'add' | 'study' | 'manage'>('add');
```

**Props Passed Down**:
- All flashcard CRUD operations
- Category management functions
- Search and filter utilities

### 2. useFlashcards.ts - Data Management Hook
**Purpose**: Central data management with localStorage persistence.

**Key Functions**:
```typescript
// Core CRUD operations
addFlashcard(question: string, answer: string, category: string): void
updateFlashcard(id: string, updates: Partial<Flashcard>): void
deleteFlashcard(id: string): void

// Utility functions
getCategories(): string[]
getCardsByCategory(category: string): Flashcard[]
searchCards(query: string): Flashcard[]
shuffleCards(cards: Flashcard[]): Flashcard[]
markAsReviewed(id: string, difficulty: 'easy' | 'medium' | 'hard'): void
importFlashcards(flashcards: Flashcard[]): void
```

**Data Persistence**:
- Automatic localStorage sync on every change
- JSON serialization with date handling
- Error handling for corrupted data

### 3. AIEnhancedAddTab.tsx - Card Creation
**Purpose**: Advanced card creation with AI assistance and markdown preview.

**Key Features**:
- Real-time markdown preview
- AI content analysis
- LaTeX help system
- API key management
- Suggested card generation

**AI Integration Flow**:
1. User enters content in answer field
2. Clicks "AI Analyze" button
3. Content sent to OpenAI API via aiService
4. Response parsed into concepts and suggestions
5. UI updated with analysis results

### 4. StudyTab.tsx - Study Interface
**Purpose**: Interactive study mode with spaced repetition.

**Key Features**:
- 3D flip card animations
- Category filtering
- Card shuffling
- Difficulty tracking
- Progress indicators

**Study Flow**:
1. Select category (optional)
2. Cards loaded and optionally shuffled
3. User studies question → flips → sees answer
4. Marks difficulty (easy/medium/hard)
5. System tracks review data
6. Auto-advances to next card

### 5. ManageTab.tsx - Card Management
**Purpose**: Comprehensive card management and statistics.

**Key Features**:
- Search functionality
- Inline editing
- Bulk operations (import/export)
- Statistics dashboard
- Category management

**Search Implementation**:
```typescript
// Searches across question, answer, and category
const searchCards = (query: string): Flashcard[] => {
  const lowercaseQuery = query.toLowerCase();
  return flashcards.filter(card =>
    card.question.toLowerCase().includes(lowercaseQuery) ||
    card.answer.toLowerCase().includes(lowercaseQuery) ||
    card.category.toLowerCase().includes(lowercaseQuery)
  );
};
```

### 6. MarkdownText.tsx - Content Renderer
**Purpose**: Renders markdown content with LaTeX math support.

**Supported Markdown Features**:
- Headers (H1-H6)
- Bold and italic text
- Unordered and ordered lists with indentation
- Code blocks with syntax highlighting
- Inline code
- Blockquotes
- Horizontal rules
- LaTeX math (inline and block)

**LaTeX Integration**:
- Inline math: `$E = mc^2$`
- Block math: `$$\int_0^1 x^2 dx$$`
- Error handling for invalid LaTeX
- KaTeX rendering engine

---

## Data Flow

### 1. Data Storage Flow
```
User Action → Component → useFlashcards Hook → localStorage → State Update → UI Re-render
```

### 2. AI Analysis Flow
```
User Input → AIEnhancedAddTab → aiService → OpenAI API → Response Processing → UI Update
```

### 3. Study Session Flow
```
Category Selection → Card Filtering → Shuffle (optional) → Study Loop → Difficulty Marking → Progress Tracking
```

---

## State Management

### Local State (Component Level)
Each component manages its own UI state:
- Form inputs
- Modal visibility
- Loading states
- Temporary data

### Global State (useFlashcards Hook)
Centralized data management:
```typescript
interface FlashcardState {
  flashcards: Flashcard[];
  // Derived state computed on-demand:
  // - categories
  // - filtered cards
  // - search results
}
```

### Persistence Strategy
- **Automatic**: Every state change triggers localStorage save
- **Synchronous**: No async operations for data persistence
- **Error Handling**: Graceful fallback for corrupted data
- **Migration**: Future-proof data structure

---

## Styling System

### Design Tokens
```css
/* Colors */
--primary: #667eea;
--secondary: #764ba2;
--success: #22c55e;
--warning: #f59e0b;
--danger: #ef4444;

/* Spacing */
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

/* Typography */
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
```

### Component Patterns
- **BEM-like naming**: `.component-element--modifier`
- **Utility classes**: `.btn`, `.btn-primary`, `.btn-sm`
- **Responsive design**: Mobile-first approach
- **CSS Grid/Flexbox**: Modern layout techniques

### Theming
- **Glass morphism**: Backdrop blur effects
- **Gradient backgrounds**: Purple-blue theme
- **Consistent shadows**: Layered depth system
- **Smooth animations**: 0.2s ease transitions

---

## Feature Implementation Guide

### Adding a New Tab
1. Create component in `src/components/`
2. Add tab type to App.tsx state
3. Update tab navigation JSX
4. Add routing logic in main content area
5. Style with existing design system

### Adding New Flashcard Properties
1. Update `Flashcard` interface in `types/flashcard.ts`
2. Modify `useFlashcards` hook for new property handling
3. Update form components for input
4. Modify display components for rendering
5. Handle data migration in localStorage

### Integrating New AI Features
1. Extend `aiService.ts` with new API calls
2. Update `AISuggestions` interface if needed
3. Add UI components for new features
4. Implement loading and error states
5. Add user feedback mechanisms

### Adding Export Formats
1. Create new export function in `ManageTab.tsx`
2. Implement format-specific serialization
3. Add UI button and file handling
4. Test with various data sets
5. Add import counterpart if needed

---

## Adding New Features

### Step-by-Step Process

#### 1. Planning Phase
- Define feature requirements
- Identify affected components
- Plan data structure changes
- Consider UI/UX implications

#### 2. Data Layer Changes
```typescript
// Example: Adding tags to flashcards
interface Flashcard {
  // ... existing properties
  tags: string[]; // New property
}

// Update useFlashcards hook
const addTag = (cardId: string, tag: string) => {
  updateFlashcard(cardId, {
    tags: [...(getCard(cardId)?.tags || []), tag]
  });
};
```

#### 3. UI Implementation
```typescript
// Example: Tag input component
const TagInput: React.FC<{
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}> = ({ tags, onTagsChange }) => {
  // Implementation here
};
```

#### 4. Integration
- Connect new components to data layer
- Update existing components as needed
- Add proper TypeScript types
- Implement error handling

#### 5. Styling
- Follow existing design patterns
- Add responsive behavior
- Test across different screen sizes
- Ensure accessibility

### Common Patterns

#### Adding Form Fields
```typescript
// 1. Add to component state
const [newField, setNewField] = useState('');

// 2. Add input JSX
<input
  value={newField}
  onChange={(e) => setNewField(e.target.value)}
  className="form-control"
/>

// 3. Include in form submission
const handleSubmit = () => {
  addFlashcard(question, answer, category, newField);
};
```

#### Adding Filters
```typescript
// 1. Add filter function to useFlashcards
const filterByNewCriteria = (criteria: string): Flashcard[] => {
  return flashcards.filter(card => 
    // Filter logic here
  );
};

// 2. Add UI controls
const [filterValue, setFilterValue] = useState('');

// 3. Apply filter to displayed data
const displayCards = filterByNewCriteria(filterValue);
```

#### Adding Statistics
```typescript
// 1. Add calculation function
const calculateNewStat = (): number => {
  return flashcards.reduce((acc, card) => {
    // Calculation logic
    return acc + someValue;
  }, 0);
};

// 2. Display in UI
<div className="stat-card">
  <div className="stat-number">{calculateNewStat()}</div>
  <div className="stat-label">New Statistic</div>
</div>
```

---

## Troubleshooting

### Common Issues

#### 1. Cards Not Saving
**Symptoms**: Changes don't persist after refresh
**Causes**: 
- localStorage quota exceeded
- JSON serialization errors
- Browser privacy settings

**Solutions**:
```typescript
// Add error handling to save function
const saveToStorage = (data: Flashcard[]) => {
  try {
    localStorage.setItem('flashcards', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    // Implement fallback or user notification
  }
};
```

#### 2. LaTeX Not Rendering
**Symptoms**: Math formulas show as raw text
**Causes**:
- Invalid LaTeX syntax
- KaTeX library not loaded
- Component rendering issues

**Solutions**:
- Check browser console for KaTeX errors
- Validate LaTeX syntax
- Ensure react-katex is properly imported

#### 3. AI Features Not Working
**Symptoms**: AI analysis fails or returns errors
**Causes**:
- Invalid API key
- Network connectivity issues
- API rate limits
- Malformed requests

**Solutions**:
```typescript
// Add comprehensive error handling
const analyzeText = async (text: string): Promise<AISuggestions> => {
  try {
    const response = await openai.chat.completions.create({
      // ... request config
    });
    return parseResponse(response);
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Invalid API key');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded');
    } else {
      throw new Error('AI service unavailable');
    }
  }
};
```

#### 4. Performance Issues
**Symptoms**: Slow rendering with many cards
**Causes**:
- Large dataset rendering
- Inefficient re-renders
- Heavy computations in render

**Solutions**:
- Implement virtualization for large lists
- Use React.memo for expensive components
- Move calculations to useMemo hooks
- Implement pagination

### Debugging Tips

#### 1. React DevTools
- Install React DevTools browser extension
- Inspect component state and props
- Profile component renders
- Track state changes

#### 2. Console Debugging
```typescript
// Add debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data);
  }
};
```

#### 3. Network Issues
- Check browser Network tab for API calls
- Verify request/response formats
- Test API endpoints independently
- Monitor rate limits and quotas

---

## Best Practices

### Code Organization
- Keep components focused and single-purpose
- Use custom hooks for reusable logic
- Maintain consistent naming conventions
- Document complex functions

### Performance
- Minimize re-renders with React.memo
- Use useCallback for event handlers
- Implement proper key props for lists
- Lazy load heavy components

### Accessibility
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

### Security
- Sanitize user input
- Validate data before processing
- Store API keys securely
- Implement proper error boundaries

---

## Future Enhancement Ideas

### Potential Features
1. **Spaced Repetition Algorithm**: Implement SRS for optimal review timing
2. **Collaborative Study**: Share decks with other users
3. **Advanced Statistics**: Learning curves, retention rates
4. **Offline Support**: Service worker for offline functionality
5. **Mobile App**: React Native version
6. **Deck Templates**: Pre-made card templates for common subjects
7. **Audio Support**: Text-to-speech and audio recordings
8. **Image Support**: Add images to flashcards
9. **Gamification**: Points, streaks, achievements
10. **Advanced Search**: Full-text search with filters

### Technical Improvements
1. **Database Integration**: Move from localStorage to proper database
2. **User Authentication**: Multi-user support
3. **Real-time Sync**: Cloud synchronization
4. **Performance Optimization**: Virtual scrolling, code splitting
5. **Testing**: Unit tests, integration tests, E2E tests
6. **CI/CD Pipeline**: Automated testing and deployment
7. **Monitoring**: Error tracking, analytics
8. **Internationalization**: Multi-language support

---

This documentation should serve as your complete reference for understanding and extending the Study Flashcards application. Keep it updated as you add new features and make changes to the system.
