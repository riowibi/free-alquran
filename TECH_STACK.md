# Free-Alquran Project

This document outlines the core technologies used in the Free-Alquran mobile application. It serves as a reference for developers contributing to the project and establishes a standard coding baseline.

## Primary Stack

- **Language**: TypeScript
- **Framework**: React Native via Expo
- **Platform**: Cross-platform mobile (iOS & Android)
- **Package Manager**: npm / Yarn (controlled via `package.json`)

## Architecture & Libraries

- **Navigation**: React Navigation (with folder-based routing)
- **State Management**: React hooks and custom hooks (no external state libraries)
- **Styling**: Styled components / inline styles (themed via custom theming files)
- **Type Definitions**: `@types` and custom interfaces under `types/`

## Utilities

- **HTTP Requests**: `fetch` API with custom service abstractions (e.g., `services/quran-api.ts`)
- **Linting**: ESLint (`eslint.config.js`)
- **Type Checking**: `tsconfig.json` configuration

## Project Structure

The workspace follows a feature-based folder organization:

```
app/
  components/      # UI components and reusable elements
  hooks/           # Custom hooks
  services/        # API and storage service logic
  types/           # Domain-specific TypeScript types
  assets/          # Images and static resources
  constants/       # Theme and other constant values
```

## Testing & Quality

- **Testing**: See `TESTING.md` for guidelines (likely using Jest/React Native Testing Library)
- **Code Quality**: Follows linting rules and formatting defined in project configuration.

## Development 

- **Setup**: See `SETUP.md` for environment preparation (Expo CLI, Node, etc.)
- **Debugging**: Uses Expo debugging tools, React DevTools.

This file provides a basis for the standard coding practices and technology choices. Further details and updates should be tracked in project documentation.