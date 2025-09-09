# Overview

This is a content planning application built with a React frontend and Express backend. The app allows users to create, schedule, and manage content items across different platforms (social, email, blog) with a calendar-based interface for visual planning and organization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript and follows a component-based architecture:

- **Framework**: React with Vite as the build tool and development server
- **Routing**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Calendar**: React Big Calendar with Moment.js for the main content planning interface

## Backend Architecture

The backend follows a RESTful API design using Express.js:

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for database operations
- **Schema Validation**: Zod schemas shared between frontend and backend
- **Storage Pattern**: Interface-based storage abstraction with in-memory implementation for development
- **API Design**: RESTful endpoints for CRUD operations on content items

## Data Storage Solutions

- **Primary Database**: PostgreSQL configured through Drizzle ORM
- **ORM**: Drizzle ORM with migrations support
- **Schema Management**: Shared TypeScript schemas using Drizzle-Zod integration
- **Development Storage**: In-memory storage implementation for development/testing

## Database Schema

The application uses two main entities:
- **Content Items**: Stores content with title, description, platform, scheduled date, and status
- **Users**: Basic user management with username and password (currently unused in the main app)

## Authentication and Authorization

Basic user schema exists but authentication is not currently implemented in the main application flow. The storage interface includes user management methods for future implementation.

# External Dependencies

## Database Services
- **Neon Database**: PostgreSQL hosting service (configured via @neondatabase/serverless)
- **Connection**: Uses DATABASE_URL environment variable for database connectivity

## UI and Component Libraries
- **shadcn/ui**: Complete UI component system built on Radix UI primitives
- **Radix UI**: Unstyled, accessible UI primitives for React
- **Lucide React**: Icon library for consistent iconography
- **React Big Calendar**: Calendar component for content scheduling visualization

## Development and Build Tools
- **Vite**: Frontend build tool and development server
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **TypeScript**: Type safety across the entire application
- **Drizzle Kit**: Database migration and schema management tool

## Styling and Design
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with Autoprefixer
- **Custom Fonts**: Google Fonts integration (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)

## Form and Validation
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: Integration between React Hook Form and Zod

## Date and Time Handling
- **Moment.js**: Date manipulation and formatting (used with React Big Calendar)
- **date-fns**: Modern date utility library for additional date operations