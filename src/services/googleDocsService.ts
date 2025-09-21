import type { Flashcard } from '../types/flashcard';

// Google APIs configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const DISCOVERY_DOCS = [
  'https://docs.googleapis.com/$discovery/rest?version=v1',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file';

interface GoogleDocsExportOptions {
  title: string;
  flashcards: Flashcard[];
  driveFolder?: string;
  includeCategory?: boolean;
  includeFolder?: boolean;
  includeStats?: boolean;
  appendToExisting?: boolean;
  existingDocumentId?: string;
  sortBy?: 'recent' | 'alphabetical' | 'category' | 'none';
}

interface GoogleDriveFolder {
  id: string;
  name: string;
}

class GoogleDocsService {
  private isInitialized = false;
  private isSignedIn = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('Google Docs Service: Initializing...');
      console.log('Client ID:', GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
      console.log('API Key:', GOOGLE_API_KEY ? 'Present' : 'Missing');
      
      // Load Google APIs
      await this.loadGoogleAPIs();
      
      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          console.log('Google Identity Services: Token received');
          this.isSignedIn = true;
        }
      });

      // Initialize Google APIs client
      await window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: DISCOVERY_DOCS
        });
        console.log('Google API client initialized');
        this.isInitialized = true;
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize Google APIs:', error);
      return false;
    }
  }

  private loadGoogleAPIs(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Load both Google Identity Services and Google API client
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolveScript, rejectScript) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => resolveScript();
          script.onerror = () => rejectScript(new Error(`Failed to load ${src}`));
          document.head.appendChild(script);
        });
      };

      // Load Google Identity Services
      loadScript('https://accounts.google.com/gsi/client')
        .then(() => {
          // Load Google API client
          return loadScript('https://apis.google.com/js/api.js');
        })
        .then(() => resolve())
        .catch(reject);
    });
  }

  async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('Google Docs Service: Attempting sign-in...');
      
      // Use Google Identity Services for sign-in
      return new Promise((resolve) => {
        window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            console.log('Google Docs Service: Sign-in successful');
            this.isSignedIn = true;
            resolve(true);
          },
          error_callback: (error: any) => {
            console.error('Google sign-in failed:', error);
            resolve(false);
          }
        }).requestAccessToken();
      });
    } catch (error) {
      console.error('Google sign-in failed:', error);
      console.error('Error details:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    if (this.isInitialized && window.google) {
      window.google.accounts.oauth2.revoke();
      this.isSignedIn = false;
    }
  }

  isAuthenticated(): boolean {
    // Check both our internal state and Google's authentication
    if (!this.isSignedIn) return false;
    
    // Also check if Google's token is still valid
    try {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        const tokenClient = window.google.accounts.oauth2.getTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: SCOPES.join(' '),
        });
        return true; // If we can get the token client, we're likely authenticated
      }
    } catch (error) {
      console.log('Token validation failed:', error);
    }
    
    return this.isSignedIn;
  }

  async getDriveFolders(): Promise<GoogleDriveFolder[]> {
    if (!this.isSignedIn) throw new Error('Not authenticated');

    try {
      const response = await window.gapi.client.drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder'",
        fields: 'files(id,name)',
        orderBy: 'name'
      });

      return response.result.files?.map((folder: any) => ({
        id: folder.id,
        name: folder.name
      })) || [];
    } catch (error) {
      console.error('Failed to fetch Drive folders:', error);
      return [];
    }
  }

  async exportToGoogleDocs(options: GoogleDocsExportOptions): Promise<string> {
    try {
      // Check authentication and re-authenticate if needed
      if (!this.isSignedIn) {
        console.log('Not authenticated, attempting to re-authenticate...');
        await this.signIn();
        
        // Check again after sign in
        if (!this.isSignedIn) {
          throw new Error('Authentication failed. Please try signing in again.');
        }
      }

      // Ensure gapi client is loaded
      if (!window.gapi || !window.gapi.client) {
        await this.initialize();
      }

      let documentId: string;

      if (options.appendToExisting && options.existingDocumentId) {
        // Append to existing document
        documentId = options.existingDocumentId;
      } else {
        // Create a new Google Doc
        console.log('Creating new document with title:', options.title);
        const createResponse = await window.gapi.client.docs.documents.create({
          title: options.title
        });

        documentId = createResponse.result.documentId;
        console.log('Document created with ID:', documentId);
        
        if (!documentId) {
          throw new Error('Failed to create document');
        }

        // Move to specified Drive folder if provided
        if (options.driveFolder) {
          console.log('Moving document to folder:', options.driveFolder);
          await this.moveToFolder(documentId, options.driveFolder);
        }
      }

      // Sort flashcards if requested
      let sortedFlashcards = [...options.flashcards];
      if (options.sortBy && options.sortBy !== 'none') {
        sortedFlashcards = this.sortFlashcards(options.flashcards, options.sortBy);
      }

      // Update options with sorted flashcards
      const sortedOptions = { ...options, flashcards: sortedFlashcards };

      // Build the document content as a single text string
      const content = this.buildDocumentContent(sortedOptions);

      // Update the document with flashcard content using a single insertText request
      console.log('Inserting content into document:', documentId);
      console.log('Content length:', content.length);
      
      const updateResponse = await window.gapi.client.docs.documents.batchUpdate({
        documentId: documentId,
        requests: [{
          insertText: {
            location: { index: 1 },
            text: content
          }
        }]
      });
      
      console.log('Content insertion successful:', updateResponse);

      return documentId;
    } catch (error) {
      console.error('Failed to export to Google Docs:', error);
      throw error;
    }
  }

  private buildDocumentContent(options: GoogleDocsExportOptions): string {
    // Build all content as a single text string
    let content = '';
    
    // Add header
    content += `Flashcards Export - ${new Date().toLocaleDateString()}\n\n`;

    // Add summary if requested
    if (options.includeStats) {
      const folders = [...new Set(options.flashcards.map(card => card.folder))];
      const categories = [...new Set(options.flashcards.map(card => card.category))];
      content += `Summary:\nTotal Cards: ${options.flashcards.length}\n`;
      content += `Folders: ${folders.join(', ')}\n`;
      content += `Categories: ${categories.join(', ')}\n\n`;
    }

    // Add each flashcard
    options.flashcards.forEach((card, cardIndex) => {
      // Card header with metadata
      content += `${cardIndex + 1}. `;
      if (options.includeFolder) {
        content += `[${card.folder}] `;
      }
      if (options.includeCategory) {
        content += `${card.category}\n`;
      } else {
        content += '\n';
      }

      // Question
      content += `${card.question}\n`;
      
      // Answer as bullet point
      content += `• ${card.answer}\n\n`;
    });

    return content;
  }

  private async buildDocumentRequests(options: GoogleDocsExportOptions, documentId: string): Promise<any[]> {
    const requests: any[] = [];
    let index = 1; // Start after the title

    // If appending to existing document, get the current content length
    if (options.appendToExisting && options.existingDocumentId) {
      try {
        const doc = await window.gapi.client.docs.documents.get({
          documentId: documentId
        });
        const content = doc.result.body?.content || [];
        if (content.length > 0) {
          // Find the last text element to get the end index
          const lastElement = content[content.length - 1];
          index = Math.max(lastElement.endIndex || 1, 1);
          
          // Add a separator if the document isn't empty
          const separatorText = `\n\n--- New Export - ${new Date().toLocaleDateString()} ---\n\n`;
          requests.push({
            insertText: {
              location: { index: index - 1 },
              text: separatorText
            }
          });
          index += separatorText.length;
        }
      } catch (error) {
        console.error('Failed to get existing document:', error);
        // Fall back to creating new content
      }
    } else {
      // Add header for new document
      const headerText = `Flashcards Export - ${new Date().toLocaleDateString()}\n\n`;
      requests.push({
        insertText: {
          location: { index },
          text: headerText
        }
      });
      index += headerText.length;
    }

    // Add summary if requested
    if (options.includeStats) {
      const summary = `Total Cards: ${options.flashcards.length}\n`;
      const folders = [...new Set(options.flashcards.map(card => card.folder))];
      const categories = [...new Set(options.flashcards.map(card => card.category))];
      
      requests.push({
        insertText: {
          location: { index },
          text: summary + `Folders: ${folders.join(', ')}\n` + `Categories: ${categories.join(', ')}\n\n`
        }
      });
      index += (summary + `Folders: ${folders.join(', ')}\n` + `Categories: ${categories.join(', ')}\n\n`).length;
    }

    // Add each flashcard with simple formatting
    options.flashcards.forEach((card, cardIndex) => {
      // Card header with metadata
      let cardHeader = `${cardIndex + 1}. `;
      if (options.includeFolder) {
        cardHeader += `[${card.folder}] `;
      }
      if (options.includeCategory) {
        cardHeader += `${card.category}\n`;
      } else {
        cardHeader += '\n';
      }

      requests.push({
        insertText: {
          location: { index },
          text: cardHeader
        }
      });
      index += cardHeader.length;

      // Question (simple text, no styling for now)
      const questionText = `${card.question}\n`;
      requests.push({
        insertText: {
          location: { index },
          text: questionText
        }
      });
      index += questionText.length;

      // Answer as bullet point (simple text, no styling for now)
      const answerText = `• ${card.answer}\n\n`;
      requests.push({
        insertText: {
          location: { index },
          text: answerText
        }
      });
      index += answerText.length;
    });

    return requests;
  }

  private async moveToFolder(documentId: string, folderId: string): Promise<void> {
    try {
      // Get current parents
      const file = await window.gapi.client.drive.files.get({
        fileId: documentId,
        fields: 'parents'
      });

      const previousParents = file.result.parents?.join(',') || '';

      // Move to new folder
      await window.gapi.client.drive.files.update({
        fileId: documentId,
        addParents: folderId,
        removeParents: previousParents
      });
    } catch (error) {
      console.error('Failed to move document to folder:', error);
      // Don't throw - document was created successfully
    }
  }

  getDocumentUrl(documentId: string): string {
    return `https://docs.google.com/document/d/${documentId}/edit`;
  }

  private sortFlashcards(flashcards: Flashcard[], sortBy: string): Flashcard[] {
    switch (sortBy) {
      case 'recent':
        return [...flashcards].sort((a, b) => {
          // Sort by creation date, most recent first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      case 'alphabetical':
        return [...flashcards].sort((a, b) => {
          return a.question.localeCompare(b.question);
        });
      case 'category':
        return [...flashcards].sort((a, b) => {
          // First sort by category, then by question within category
          const categoryCompare = a.category.localeCompare(b.category);
          if (categoryCompare !== 0) return categoryCompare;
          return a.question.localeCompare(b.question);
        });
      default:
        return flashcards;
    }
  }
}

// Global type declarations for Google APIs
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export const googleDocsService = new GoogleDocsService();
export type { GoogleDocsExportOptions, GoogleDriveFolder };
