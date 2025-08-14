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
    
    // Update mobile menu active state
    this.updateMobileMenuActiveState();
    
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
    
    // Update mobile menu active state
    this.updateMobileMenuActiveState();
    
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
    
    // Initialize hamburger menu functionality
    this.initializeHamburgerMenu();
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
      this.loadSectionFromURL();
    });
  }

  // Hamburger menu functionality
  initializeHamburgerMenu() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    if (!hamburgerMenu || !mobileMenuOverlay) return;
    
    // Toggle mobile menu when hamburger is clicked
    hamburgerMenu.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMobileMenu();
    });
    
    // Close menu when clicking outside the nav items (on overlay)
    mobileMenuOverlay.addEventListener('click', (e) => {
      if (e.target === mobileMenuOverlay) {
        this.closeMobileMenu();
      }
    });
    
    // Handle mobile navigation item clicks
    mobileNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.getAttribute('data-section');
        this.switchTmuxPane(section);
        this.closeMobileMenu();
      });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMobileMenuOpen()) {
        this.closeMobileMenu();
      }
    });
  }

  toggleMobileMenu() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    
    hamburgerMenu.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
    
    // Update active state in mobile menu
    this.updateMobileMenuActiveState();
  }

  closeMobileMenu() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    
    hamburgerMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    
    // Restore body scroll
    document.body.style.overflow = '';
  }

  isMobileMenuOpen() {
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    return mobileMenuOverlay && mobileMenuOverlay.classList.contains('active');
  }

  updateMobileMenuActiveState() {
    // Update active state for mobile nav items
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    if (mobileNavItems.length === 0) return; // Early return if mobile menu not yet initialized
    
    mobileNavItems.forEach(item => {
      item.classList.remove('active');
      const section = item.getAttribute('data-section');
      if (section === this.currentSection) {
        item.classList.add('active');
      }
    });
  }
}
