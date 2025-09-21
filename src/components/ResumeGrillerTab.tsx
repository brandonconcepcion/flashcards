import React, { useState, useRef } from 'react';
import { Upload, FileText, Brain, Plus, Trash2, Download, Eye, X, CheckCircle, AlertCircle } from 'lucide-react';
// AI service removed
import MarkdownText from './MarkdownText';

interface ResumeGrillerTabProps {
  addFlashcard: (question: string, answer: string, category: string, folder?: string) => void;
  folders: any[];
  currentFolder: string;
}

interface ResumeQuestion {
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'behavioral' | 'technical' | 'situational' | 'company-specific';
  resumeSection: string;
}

const ResumeGrillerTab: React.FC<ResumeGrillerTabProps> = ({
  addFlashcard,
  folders,
  currentFolder
}) => {
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [questionType, setQuestionType] = useState<'mixed' | 'technical' | 'behavioral'>('mixed');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [questions, setQuestions] = useState<ResumeQuestion[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [parsedText, setParsedText] = useState('');
  const [fileUploadStatus, setFileUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasApiKey = false; // AI service removed

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileUploadStatus('uploading');
    setResumeFileName(file.name);

    try {
      let content = '';

      if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        // For text files - this should work reliably
        content = await file.text();
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // Enhanced PDF parsing using ATS-style extraction
        content = await parseResumeWithATS(file, 'pdf');
      } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        // Enhanced Word document parsing using ATS-style extraction
        content = await parseResumeWithATS(file, 'word');
      } else {
        // Try to read as text for other file types
        try {
          content = await file.text();
        } catch (error) {
          setFileUploadStatus('error');
          alert('Unsupported file type. Please use .txt, .pdf, .doc, or .docx files, or copy and paste your resume text directly.');
          setResumeFileName('');
          return;
        }
      }

      if (content.trim()) {
        // Clean and format the extracted text using ATS-style processing
        const cleanedContent = cleanResumeText(content);
        setParsedText(cleanedContent);
        setResumeText(cleanedContent);
        setFileUploadStatus('success');
      } else {
        setFileUploadStatus('error');
        alert('No text content found in the file. Please try copying and pasting your resume text.');
        setResumeFileName('');
      }
    } catch (error) {
      console.error('Error reading file:', error);
      setFileUploadStatus('error');
      alert('Error parsing file. Please try copying and pasting your resume text instead.');
      setResumeFileName('');
    }
  };

  // ATS-style resume parsing function
  const parseResumeWithATS = async (file: File, fileType: 'pdf' | 'word'): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    
    if (fileType === 'pdf') {
      return await extractTextFromPDFATS(arrayBuffer);
    } else {
      return await extractTextFromWordATS(arrayBuffer);
    }
  };

  // Enhanced PDF text extraction using ATS techniques
  const extractTextFromPDFATS = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const uint8Array = new Uint8Array(arrayBuffer);
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    
    // Look for text objects in PDF structure
    const textPatterns = [
      /BT\s*(.*?)\s*ET/gs,  // Text objects
      /Tj\s*\[(.*?)\]/gs,   // Text arrays
      /\((.*?)\)\s*Tj/gs,   // Simple text
      /\[(.*?)\]\s*TJ/gs,   // Text with positioning
    ];
    
    let extractedText = '';
    
    // Try multiple extraction methods
    for (const pattern of textPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const cleaned = match
            .replace(/BT\s*|\s*ET/g, '')
            .replace(/Tj\s*|\s*TJ/g, ' ')
            .replace(/[\(\)\[\]]/g, '')
            .replace(/\\[rn]/g, '\n')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (cleaned.length > 3) {
            extractedText += cleaned + ' ';
          }
        }
      }
    }
    
    // If no structured text found, try to extract readable characters
    if (extractedText.length < 50) {
      const readableChars = text
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Look for common resume sections to validate extraction
      const resumeSections = ['experience', 'education', 'skills', 'summary', 'objective', 'work', 'employment'];
      const hasResumeContent = resumeSections.some(section => 
        readableChars.toLowerCase().includes(section)
      );
      
      if (hasResumeContent && readableChars.length > 100) {
        extractedText = readableChars;
      }
    }
    
    if (extractedText.length < 50) {
      throw new Error('Could not extract readable text from PDF. Please copy and paste your resume text manually.');
    }
    
    return extractedText;
  };

  // Enhanced Word document text extraction using ATS techniques
  const extractTextFromWordATS = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Try different encodings
    const encodings = ['utf-8', 'utf-16le', 'windows-1252'];
    let bestText = '';
    let bestScore = 0;
    
    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding, { fatal: false });
        const text = decoder.decode(uint8Array);
        
        // Extract readable text and score it
        const readableText = text
          .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Score based on resume-like content
        const resumeKeywords = [
          'experience', 'education', 'skills', 'summary', 'objective', 
          'work', 'employment', 'university', 'college', 'company',
          'project', 'achievement', 'responsibility', 'manager', 'developer'
        ];
        
        const score = resumeKeywords.reduce((acc, keyword) => {
          return acc + (readableText.toLowerCase().split(keyword).length - 1);
        }, 0);
        
        if (score > bestScore && readableText.length > 100) {
          bestScore = score;
          bestText = readableText;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (bestText.length < 50) {
      throw new Error('Could not extract readable text from Word document. Please copy and paste your resume text manually.');
    }
    
    return bestText;
  };

  // Clean and format extracted resume text using ATS principles
  const cleanResumeText = (rawText: string): string => {
    return rawText
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove excessive punctuation
      .replace(/[^\w\s\.\,\;\:\!\?\-\(\)\[\]\/\@\#\$\%\&\*\+\=]/g, ' ')
      // Fix common OCR/parsing errors
      .replace(/\b([A-Z])\s+([A-Z])\s+([A-Z])\b/g, '$1$2$3') // Fix spaced acronyms
      .replace(/(\d)\s+(\d)/g, '$1$2') // Fix spaced numbers
      // Normalize line breaks
      .replace(/\n\s*\n/g, '\n\n')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleShowPreview = () => {
    if (resumeText.trim()) {
      setParsedText(resumeText);
      setShowPreviewModal(true);
    }
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) {
      alert('Please upload a resume file or paste your resume text.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // AI service removed - using mock data
      const result = [];
      setQuestions(result);
      setSelectedQuestions(new Set()); // Clear previous selections
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Error analyzing resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddQuestion = (question: ResumeQuestion, index: number) => {
    // Determine the correct folder based on question type
    let targetFolder = currentFolder;
    const behavioralFolder = folders.find(f => f.name.toLowerCase().includes('behavioral'));
    const technicalFolder = folders.find(f => f.name.toLowerCase().includes('technical'));
    
    if (question.type === 'behavioral' && behavioralFolder) {
      targetFolder = behavioralFolder.id;
    } else if (question.type === 'technical' && technicalFolder) {
      targetFolder = technicalFolder.id;
    }
    
    addFlashcard(question.question, question.answer, question.category, targetFolder);
    
    // Remove from selected questions
    const newSelected = new Set(selectedQuestions);
    newSelected.delete(index);
    setSelectedQuestions(newSelected);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleAddSelectedQuestions = () => {
    selectedQuestions.forEach(index => {
      const question = questions[index];
      handleAddQuestion(question, index);
    });
    setSelectedQuestions(new Set());
  };

  const handleSelectQuestion = (index: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions.map((_, index) => index)));
    }
  };

  const handleClearResume = () => {
    setResumeText('');
    setResumeFileName('');
    setQuestions([]);
    setSelectedQuestions(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportQuestions = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-questions-${difficulty}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getDifficultyDescription = (level: string) => {
    switch (level) {
      case 'easy':
        return 'Straightforward questions about your experience and background';
      case 'medium':
        return 'Problem-solving questions that require analytical thinking';
      case 'hard':
        return 'Deep technical questions and complex scenario-based challenges';
      default:
        return '';
    }
  };

  if (!hasApiKey) {
    return (
      <div className="resume-griller-tab">
        <div className="no-api-key">
          <Brain size={48} />
          <h2>AI Resume Griller</h2>
          <p>This feature requires an OpenAI API key to analyze your resume and generate personalized interview questions.</p>
          <p>Please go to the "Add Cards" tab and click "Enable AI Features" to set up your API key.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resume-griller-tab">
      <div className="griller-header">
        <div className="header-content">
          <div className="header-title">
            <Brain size={32} />
            <div>
              <h1>AI Resume Griller</h1>
              <p>Upload your resume and get grilled with personalized interview questions</p>
            </div>
          </div>
          {questions.length > 0 && (
            <div className="header-actions">
              <button
                onClick={handleExportQuestions}
                className="btn btn-secondary btn-sm"
              >
                <Download size={16} />
                Export Questions
              </button>
              <button
                onClick={handleClearResume}
                className="btn btn-secondary btn-sm"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="success-message">
          <Plus size={20} />
          Flashcard(s) added successfully!
        </div>
      )}

      <div className="upload-section">
        <div className="upload-area">
          <div className="upload-content">
            {fileUploadStatus === 'success' ? (
              <CheckCircle size={48} color="#22c55e" />
            ) : fileUploadStatus === 'error' ? (
              <AlertCircle size={48} color="#ef4444" />
            ) : (
              <FileText size={48} />
            )}
            
            <h3>
              {fileUploadStatus === 'success' ? 'Resume Uploaded Successfully!' : 
               fileUploadStatus === 'error' ? 'Upload Failed' : 
               'Upload Your Resume'}
            </h3>
            
            <p>
              {fileUploadStatus === 'success' ? 'Your resume has been parsed and is ready for analysis' :
               fileUploadStatus === 'error' ? 'Please try again or paste your resume text below' :
               'Upload a text file or paste your resume content below'}
            </p>
            
            <div className="upload-actions">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary"
                disabled={fileUploadStatus === 'uploading'}
              >
                <Upload size={20} />
                {fileUploadStatus === 'uploading' ? 'Uploading...' : 'Choose File'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
            
            {resumeFileName && fileUploadStatus === 'success' && (
              <div className="file-info">
                <FileText size={16} />
                <span>{resumeFileName}</span>
                <button
                  onClick={handleShowPreview}
                  className="btn btn-secondary btn-sm"
                  style={{ marginLeft: '8px' }}
                >
                  <Eye size={14} />
                  Preview
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="manual-input">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4>Or paste your resume text:</h4>
            {resumeText.trim() && (
              <button
                onClick={handleShowPreview}
                className="btn btn-secondary btn-sm"
              >
                <Eye size={14} />
                Preview Text
              </button>
            )}
          </div>
          <textarea
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              setFileUploadStatus('idle');
              setResumeFileName('');
            }}
            placeholder="Paste your complete resume here... Include work experience, skills, projects, education, etc."
            rows={8}
            className="resume-textarea"
          />
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="modal-overlay" onClick={handleClosePreview}>
          <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Resume Preview</h3>
              <button
                onClick={handleClosePreview}
                className="btn btn-secondary btn-sm"
              >
                <X size={16} />
                Close
              </button>
            </div>
            <div className="modal-body">
              <div className="preview-content">
                <div className="preview-stats">
                  <span>Characters: {parsedText.length}</span>
                  <span>Words: {parsedText.split(/\s+/).filter(word => word.length > 0).length}</span>
                  <span>Lines: {parsedText.split('\n').length}</span>
                </div>
                <div className="preview-text">
                  {parsedText}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="analysis-controls">
        <div className="controls-grid">
          <div className="difficulty-selection">
            <h4>Interview Difficulty Level</h4>
            <div className="difficulty-options">
              {(['easy', 'medium', 'hard'] as const).map(level => (
                <label key={level} className={`difficulty-option ${difficulty === level ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={difficulty === level}
                    onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  />
                  <div className="option-content">
                    <div className="option-title">{level.charAt(0).toUpperCase() + level.slice(1)}</div>
                    <div className="option-description">{getDifficultyDescription(level)}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="question-type-selection">
            <h4>Question Focus</h4>
            <div className="type-options">
              <label className={`type-option ${questionType === 'mixed' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="questionType"
                  value="mixed"
                  checked={questionType === 'mixed'}
                  onChange={(e) => setQuestionType(e.target.value as 'mixed' | 'technical' | 'behavioral')}
                />
                <div className="option-content">
                  <div className="option-title">Mixed</div>
                  <div className="option-description">Balanced mix of technical and behavioral questions</div>
                </div>
              </label>
              <label className={`type-option ${questionType === 'technical' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="questionType"
                  value="technical"
                  checked={questionType === 'technical'}
                  onChange={(e) => setQuestionType(e.target.value as 'mixed' | 'technical' | 'behavioral')}
                />
                <div className="option-content">
                  <div className="option-title">Technical</div>
                  <div className="option-description">Focus on technical skills, architecture, and problem-solving</div>
                </div>
              </label>
              <label className={`type-option ${questionType === 'behavioral' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="questionType"
                  value="behavioral"
                  checked={questionType === 'behavioral'}
                  onChange={(e) => setQuestionType(e.target.value as 'mixed' | 'technical' | 'behavioral')}
                />
                <div className="option-content">
                  <div className="option-title">Behavioral</div>
                  <div className="option-description">Focus on past experiences, leadership, and soft skills</div>
                </div>
              </label>
            </div>
          </div>

          <div className="question-count-selection">
            <h4>Number of Questions</h4>
            <div className="count-selector">
              <label htmlFor="questionCount">Generate:</label>
              <select
                id="questionCount"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="count-select"
              >
                <option value={1}>1 question</option>
                <option value={2}>2 questions</option>
                <option value={3}>3 questions</option>
                <option value={4}>4 questions</option>
                <option value={5}>5 questions</option>
              </select>
              <div className="count-description">
                Choose how many questions to generate in one session
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleAnalyzeResume}
          disabled={isAnalyzing || !resumeText.trim()}
          className="btn btn-primary btn-large"
        >
          <Brain size={20} />
          {isAnalyzing ? 'Analyzing Resume...' : `Generate ${questionCount} ${questionType === 'mixed' ? 'Mixed' : questionType.charAt(0).toUpperCase() + questionType.slice(1)} Question${questionCount > 1 ? 's' : ''}`}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="questions-section">
          <div className="questions-header">
            <h3>Generated Questions ({questions.length})</h3>
            <div className="bulk-actions">
              <button
                onClick={handleSelectAll}
                className="btn btn-secondary btn-sm"
              >
                {selectedQuestions.size === questions.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedQuestions.size > 0 && (
                <button
                  onClick={handleAddSelectedQuestions}
                  className="btn btn-success btn-sm"
                >
                  <Plus size={16} />
                  Add Selected ({selectedQuestions.size})
                </button>
              )}
            </div>
          </div>

          <div className="questions-grid">
            {questions.map((question, index) => (
              <div key={index} className={`question-card ${selectedQuestions.has(index) ? 'selected' : ''}`}>
                <div className="question-header">
                  <div className="question-select">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.has(index)}
                      onChange={() => handleSelectQuestion(index)}
                    />
                  </div>
                  <div className="question-meta">
                    <span className={`difficulty-badge ${question.difficulty}`}>
                      {question.difficulty}
                    </span>
                    <span className={`type-badge ${question.type}`}>
                      {question.type}
                    </span>
                    <span className="category-badge">
                      {question.category}
                    </span>
                    <span className="resume-section-badge">
                      {question.resumeSection}
                    </span>
                  </div>
                </div>
                
                <div className="question-content">
                  <div className="question-text">
                    <strong>Q:</strong> {question.question}
                  </div>
                  <div className="answer-text">
                    <strong>A:</strong> 
                    <MarkdownText>{question.answer}</MarkdownText>
                  </div>
                </div>
                
                <div className="question-actions">
                  <button
                    onClick={() => handleAddQuestion(question, index)}
                    className="btn btn-success btn-sm"
                  >
                    <Plus size={16} />
                    Add as Flashcard
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeGrillerTab;
