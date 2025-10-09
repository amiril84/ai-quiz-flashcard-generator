# UI Overhaul and Frontend Migration Plan

## 1. Overview

This document outlines the plan to migrate the frontend of the AI Quiz & Flashcard Generator from a vanilla HTML/CSS/JS stack to a modern React-based architecture using Vite. The primary goal is to improve the user interface (UI) by integrating the `shadcn/ui` component library.

## 2. Project Setup

### 2.1. Create a New Frontend Directory
- A new directory named `frontend` will be created to house the new React application, keeping it separate from the backend.

### 2.2. Initialize a New React Project
- Vite will be used to bootstrap a new React project within the `frontend` directory.
- **Command**: `npm create vite@latest frontend -- --template react`

## 3. `shadcn/ui` Integration

### 3.1. Install Dependencies
- `tailwindcss` will be installed and configured as it is a prerequisite for `shadcn/ui`.

### 3.2. Initialize `shadcn/ui`
- The `shadcn/ui` CLI will be used to initialize the library in the new `frontend` project.
- This will automatically create the necessary configuration files, such as `tailwind.config.js` and `components.json`, and set up the required project structure.

## 4. Component Architecture

The current single-page application will be refactored into a set of modular and reusable React components:

- **`App.jsx`**: The main application component that manages the overall state and renders other components based on the application's current view (setup, quiz, flashcards, or results).
- **`SetupForm.jsx`**: A component for the initial setup screen where users select the content source (document, YouTube, website), content type (quiz or flashcards), and other options.
- **`QuizView.jsx`**: A component to display the interactive quiz, including questions, multiple-choice options, progress tracking, and explanations.
- **`FlashcardView.jsx`**: A component for displaying and interacting with flashcards, including the flip animation and navigation.
- **`ResultsPage.jsx`**: A component to display the final quiz score and a detailed breakdown of the user's answers.

## 5. UI Refactoring with `shadcn/ui`

The existing HTML elements will be replaced with their `shadcn/ui` counterparts to create a more modern and polished UI:

- **`Button`**: For all buttons, such as "Generate Quiz," "Next Question," and "Reset."
- **`Select`**: For all dropdown menus, such as content source and language selection.
- **`Input`**: For all text and number input fields.
- **`Card`**: To structure the main content sections (setup, quiz, flashcards, results) in a visually consistent way.
- **`Progress`**: To display the progress of the quiz or flashcard session.
- **`Spinner` / `Loader`**: To provide visual feedback during loading states, such as when generating content.

## 6. Logic Migration

The application logic currently in `script.js` will be refactored and integrated into the new React components:

- **State Management**: React's state management hooks (`useState`, `useReducer`) will be used to manage the application's state, replacing the current global variables with a more organized and predictable system.
- **API Calls**: All API calls to the backend and the OpenRouter API will be managed within the React components using `useEffect` for data fetching.

## 7. Deployment on Render

### 7.1. Backend
- The backend deployment on Render will **not be affected** by these changes.

### 7.2. Frontend
- The frontend is currently deployed as a static site on Render. After the migration, the deployment settings will need to be updated.
- The following settings will need to be changed in the Render dashboard for the static site:
  - **Root Directory**: `frontend`
  - **Build Command**: `npm install && npm run build`
  - **Publish Directory**: `dist`
- Step-by-step instructions will be provided upon completion of the migration.
