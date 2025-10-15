
# Customer Claims Portal

A modern web application for processing customer warranty claims and technical support requests, powered by AI-driven workflows.

## Overview

This Customer Claims Portal streamlines the support process by integrating with n8n workflows to provide automated invoice analysis, product identification, issue detection, and troubleshooting guidance.

## Features

- **Invoice Upload & Analysis**: Automatically extract product information from uploaded receipts
- **AI-Powered Issue Detection**: Intelligent identification of potential product issues
- **Interactive Troubleshooting**: Step-by-step guidance for common problems
- **Multi-Step Workflow**: Guided process from claim initiation to resolution
- **Email Notifications**: Automated case summary delivery

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Workflow Engine**: n8n integration via webhooks
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Architecture

The application follows a client-server architecture:

- **Client**: React-based SPA handling user interactions
- **Server**: Express backend acting as a proxy to n8n workflows
- **n8n Integration**: Workflow automation for claims processing

### Workflow Steps

1. **Initialize**: Start a new claim session
2. **Upload**: Submit invoice/receipt for analysis
3. **Select**: Choose affected products and support type
4. **Describe**: Identify specific issues from AI-generated list
5. **Resolve**: Receive troubleshooting steps and email confirmation

## Key Files

- `/client/src/pages/Portal.tsx` - Main application UI
- `/server/routes.ts` - API endpoints and n8n integration
- `/project.md` - Technical documentation for n8n workflow integration
- `/design_guidelines.md` - UI/UX design specifications

## API Endpoints

- `POST /api/start-workflow` - Initialize new claim workflow
- `POST /api/resume-workflow` - Continue workflow with user input

## n8n Workflow Integration

The application communicates with n8n through webhooks:
- Initial webhook triggers workflow start
- Wait nodes use `resumeUrl` for multi-step interactions
- Respond nodes return structured JSON data to the frontend

See `project.md` for detailed integration instructions.

## Development

The project uses:
- TypeScript for type safety
- Tailwind CSS for styling
- Vite for fast development and building
- Express for backend API

## License

This project is proprietary software.

## Support

For issues or questions, please contact your system administrator.
