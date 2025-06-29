# Email Intelligence Chrome Extension

This Chrome extension allows you to extract organization information directly from Gmail emails and save it to your Email Intelligence database.

## Installation Instructions

### 1. Load Extension in Chrome

1. Open Google Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Select the `chrome-extension` folder from this project
6. The extension should now appear in your extensions list

### 2. Pin the Extension

1. Click the puzzle piece icon in Chrome's toolbar
2. Find "Email Intelligence Extractor" and click the pin icon
3. The extension icon will now appear in your toolbar

### 3. Set Up Backend Connection

Ensure your Email Intelligence application is running:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## How to Use

### Method 1: Using the Extension Popup

1. Open Gmail in Chrome
2. Open any email
3. Click the Email Intelligence extension icon in your toolbar
4. Click "Extract from Current Email"
5. The extension will process the email and redirect you to the dashboard

### Method 2: Using the In-Gmail Button

1. Open Gmail in Chrome
2. Open any email
3. Look for the "Extract Organization Info" button in the email interface
4. Click the button to extract information
5. The dashboard will open with the extracted data

## Features

- **AI-Powered Extraction**: Uses OpenAI GPT-4 to intelligently extract organization information
- **Seamless Integration**: Works directly within Gmail interface
- **Automatic Data Transfer**: Extracted data appears immediately in your dashboard
- **Error Handling**: Clear feedback for any issues during extraction

## Extracted Information

The extension extracts the following organization details:
- Company name
- Location
- Owners/Key personnel
- Business activities
- Company age
- Website
- Industry category
- Original email content

## Troubleshooting

### Extension Not Working
- Ensure Gmail is loaded completely before using
- Check that the backend server is running on port 5000
- Verify the extension has permissions for Gmail

### No Extract Button Visible
- Refresh the Gmail page
- Try opening a different email
- Check if the extension is enabled in `chrome://extensions/`

### Extraction Fails
- Verify your OpenAI API key is configured in the backend
- Check that the backend server is accessible
- Ensure the email contains readable organization information

## Development

To modify the extension:

1. Make changes to the files in `chrome-extension/`
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Email Intelligence extension
4. Test your changes in Gmail

## Security

- The extension only accesses Gmail email content when you explicitly click extract
- All data is sent to your local backend server
- No data is stored by the extension itself
- Email content is processed securely using OpenAI's API

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all prerequisites are met
3. Ensure your local servers are running
4. Try refreshing Gmail and reloading the extension