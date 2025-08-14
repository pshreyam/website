// Input module - handles input control, tooltips, and input events
export class InputManager {
  constructor() {
    this.inputField = document.getElementById("input");
    this.inputTooltip = document.getElementById("inputTooltip");
    this.tooltipTimeout = null;
    
    this.initializeInputEvents();
  }

  // Input control functions
  disableInput() {
    this.inputField.disabled = true;
    this.inputField.placeholder = "Navigate to 4:Terminal to use commands";
    this.inputField.style.cursor = "not-allowed";
    this.inputField.style.opacity = "0.6";
    
    // Show tooltip on hover when disabled
    this.setupTooltipEvents();
  }

  enableInput() {
    this.inputField.disabled = false;
    this.inputField.placeholder = "Type 'help' for commands...";
    this.inputField.style.cursor = "text";
    this.inputField.style.opacity = "1";
    
    // Hide tooltip and remove events when enabled
    this.hideTooltip();
    this.removeTooltipEvents();
  }

  // Tooltip functionality
  showTooltip() {
    if (this.inputTooltip) {
      this.inputTooltip.classList.add('show');
    }
  }

  hideTooltip() {
    if (this.inputTooltip) {
      this.inputTooltip.classList.remove('show');
    }
  }

  setupTooltipEvents() {
    if (this.inputField && this.inputTooltip) {
      this.inputField.addEventListener('mouseenter', this.showTooltipOnHover.bind(this));
      this.inputField.addEventListener('mouseleave', this.hideTooltipOnLeave.bind(this));
      this.inputField.addEventListener('focus', this.showTooltipOnHover.bind(this));
      this.inputField.addEventListener('blur', this.hideTooltipOnLeave.bind(this));
    }
  }

  removeTooltipEvents() {
    if (this.inputField) {
      this.inputField.removeEventListener('mouseenter', this.showTooltipOnHover.bind(this));
      this.inputField.removeEventListener('mouseleave', this.hideTooltipOnLeave.bind(this));
      this.inputField.removeEventListener('focus', this.showTooltipOnHover.bind(this));
      this.inputField.removeEventListener('blur', this.hideTooltipOnLeave.bind(this));
    }
  }

  showTooltipOnHover() {
    if (this.inputField.disabled) {
      clearTimeout(this.tooltipTimeout);
      this.showTooltip();
    }
  }

  hideTooltipOnLeave() {
    this.tooltipTimeout = setTimeout(() => {
      this.hideTooltip();
    }, 200);
  }

  showNavigationMessage() {
    window.terminalUI.displayMessage("Input disabled in this pane. Click \"4:Terminal\" to use commands.", "warning");
    
    // Also show tooltip briefly
    this.showTooltip();
    setTimeout(() => {
      this.hideTooltip();
    }, 2000);
  }

  // Initialize input event listeners
  initializeInputEvents() {
    // Handle Enter key for command execution
    this.inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const input = this.inputField.value.trim();
        if (input) {
          window.commandManager.addToHistory(input);
          this.inputField.value = "";
          window.terminalUI.handleCommand(input);
        }
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const historyCommand = window.commandManager.getHistoryCommand('up');
        if (historyCommand !== null) {
          this.inputField.value = historyCommand;
          this.inputField.selectionStart = this.inputField.selectionEnd = this.inputField.value.length;
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        const historyCommand = window.commandManager.getHistoryCommand('down');
        if (historyCommand !== null) {
          this.inputField.value = historyCommand;
          this.inputField.selectionStart = this.inputField.selectionEnd = this.inputField.value.length;
        }
      }
    });

    // Add event listener for disabled input attempts
    this.inputField.addEventListener('click', () => {
      if (this.inputField.disabled && window.tmuxManager.currentSection !== 'terminal') {
        this.showNavigationMessage();
      }
    });
    
    // Also handle when users try to type in disabled input
    this.inputField.addEventListener('keydown', (e) => {
      if (this.inputField.disabled && window.tmuxManager.currentSection !== 'terminal') {
        e.preventDefault();
        this.showNavigationMessage();
      }
    });
  }

  // Keyboard shortcuts
  initializeKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key === "l") {
        event.preventDefault();
        window.commandManager.clearTerminal();
      } else if (event.ctrlKey && event.key === "u") {
        // Handle Ctrl + U to clear the input field
        event.preventDefault();
        const cursorPosition = this.inputField.selectionStart;
        const currentValue = this.inputField.value;
        this.inputField.value = currentValue.substring(cursorPosition);
        this.inputField.selectionStart = this.inputField.selectionEnd = 0;
      } else if (event.ctrlKey && event.key === "k") {
        // Handle Ctrl + K to clear the right of the cursor
        event.preventDefault();
        const cursorPosition = this.inputField.selectionStart;
        const currentValue = this.inputField.value;
        this.inputField.value = currentValue.substring(0, cursorPosition);
        this.inputField.selectionStart = this.inputField.selectionEnd = -1;
      }
    });
  }

  // Focus management
  focusInput() {
    this.inputField.focus();
  }
}
