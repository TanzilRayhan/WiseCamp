# WiseCamp Frontend

A modern React TypeScript frontend for the WiseCamp agile project management platform.

## Features

- 🎯 **Modern Stack**: React 19 + TypeScript + Vite
- 🎨 **Beautiful UI**: Tailwind CSS with custom design system
- 🔐 **Authentication**: JWT-based auth with React Context
- 🚀 **Routing**: React Router v7 with protected routes
- 📱 **Responsive**: Mobile-first responsive design
- 🎭 **Icons**: Lucide React icons
- 📝 **Forms**: React Hook Form with Zod validation
- 🗃️ **HTTP Client**: Axios with interceptors
- 🎯 **Drag & Drop**: React DnD for Kanban boards

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── kanban/         # Kanban board components
│   ├── layout/         # Layout components
│   └── project/        # Project management components
├── context/            # React contexts
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:8080

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend connects to the WiseCamp Spring Boot backend API:

- **Base URL**: `http://localhost:8080/api`
- **Authentication**: JWT tokens stored in localStorage
- **Auto-retry**: Automatic token refresh and error handling

## Technology Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React DnD** - Drag and drop
