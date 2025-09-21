# Study Flashcards - Modern Learning Tool

A modern, TypeScript-based flashcard application built with React and Vite, featuring LaTeX math support and organized study management.

## Features

### Core Functionality

- **Create Flashcards**: Add questions and answers with optional categories
- **Study Mode**: Interactive flashcard studying with flip animations
- **Manage Cards**: Search, edit, and delete existing flashcards
- **Local Storage**: All data is stored locally in your browser
- **Responsive Design**: Works on desktop and mobile devices

### Enhanced Features ✨

- **Folder Organization**: Organize your flashcards into custom study folders
- **Category System**: Tag flashcards with categories for better organization
- **Study Progress Tracking**: Track your learning progress and difficulty ratings
- **Import/Export**: Backup and share your flashcard collections

### LaTeX Math Support 📐

- **Mathematical Formulas**: Write complex equations using LaTeX notation
- **Inline Math**: Use `$...$` for inline formulas like $E = mc^2$
- **Block Math**: Use `$$...$$` for centered equations like $$\int_0^1 x^2 dx$$
- **Live Preview**: See your LaTeX rendered in real-time while typing
- **Full KaTeX Support**: Supports fractions, roots, Greek letters, summations, and more

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:

   ```bash
   cd study-flashcards
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and go to `http://localhost:5173`

## Using LaTeX Math

### Writing Mathematical Formulas

1. Use `$...$` for inline math: `$E = mc^2$`
2. Use `$$...$$` for block equations: `$$\int_0^1 x^2 dx$$`
3. Preview your formulas in real-time while creating flashcards

- The app includes intelligent mock AI that can:
  - Extract technical terms from your text
  - Generate basic summaries
  - Suggest flashcards based on identified concepts

## How to Use

### Adding Flashcards

1. Go to the "Add Cards" tab
2. Enter your question and answer (with LaTeX math support!)
3. Use "LaTeX Help" button to see syntax examples
4. Click "Preview LaTeX" to see your math rendered
5. Optionally add a category
6. Click "AI Analyze" to get:
   - A summary of your answer
   - Extracted key concepts
   - Suggested additional flashcards
7. Click "Add Flashcard" to save

### Using LaTeX Math

- **Inline formulas**: Wrap in single dollar signs: `$E = mc^2$`
- **Block formulas**: Wrap in double dollar signs: `$$\int_0^1 x^2 dx$$`
- **Common examples**:
  - Fractions: `$\frac{a}{b}$`
  - Square roots: `$\sqrt{x}$`
  - Subscripts: `$x_1$`
  - Superscripts: `$x^2$`
  - Greek letters: `$\alpha, \beta, \gamma$`
  - Summations: `$\sum_{i=1}^n x_i$`

### Studying

1. Go to "Study Mode"
2. Filter by category if desired
3. Click cards to flip between question and answer
4. Rate your knowledge (Easy/Medium/Hard) to track progress
5. Use navigation buttons to move between cards

### Managing Cards

1. Go to "Manage Cards" to see all your flashcards
2. View statistics about your study progress
3. Search through your cards
4. Edit or delete cards as needed

## Technical Features

- **TypeScript**: Full type safety and better development experience
- **React Hooks**: Modern React patterns with custom hooks
- **Local Storage**: Persistent data storage without external dependencies
- **Responsive CSS**: Mobile-first design with CSS Grid and Flexbox
- **AI Integration**: OpenAI API integration with fallback mock services
- **LaTeX Rendering**: KaTeX integration for mathematical formulas
- **Real-time Preview**: Live LaTeX rendering as you type

## Example Use Cases

### Interview Preparation

- Add complex technical questions and detailed answers
- Use AI to extract key concepts like "regularization", "overfitting", etc.
- Generate focused flashcards for each concept
- Study with spaced repetition

### Learning New Technologies

- Paste documentation or tutorial content
- Get AI-generated summaries
- Create flashcards for important terms and concepts
- Track your learning progress

### Academic Study

- Convert lecture notes into flashcards with mathematical formulas
- Extract key terms and definitions
- Generate review questions automatically
- Organize by subject categories
- Perfect for STEM subjects with complex equations

### Mathematics & Science

- Create flashcards with complex mathematical formulas
- Study physics equations, chemistry formulas, statistics
- LaTeX support for professional mathematical notation
- Preview formulas before saving

## Data Privacy

- All flashcards are stored locally in your browser
- OpenAI API key (if provided) is stored locally
- No data is sent to external servers except OpenAI (when using AI features)
- You can export/backup your data through browser developer tools

## Development

### Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # AI service and utilities
├── types/              # TypeScript type definitions
└── App.css            # Styles
```

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment & Sharing 🚀

This app is designed to be easily shared with others! Each user's data is stored locally on their device, so you don't need to worry about storage costs or managing user data.

### Quick Deployment

1. **Build the app**: `npm run build`
2. **Deploy the `dist` folder** to any static hosting service:
   - **Netlify**: Drag and drop the `dist` folder
   - **Vercel**: Upload the `dist` folder
   - **GitHub Pages**: Enable Pages in your repo settings

### CI/CD Deployment

Set up automatic deployment with the included GitHub Actions workflows:
- **Netlify**: `.github/workflows/deploy.yml`
- **Vercel**: `.github/workflows/deploy-vercel.yml`
- **GitHub Pages**: `.github/workflows/deploy-github-pages.yml`

See `CI-CD-SETUP.md` for detailed instructions.

### Sharing with Others

- **Public Website**: Deploy to a public URL anyone can access
- **GitHub Repository**: Share the source code for others to run locally
- **Downloadable Package**: Share a zip of the built app

Each user gets their own private flashcard collection stored locally on their device. No backend, no user accounts, no storage costs for you!

See `SHARING-GUIDE.md` for complete sharing strategies.

## Documentation

- **`DEPLOYMENT.md`**: Manual deployment options and hosting guide
- **`CI-CD-SETUP.md`**: Automatic deployment setup with GitHub Actions
- **`SHARING-GUIDE.md`**: How to share your app with others
- **`deploy.sh`**: Quick build script for local testing

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.
