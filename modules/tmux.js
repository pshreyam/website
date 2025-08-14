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
    window.uiManager.displayIntroduction(section === 'terminal');
    
    this.currentSection = section;
    
    // Enable/disable input based on section
    if (section === 'terminal') {
      window.inputManager.enableInput();
    } else {
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
    
    // Clear terminal and run section-specific commands
    window.terminalUI.clearOutput();
    window.uiManager.displayIntroduction(section === 'terminal');
    
    this.currentSection = section;
    
    // Enable/disable input based on section
    if (section === 'terminal') {
      window.inputManager.enableInput();
    } else {
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
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
      this.loadSectionFromURL();
    });
  }
}
