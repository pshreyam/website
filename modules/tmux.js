// tmux module - handles pane navigation and URL fragment management
export class TmuxManager {
  constructor() {
    this.currentSection = "home";
  }

  // tmux pane switching functionality
  switchTmuxPane(section) {
    // Update active pane styling
    document.querySelectorAll('.tmux-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    
    const activePane = document.querySelector(`[data-section="${section}"]`);
    if (activePane) {
      activePane.classList.add('active');
    }
    
    // Update URL fragment
    this.updateURLFragment(section);
    
    // Clear terminal and run section-specific commands
    window.terminalUI.clearOutput();
    window.uiManager.displayIntroduction();
    
    this.currentSection = section;
    
    // Handle input visibility and state based on section
    const inputContainer = document.querySelector('.input-container');
    
    if (section === 'terminal') {
      // Terminal: show and enable input
      if (inputContainer) inputContainer.style.display = 'flex';
      window.inputManager.enableInput();
    } else if (section === 'blogs' || section === 'projects') {
      // TUI pages: hide input entirely
      if (inputContainer) inputContainer.style.display = 'none';
    } else {
      // Other pages: show but disable input
      if (inputContainer) inputContainer.style.display = 'flex';
      window.inputManager.disableInput();
    }
    
    // Run commands based on section
    this.runSectionCommands(section);
  }

  switchTmuxPaneWithoutURLUpdate(section) {
    // Update active pane styling
    document.querySelectorAll('.tmux-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    
    const activePane = document.querySelector(`[data-section="${section}"]`);
    if (activePane) {
      activePane.classList.add('active');
    }
    
    // Exit TUI mode when switching tabs
    if (window.terminalUI.isTuiMode()) {
      window.terminalUI.exitTuiMode();
    }
    
    // Clear terminal and run section-specific commands
    window.terminalUI.clearOutput();
    window.uiManager.displayIntroduction();
    
    this.currentSection = section;
    
    // Handle input visibility and state based on section
    const inputContainer = document.querySelector('.input-container');
    
    if (section === 'terminal') {
      // Terminal: show and enable input
      if (inputContainer) inputContainer.style.display = 'flex';
      window.inputManager.enableInput();
    } else if (section === 'blogs' || section === 'projects') {
      // TUI pages: hide input entirely
      if (inputContainer) inputContainer.style.display = 'none';
    } else {
      // Other pages: show but disable input
      if (inputContainer) inputContainer.style.display = 'flex';
      window.inputManager.disableInput();
    }
    
    // Run commands based on section
    this.runSectionCommands(section);
  }

  runSectionCommands(section) {
    switch(section) {
      case 'home':
        window.commandManager.runHomeSection();
        break;
      case 'blogs':
        window.commandManager.runBlogsSection();
        break;
      case 'projects':
        window.commandManager.runProjectsSection();
        break;
      case 'contacts':
        window.commandManager.runContactsSection();
        break;
      case 'terminal':
        window.commandManager.runTerminalSection();
        break;
    }
  }

  // URL fragment functionality
  updateURLFragment(section) {
    if (section === 'home') {
      // Remove fragment for home
      history.pushState(null, null, window.location.pathname);
    } else {
      // Set fragment for other sections
      history.pushState(null, null, `#${section}`);
    }
  }

  loadSectionFromURL() {
    const fragment = window.location.hash.slice(1); // Remove the # symbol
    if (fragment && ['blogs', 'projects', 'contacts', 'terminal'].includes(fragment)) {
      this.switchTmuxPane(fragment);
    } else {
      // Default to home if no valid fragment
      this.switchTmuxPaneWithoutURLUpdate('home');
    }
  }

  // Initialize tmux pane event listeners
  initializeTmuxPanes() {
    document.querySelectorAll('.tmux-pane').forEach(pane => {
      pane.addEventListener('click', (e) => {
        const section = e.target.getAttribute('data-section');
        this.switchTmuxPane(section);
      });
    });
    
    // Add theme toggle button event listener
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Call the existing toggle theme function from commands.js
        window.commandManager.toggleTheme();
      });
    }
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
      this.loadSectionFromURL();
    });
  }
}
