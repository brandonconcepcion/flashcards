# Google Docs Export Setup

The flashcards app now includes a Google Docs export feature that allows you to export your flashcards to a formatted Google Document and save it to Google Drive.

## Features

- **Export to Google Docs**: Create formatted documents with your flashcards
- **Google Drive Integration**: Save documents directly to specific Google Drive folders
- **Card Selection**: Choose which cards to export (all cards or selected ones)
- **Custom Formatting**: Include categories, folders, and statistics in your export
- **Professional Layout**: Questions and answers are properly formatted with colors and styling

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Google Docs API**
   - **Google Drive API**

### 2. Create Credentials

#### API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key for later use

#### OAuth 2.0 Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add your domain to **Authorized JavaScript origins**:
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`
5. Copy the Client ID for later use

### 3. Environment Variables

Create a `.env` file in your project root with:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

Replace the values with your actual credentials from step 2.

### 4. OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in the required fields:
   - App name: "Flashcards App"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/documents`
   - `https://www.googleapis.com/auth/drive.file`
5. Add test users (if in testing mode)

## How to Use

1. **Open the Manage Cards tab**
2. **Click the "Google Docs" button** in the header
3. **Sign in with Google** when prompted
4. **Configure your export**:
   - Set document title
   - Choose Google Drive folder (optional)
   - Select what information to include
   - Choose which cards to export
5. **Click "Export"** and wait for completion
6. **Open your document** in Google Docs

## Export Options

- **Document Title**: Custom name for your Google Doc
- **Google Drive Folder**: Save to a specific folder (or My Drive)
- **Include Category**: Show card categories in the export
- **Include Folder**: Show which folder each card belongs to
- **Include Stats**: Add summary statistics at the top
- **Card Selection**: Export all cards or only selected ones

## Document Format

The exported document includes:

```
Flashcards Export - [Date]

Total Cards: X
Folders: Folder1, Folder2
Categories: Category1, Category2

1. [Folder] Category
Q: Question text here?
A: Answer text here with formatting support.

2. [Folder] Category
Q: Another question?
A: Another answer with **bold** and *italic* text.
```

## Troubleshooting

### "Sign in failed" Error

- Check that your Client ID is correct
- Verify your domain is added to authorized origins
- Make sure OAuth consent screen is properly configured

### "Export failed" Error

- Check that both APIs (Docs & Drive) are enabled
- Verify your API key is correct
- Ensure you have the necessary scopes in OAuth consent screen

### "Not authenticated" Error

- Click "Sign in with Google" first
- Make sure you granted all requested permissions

## Security Notes

- API keys and client IDs are safe to expose in frontend applications
- The OAuth flow ensures secure authentication
- Only the minimum required scopes are requested
- Documents are created with your Google account permissions

## Development vs Production

### Development

- Use `http://localhost:5173` in authorized origins
- Test with a small number of flashcards first

### Production

- Update authorized origins to your actual domain
- Consider adding your production domain to OAuth consent screen
- Test the full flow before deploying

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all setup steps were completed
3. Test with a simple export first
4. Make sure your Google account has necessary permissions

The Google Docs export feature provides a professional way to share and backup your flashcards outside the app!
