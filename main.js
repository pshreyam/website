// Main application entry point - coordinates all modules
import { CommandManager } from './modules/commands.js';
import { TmuxManager } from './modules/tmux.js';
import { InputManager } from './modules/input.js';
import { UIManager, TerminalUI } from './modules/ui.js';

// Initialize all managers and make them globally available
window.commandManager = new CommandManager();
window.tmuxManager = new TmuxManager();
window.inputManager = new InputManager();
window.uiManager = new UIManager();
window.terminalUI = new TerminalUI();

// Application initialization
function initializeApp() {
  // Initialize keyboard shortcuts
  window.inputManager.initializeKeyboardShortcuts();
  
  // Initialize tmux panes functionality
  window.tmuxManager.initializeTmuxPanes();
  
  // Load appropriate section based on URL (this will handle displaying introduction with proper tips)
  window.tmuxManager.loadSectionFromURL();
  
  // Focus on the input prompt after initialization
  window.inputManager.focusInput();
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
