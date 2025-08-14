# Terminal Portfolio - Module Structure

This directory contains the modularized JavaScript code for the terminal portfolio website.

## Module Overview

### `commands.js` - Command Management
- **Purpose**: Handles all command definitions and execution logic
- **Classes**: `CommandManager`
- **Responsibilities**:
  - Command definitions (help, name, bio, contacts, etc.)
  - Command execution and response generation
  - Command history management
  - Section runners (home, blogs, projects, contacts, terminal)
  - Theme toggling and preferences

### `tmux.js` - Terminal Multiplexer Interface
- **Purpose**: Manages tmux pane navigation and URL routing
- **Classes**: `TmuxManager`
- **Responsibilities**:
  - Pane switching and active state management
  - URL fragment handling for deep linking
  - Browser back/forward navigation
  - Section command execution coordination

### `input.js` - Input Control System
- **Purpose**: Handles user input, tooltips, and keyboard interactions
- **Classes**: `InputManager`
- **Responsibilities**:
  - Input field enable/disable functionality
  - Tooltip management for disabled states
  - Command history navigation (arrow keys)
  - Keyboard shortcuts (Ctrl+L, Ctrl+U, Ctrl+K)
  - Input validation and event handling

### `ui.js` - User Interface Management
- **Purpose**: Manages UI updates, themes, and terminal display
- **Classes**: `UIManager`, `TerminalUI`
- **Responsibilities**:
  - Theme initialization and management
  - Real-time clock updates in tmux bar
  - Terminal output rendering and formatting
  - Introduction message handling

## Architecture Benefits

1. **Separation of Concerns**: Each module has a clear, focused responsibility
2. **Maintainability**: Easy to locate and modify specific functionality
3. **Reusability**: Modules can be imported and used independently
4. **Testability**: Individual modules can be tested in isolation
5. **Scalability**: New features can be added without cluttering existing code

## Module Communication

Modules communicate through:
- Global window objects for cross-module access
- Event-driven interactions
- Direct method calls for coordinated actions

## File Structure
```
/website
├── main.js                    # Application entry point and coordination
├── modules/
│   ├── commands.js           # Command definitions and management
│   ├── tmux.js              # Pane navigation and URL handling
│   ├── input.js             # Input control and event handling
│   ├── ui.js                # UI updates and terminal display
│   └── README.md            # This documentation
├── index.html               # Main HTML structure
└── styles.css              # CSS styling
```
