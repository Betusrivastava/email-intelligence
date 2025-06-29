# Email Intelligence System

## Overview

A complete email intelligence system that extracts organization information from Gmail emails using AI and stores it in MongoDB. The system includes a Chrome extension for Gmail integration, a backend API with OpenAI integration, and a frontend dashboard for data management.

## Features

- **Chrome Extension**: One-click extraction directly from Gmail
- **AI-Powered Analysis**: Uses OpenAI GPT-4 for intelligent content extraction
- **MongoDB Storage**: Persistent organization data with full CRUD operations
- **React Dashboard**: Modern interface for data management
- **Real-time Updates**: Seamless data flow from Gmail to dashboard

## Quick Start

### Prerequisites

- Node.js 20+
- Chrome browser
- OpenAI API key
- MongoDB connection string

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Betusrivastava/email-intelligence-system.git
   cd email-intelligence-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   Create a `.env` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   DATABASE_URL=your_mongodb_connection_string
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `chrome-extension` folder
4. Pin the extension to your toolbar

## Usage

### Method 1: Chrome Extension
1. Open Gmail and select an email
2. Click the Email Intelligence extension icon
3. Click "Extract from Current Email"
4. Review and save the extracted data

### Method 2: Manual Entry
1. Open the dashboard at http://localhost:3000
2. Go to "Extract from Email" tab
3. Paste email content and click "Extract Information"
4. Review and save the data

## System Architecture

```
Gmail → Chrome Extension → Backend API (OpenAI + MongoDB) → Frontend Dashboard
```

### Components

- **Chrome Extension**: Gmail integration with content scripts
- **Frontend**: React dashboard with TanStack Query
- **Backend**: Express API with OpenAI integration
- **Database**: MongoDB for persistent storage

## Extracted Data Fields

- Organization name
- Location
- Owners/Key personnel
- Business activities
- Company age
- Website
- Industry category
- Original email content

## API Endpoints

- `POST /api/extract` - Extract organization from email content
- `GET /api/organizations` - List all organizations
- `POST /api/organizations` - Create new organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

## Development

### Project Structure
```
email-intelligence-system/
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared schemas and types
├── chrome-extension/       # Chrome extension files
├── package.json
└── README.md
```

### Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB, Drizzle ORM
- **AI**: OpenAI GPT-4
- **Extension**: Chrome Manifest V3

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.

## Author

Betu Srivastava - [GitHub](https://github.com/Betusrivastava)