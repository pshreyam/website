// UI module - handles UI updates, time display, and theme management
export class UIManager {
  constructor() {
    this.currentTheme = localStorage.getItem("theme") || "dark";
    
    this.initializeTheme();
    this.initializeTimeUpdates();
  }

  // Theme management
  initializeTheme() {
    if (this.currentTheme === "light") {
      document.body.classList.add("light-theme");
    }
    this.updateThemeIcon();
  }

  updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    if (themeIcon && themeToggleBtn) {
      if (this.currentTheme === "light") {
        // Light theme -> show moon icon (clicking will switch to dark)
        themeIcon.className = "fa-solid fa-moon";
        themeToggleBtn.title = "Switch to dark theme";
      } else {
        // Dark theme -> show sun icon (clicking will switch to light)
        themeIcon.className = "fa-solid fa-sun";
        themeToggleBtn.title = "Switch to light theme";
      }
    }
  }

  // Introduction management
  displayIntroduction() {
    // Introduction can be displayed here if needed in the future
    // Currently no intro content is shown
  }

  // Time management
  updateTmuxTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const dateString = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
    
    const tmuxInfo = document.querySelector('.tmux-info');
    if (tmuxInfo) {
      tmuxInfo.textContent = `${dateString}`;
    }
  }

  initializeTimeUpdates() {
    // Update tmux time initially and then every minute
    this.updateTmuxTime();
    setInterval(() => this.updateTmuxTime(), 60000);
  }
}

// Terminal UI handling
export class TerminalUI {
  constructor() {
    this.outputDiv = document.getElementById("output");
    this.terminalDiv = document.getElementById("terminal");
    this.initializeClickableCommands();
  }

  initializeClickableCommands() {
    // Use event delegation to handle clicks on dynamically added clickable commands and TUI actions
    this.outputDiv.addEventListener('click', (event) => {
      const clickableElement = event.target.closest('.clickable-command');
      const tuiElement = event.target.closest('.tui-action');
      
      if (tuiElement) {
        const action = tuiElement.getAttribute('data-action');
        if (action) {
          event.preventDefault();
          this.executeTuiAction(tuiElement, action);
        }
      } else if (clickableElement) {
        const command = clickableElement.getAttribute('data-command');
        if (command) {
          event.preventDefault();
          this.executeClickableCommand(command);
        }
      }
    });
  }

  executeTuiAction(element, action) {
    // Handle exitTui action directly like ESC key does
    if (action === 'exitTui') {
      const currentSection = window.tmuxManager && window.tmuxManager.currentSection;
      
      if (window.terminalUI && window.terminalUI.isTuiMode()) {
        // Exit TUI mode in terminal
        window.terminalUI.exitTuiMode();
        window.terminalUI.clearOutput();
        window.terminalUI.displayOutput("TUI mode exited. Type 'help' for available commands.", "response");
        // Focus input for immediate typing
        setTimeout(() => window.inputManager.focusInput(), 10);
      } else if (currentSection === 'blogs' || currentSection === 'projects') {
        // Navigate to terminal from TUI pages
        window.tmuxManager.switchTmuxPane('terminal');
        // Focus input after switching to terminal
        setTimeout(() => window.inputManager.focusInput(), 100);
      }
      return;
    }
    
    // Handle back to list actions
    if (action === 'backToBlogList') {
      this.clearOutput();
      this.scrollToTop();
      window.commandManager.blogManager.listBlogs().then(output => {
        this.displayOutput(output, "response");
      });
      return;
    }
    
    if (action === 'backToProjectList') {
      this.clearOutput();
      this.scrollToTop();
      window.commandManager.projectManager.listProjects().then(output => {
        this.displayOutput(output, "response");
      });
      return;
    }
    
    // Clear terminal and scroll to top for clean TUI display
    this.clearOutput();
    this.scrollToTop();
    
    // Extract data attributes
    const data = {
      blogId: element.getAttribute('data-blog-id'),
      projectId: element.getAttribute('data-project-id'),
      tag: element.getAttribute('data-tag'),
      tech: element.getAttribute('data-tech'),
      type: element.getAttribute('data-type'),
      query: element.getAttribute('data-query')
    };
    
    // Determine which manager to use based on action and current context
    let manager;
    if (action.includes('Project') || action.includes('Tech') || action.includes('Type') || data.projectId) {
      manager = window.commandManager.projectManager;
    } else {
      manager = window.commandManager.blogManager;
    }
    
    // Handle TUI action through appropriate manager
    manager.handleTuiAction(action, data).then(content => {
      // Only enter TUI mode if we're in the terminal section
      const isInTerminal = window.tmuxManager && window.tmuxManager.currentSection === 'terminal';
      if (isInTerminal) {
        this.enterTuiMode();
      }
      
      const output = document.createElement("div");
      output.innerHTML = content;
      this.outputDiv.appendChild(output);
      
      // Initialize syntax highlighting for code blocks
      if (window.hljs) {
        setTimeout(() => {
          this.outputDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
          });
        }, 10);
      }
    }).catch(error => {
      this.displayOutput(`Error: ${error.message}`, "response warning");
    });
  }

  executeClickableCommand(command) {
    // Clear terminal for TUI actions to provide clean display
    this.clearOutput();
    
    // Display the command being executed
    this.displayOutput(`<span class="command"><span class="prompt"><i class="fa-solid fa-arrow-right"></i></span>${command}</span>`, "command-output");
    
    // Execute the command
    const response = window.commandManager.executeCommand(command);
    
    if (response !== null) {
      if (command !== "clear") {
        this.displayOutput(response, "response");
      }
    } else {
      this.displayOutput(`Command not found: ${command}`, "response warning");
    }
  }

  displayOutput(content, cssClass = "response", elementId = null) {
    const output = document.createElement("div");
    const idAttr = elementId ? ` id="${elementId}"` : '';
    output.innerHTML = `<span class="${cssClass}"${idAttr}>${content}</span>\n`;
    this.outputDiv.appendChild(output);
    this.scrollToBottom();
  }

  displayMessage(message, type = "response") {
    const output = document.createElement("div");
    const className = type === "warning" ? "response warning" : "response";
    output.innerHTML = `<span class="${className}">${message}</span>\n\n`;
    this.outputDiv.appendChild(output);
    this.scrollToBottom();
  }

  handleCommand(input) {
    const output = document.createElement("div");
    const response = window.commandManager.executeCommand(input);
    
    if (response !== null) {
      if (input === "clear") return;
      
      output.innerHTML = `<span class="command"><span class="prompt"><i class="fa-solid fa-arrow-right"></i></span>${input}</span>\n<span class="response">${response}</span>\n\n`;
    } else {
      output.innerHTML = `<span class="command"><span class="prompt"><i class="fa-solid fa-arrow-right"></i></span>${input}</span>\n<span class="response warning">Command not found. Type 'help' for available commands.</span>\n\n`;
    }
    
    this.outputDiv.appendChild(output);
    this.scrollToBottom();
  }

  clearOutput() {
    this.outputDiv.innerHTML = "";
  }

  scrollToBottom() {
    this.terminalDiv.scrollTop = this.outputDiv.scrollHeight;
  }

  scrollToTop() {
    this.terminalDiv.scrollTop = 0;
  }

  displayAsyncResult(input, content, isError = false) {
    const tuiCommands = ['blogs', 'projects'];
    const isTuiCommand = tuiCommands.includes(input.trim());
    const isInTerminal = window.tmuxManager && window.tmuxManager.currentSection === 'terminal';
    
    if (isTuiCommand && isInTerminal) {
      // For TUI commands in terminal, enter TUI mode and only show content
      this.enterTuiMode();
      this.clearOutput();
      
      const output = document.createElement("div");
      output.innerHTML = content; // Only show the TUI content
      this.outputDiv.appendChild(output);
    } else if (isTuiCommand && !isInTerminal) {
      // For TUI commands in other tabs, show content without entering TUI mode
      this.clearOutput();
      
      const output = document.createElement("div");
      output.innerHTML = content; // Show the TUI content but keep normal UI
      this.outputDiv.appendChild(output);
    } else {
      // For regular commands, show normal output
      this.clearOutput();
      
      const className = isError ? "response warning" : "response";
      const output = document.createElement("div");
      output.innerHTML = `<span class="command"><span class="prompt"><i class="fa-solid fa-arrow-right"></i></span>${input}</span>\n<span class="${className}">${content}</span>\n\n`;
      this.outputDiv.appendChild(output);
    }
    
    // Initialize syntax highlighting for code blocks
    if (!isError && window.hljs) {
      setTimeout(() => {
        this.outputDiv.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
      }, 10);
    }
    
    this.scrollToBottom();
  }

  enterTuiMode() {
    this.terminalDiv.classList.add('tui-mode');
    // Only hide input container if we're in the terminal tab
    if (window.tmuxManager && window.tmuxManager.currentSection === 'terminal') {
      const inputContainer = document.querySelector('.input-container');
      if (inputContainer) {
        inputContainer.style.display = 'none';
      }
    }
  }

  exitTuiMode() {
    this.terminalDiv.classList.remove('tui-mode');
    // Only show input container if we're in the terminal tab
    if (window.tmuxManager && window.tmuxManager.currentSection === 'terminal') {
      const inputContainer = document.querySelector('.input-container');
      if (inputContainer) {
        inputContainer.style.display = 'flex';
      }
      window.inputManager.enableInput();
    }
  }

  isTuiMode() {
    return this.terminalDiv.classList.contains('tui-mode');
  }
}
