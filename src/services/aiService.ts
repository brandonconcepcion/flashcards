import OpenAI from 'openai';

// Note: In a production app, you'd want to handle API keys more securely
// For now, we'll create a mock service that simulates AI responses
// Users can replace this with actual OpenAI integration

interface ConceptSuggestion {
  concept: string;
  definition: string;
  confidence: number;
}

interface AISuggestions {
  summary: string;
  concepts: ConceptSuggestion[];
  suggestedFlashcards: Array<{
    question: string;
    answer: string;
    category: string;
  }>;
}

class AIService {
  private openai: OpenAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    // Check if API key is available in environment or localStorage
    this.apiKey = localStorage.getItem('openai-api-key') || null;
    if (this.apiKey) {
      this.openai = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
      });
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('openai-api-key', apiKey);
    this.openai = new OpenAI({
      apiKey: this.apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async generateSummary(text: string): Promise<string> {
    if (!this.openai) {
      return this.mockGenerateSummary(text);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates concise, clear summaries of educational content. Focus on the key points and main concepts."
          },
          {
            role: "user",
            content: `Please provide a concise summary of the following text:\n\n${text}`
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      });

      return response.choices[0]?.message?.content || "Unable to generate summary.";
    } catch (error) {
      console.error('Error generating summary:', error);
      return this.mockGenerateSummary(text);
    }
  }

  async extractConcepts(text: string): Promise<ConceptSuggestion[]> {
    if (!this.openai) {
      return this.mockExtractConcepts(text);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert at identifying key concepts, terms, and topics from educational text. Extract important concepts that would be good for flashcard creation. Return a JSON array of objects with 'concept', 'definition', and 'confidence' (0-1) fields."
          },
          {
            role: "user",
            content: `Extract key concepts from this text that would be suitable for flashcards:\n\n${text}`
          }
        ],
        max_tokens: 500,
        temperature: 0.2
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          return JSON.parse(content);
        } catch {
          // If JSON parsing fails, fall back to mock
          return this.mockExtractConcepts(text);
        }
      }
      return this.mockExtractConcepts(text);
    } catch (error) {
      console.error('Error extracting concepts:', error);
      return this.mockExtractConcepts(text);
    }
  }

  async generateFlashcards(concepts: ConceptSuggestion[], category: string = ''): Promise<Array<{question: string, answer: string, category: string}>> {
    if (!this.openai) {
      return this.mockGenerateFlashcards(concepts, category);
    }

    try {
      const conceptsText = concepts.map(c => `${c.concept}: ${c.definition}`).join('\n');
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating educational flashcards. Create clear, concise questions and answers that test understanding of concepts. Return a JSON array of objects with 'question', 'answer', and 'category' fields."
          },
          {
            role: "user",
            content: `Create flashcards for these concepts:\n\n${conceptsText}\n\nCategory: ${category || 'General'}`
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          return JSON.parse(content);
        } catch {
          return this.mockGenerateFlashcards(concepts, category);
        }
      }
      return this.mockGenerateFlashcards(concepts, category);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return this.mockGenerateFlashcards(concepts, category);
    }
  }

  async analyzeText(text: string, category: string = ''): Promise<AISuggestions> {
    const [summary, concepts] = await Promise.all([
      this.generateSummary(text),
      this.extractConcepts(text)
    ]);

    const suggestedFlashcards = await this.generateFlashcards(concepts, category);

    return {
      summary,
      concepts,
      suggestedFlashcards
    };
  }

  // Mock implementations for when no API key is available
  private mockGenerateSummary(text: string): string {
    const words = text.split(' ');
    if (words.length <= 50) return text;
    
    // Simple extractive summary - take first and last sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 2) return text;
    
    return `${sentences[0].trim()}. ${sentences[sentences.length - 1].trim()}.`;
  }

  private mockExtractConcepts(text: string): ConceptSuggestion[] {
    const concepts: ConceptSuggestion[] = [];
    const lowerText = text.toLowerCase();
    
    // Common technical terms to look for
    const technicalTerms = [
      'machine learning', 'deep learning', 'neural network', 'algorithm',
      'regression', 'classification', 'clustering', 'supervised learning',
      'unsupervised learning', 'reinforcement learning', 'overfitting',
      'underfitting', 'cross-validation', 'regularization', 'l1', 'l2',
      'gradient descent', 'backpropagation', 'feature engineering',
      'dimensionality reduction', 'pca', 'svm', 'random forest',
      'decision tree', 'naive bayes', 'k-means', 'lstm', 'cnn', 'rnn',
      'transformer', 'attention', 'winsorization', 'normalization',
      'standardization', 'bias', 'variance', 'precision', 'recall',
      'f1 score', 'accuracy', 'auc', 'roc curve'
    ];

    technicalTerms.forEach(term => {
      if (lowerText.includes(term)) {
        concepts.push({
          concept: term.charAt(0).toUpperCase() + term.slice(1),
          definition: `A concept related to ${term} mentioned in the text.`,
          confidence: 0.7 + Math.random() * 0.3
        });
      }
    });

    // Look for capitalized terms (potential proper nouns/concepts)
    const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    capitalizedWords.forEach(word => {
      if (word.length > 3 && !concepts.some(c => c.concept.toLowerCase() === word.toLowerCase())) {
        concepts.push({
          concept: word,
          definition: `A concept or term: ${word}`,
          confidence: 0.5 + Math.random() * 0.3
        });
      }
    });

    return concepts.slice(0, 8); // Limit to top 8 concepts
  }

  private mockGenerateFlashcards(concepts: ConceptSuggestion[], category: string): Array<{question: string, answer: string, category: string}> {
    return concepts.slice(0, 5).map(concept => ({
      question: `What is ${concept.concept}?`,
      answer: concept.definition,
      category: category || 'AI Generated'
    }));
  }
}

export const aiService = new AIService();
export type { ConceptSuggestion, AISuggestions };
