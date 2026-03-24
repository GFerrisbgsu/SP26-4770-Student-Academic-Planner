# Recommended VS Code Extensions

This document lists the recommended VS Code extensions for the Student Academic Planner project.

## Essential Extensions

### ES7+ React/Redux/React-Native snippets
- **Version:** v4.4.3
- **Publisher:** dsznajder
- **Extension ID:** `dsznajder.es7-react-js-snippets`
- **Description:** JavaScript and React/Redux snippets in ES7+ with Babel plugin features
- **Why we need it:** Provides helpful code snippets for React development, speeding up component creation and reducing boilerplate code.

**Useful snippets:**
- `rafce` - React Arrow Function Component Export
- `rafc` - React Arrow Function Component
- `rfc` - React Function Component
- `useState` - React useState Hook
- `useEffect` - React useEffect Hook

### Tailwind CSS IntelliSense
- **Publisher:** Bradlc
- **Extension ID:** `bradlc.vscode-tailwindcss`
- **Description:** Intelligent Tailwind CSS tooling for VS Code
- **Why we need it:** Provides autocomplete, syntax highlighting, and linting for Tailwind CSS classes used throughout the project.

**Features:**
- Autocomplete for Tailwind CSS classes
- Linting for class names
- Hover previews showing the actual CSS
- Syntax highlighting

### Vite
- **Publisher:** antfu
- **Extension ID:** `antfu.vite`
- **Description:** VS Code integration for Vite
- **Why we need it:** Enhances the development experience when working with Vite, our build tool.

**Features:**
- Quick access to Vite commands
- Better integration with Vite dev server
- Error highlighting and debugging support

## Installation

### Install All at Once
You can install all recommended extensions at once by creating a `.vscode/extensions.json` file (see below).

### Install Individually
1. Open VS Code
2. Go to Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for the extension name or ID
4. Click Install

## Automated Installation

Create or update `.vscode/extensions.json` in the project root:

```json
{
  "recommendations": [
    "dsznajder.es7-react-js-snippets",
    "bradlc.vscode-tailwindcss",
    "antfu.vite"
  ]
}
```

VS Code will automatically prompt team members to install these extensions when they open the workspace.

## Additional Helpful Extensions (Optional)

While not required, these extensions can also improve your development experience:

- **ESLint** - Integrates ESLint into VS Code
- **Prettier** - Code formatter
- **GitLens** - Supercharge Git capabilities
- **Path Intellisense** - Autocompletes filenames
- **Auto Rename Tag** - Automatically rename paired HTML/JSX tags
