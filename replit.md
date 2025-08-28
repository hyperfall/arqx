# Overview

TOOLFORGE is a full-stack application for building and using tools through natural language descriptions. Users can describe the functionality they want, and the system generates customizable tools with real-time settings, file processing capabilities, and batch operations. The platform features a gallery of community tools, recent tool tracking, and a modern glassmorphic UI with multiple theme support.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components for consistent design system
- **State Management**: Zustand for global state (UI state, auth, recent tools)
- **Data Fetching**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with custom styling for accessibility

## Backend Architecture
- **Server**: Express.js with TypeScript for API endpoints
- **Development**: Hot reloading with Vite integration in development mode
- **Storage**: In-memory storage implementation with interface for future database integration
- **API Design**: RESTful endpoints for tools, favorites, and health checks

## Database Design
- **ORM**: Drizzle ORM with PostgreSQL schema definitions
- **Tables**: Users, profiles, toolspecs, and favorites with proper relationships
- **Migrations**: Managed through drizzle-kit for version control

## Theming System
- **Architecture**: Context-based theme provider with CSS custom properties
- **Themes**: Multiple predefined themes (Pastel Glass, Neo Noir) with light/dark variants
- **Customization**: Comprehensive color, typography, and effect variables

## Tool Generation System
- **FastLane Engine**: Pattern-matching system for generating tool specifications from natural language
- **Tool Specs**: JSON-based configuration for tool settings, inputs, and processing logic
- **Real-time Refinement**: Bottom dock composer for iterative tool improvement

## Layout System
- **Responsive Design**: Grid-based layout with collapsible left rail navigation
- **Glass Morphism**: Backdrop blur effects and translucent surfaces
- **Connected Navigation**: Active nav items with visual connectors to main content
- **Adaptive Docking**: Bottom composer that can dock/undock based on user flow

## File Processing
- **Dropzone**: Drag-and-drop file upload with type validation and size limits
- **Batch Operations**: Support for multiple file processing with progress tracking
- **Output Management**: Generated file handling with download capabilities

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for serverless environments
- **drizzle-orm**: Type-safe database operations and schema management
- **@tanstack/react-query**: Server state management and caching
- **zustand**: Lightweight state management for client state
- **wouter**: Minimal routing library for React applications

## UI/UX Libraries  
- **@radix-ui/***: Accessible UI primitives for components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library for consistent iconography
- **react-dropzone**: File upload handling with drag-and-drop support
- **embla-carousel-react**: Carousel/slider components

## Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety and enhanced developer experience
- **drizzle-kit**: Database migration and schema management
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

## Authentication & Validation
- **@supabase/supabase-js**: Authentication and database services (with mock fallback)
- **zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: Form validation integration

## Styling & Animation
- **class-variance-authority**: Type-safe component variants
- **clsx**: Conditional className utility
- **tailwind-merge**: Tailwind class merging utility