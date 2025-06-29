# Email Intelligence System - Complete Setup Guide

## Overview

This is a complete email intelligence system that extracts organization information from Gmail emails using AI and stores it in a MongoDB database. The system consists of:

1. **Chrome Extension** - Integrates with Gmail to extract email content
2. **Backend API** - Node.js/Express server with OpenAI integration and MongoDB storage
3. **Frontend Dashboard** - React application for managing extracted organizations

## System Architecture

```
Gmail → Chrome Extension → Backend API (OpenAI + MongoDB) → Frontend Dashboard
```

## Prerequisites

- Node.js 20+ installed
- Chrome browser
- OpenAI API key
- MongoDB database (provided connection string included)

## Quick Start

### 1. Start the Application

```bash
# Install dependencies (already done)
npm install

# Start the development server (Frontend: 3000, Backend: 5000)
npm run dev
```

### 2. Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. Pin the extension to your toolbar

### 3. Configure OpenAI API Key

The system is already configured with your OpenAI API key for AI-powered extraction.

## How to Use

### Method 1: Direct Email Extraction (Web Interface)

1. Open http://localhost:3000
2. Go to "Extract from Email" tab
3. Paste email content into the text area
4. Click "Extract Information"
5. Review and save the extracted organization data

### Method 2: Gmail Chrome Extension

1. Open Gmail in Chrome
2. Open any email containing organization information
3. Click the Email Intelligence extension icon OR click the "Extract Organization Info" button in Gmail
4. The system will automatically extract information and open the dashboard
5. Review and save the data

## Features

### AI-Powered Extraction
- Uses OpenAI GPT-4 for intelligent content analysis
- Extracts: Company name, location, owners, activities, age, website, industry
- Handles various email formats and content types

### Database Management
- MongoDB storage for organization data
- Full CRUD operations (Create, Read, Update, Delete)
- Search and filter capabilities
- Industry categorization

### Chrome Extension Integration
- Seamless Gmail integration
- One-click extraction from emails
- Automatic data transfer to dashboard
- In-page extraction button

### Dashboard Features
- Organization database with search/filter
- Detailed organization forms
- Edit existing records
- Analytics placeholder for future features

## Database Schema

Organizations are stored with the following fields:
- `name` - Organization name
- `location` - Geographic location
- `owners` - Key personnel/ownership
- `activities` - Business activities description
- `age` - Company age in years
- `website` - Company website URL
- `industry` - Industry category
- `attachments` - Email attachments (if any)
- `emailContent` - Original email content
- `createdAt` / `updatedAt` - Timestamps

## API Endpoints

### Extract Organization Information
```
POST /api/extract
Body: { "emailContent": "..." }
Response: { "success": true, "data": {...} }
```

### Organization CRUD
```
GET /api/organizations - List all organizations
POST /api/organizations - Create new organization
GET /api/organizations/:id - Get specific organization
PUT /api/organizations/:id - Update organization
DELETE /api/organizations/:id - Delete organization
```

### Search Organizations
```
GET /api/organizations?search=query&industry=category
```

## Configuration

### Environment Variables
- `OPENAI_API_KEY` - Your OpenAI API key (already configured)
- `DATABASE_URL` - MongoDB connection string (already configured)
- `NODE_ENV` - Environment mode (development/production)

### Port Configuration
- Frontend: http://localhost:3000 (Vite dev server)
- Backend: http://localhost:5000 (Express server)
- MongoDB: Remote connection (Cluster0.6gjts.mongodb.net)

## Extension Development

### Extension Structure
```
chrome-extension/
├── manifest.json - Extension configuration
├── popup.html - Extension popup interface
├── popup.js - Popup functionality
├── content.js - Gmail page integration
├── styles.css - Extension styling
└── icons/ - Extension icons
```

### Extension Permissions
- `activeTab` - Access to current tab
- `storage` - Local storage for data transfer
- Gmail host permissions
- Localhost backend access

## Troubleshooting

### Backend Issues
- Ensure MongoDB connection string is correct
- Verify OpenAI API key is valid and has credits
- Check that port 5000 is available

### Extension Issues
- Refresh the extension in `chrome://extensions/`
- Ensure Gmail is fully loaded before using
- Check browser console for error messages

### Frontend Issues
- Verify backend is running on port 5000
- Check browser network tab for API call failures
- Ensure proper CORS configuration

## Security Considerations

- OpenAI API key is stored securely in environment variables
- MongoDB connection uses authentication
- Chrome extension only accesses data when explicitly triggered
- No sensitive data is stored in browser localStorage

## Future Enhancements

1. **Analytics Dashboard** - Charts and insights from organization data
2. **Bulk Import** - Process multiple emails at once
3. **Export Features** - CSV/Excel export of organization data
4. **Email Templates** - Smart categorization of email types
5. **Attachment Processing** - Extract information from email attachments
6. **Advanced Search** - Full-text search with filters
7. **API Authentication** - User accounts and API key management

## Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: Node.js, Express, TypeScript, Drizzle ORM
- **Database**: MongoDB (primary), PostgreSQL (schema defined)
- **AI**: OpenAI GPT-4 API
- **Build Tools**: Vite, tsx
- **Extension**: Chrome Manifest V3

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all services are running correctly
3. Ensure proper API key configuration
4. Review the troubleshooting section above

The system is designed to be robust and user-friendly, providing a complete solution for email-based organization intelligence gathering.