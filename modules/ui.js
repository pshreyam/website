// UI module - handles UI updates, tips, time display, and theme management
export class UIManager {
  constructor() {
    this.currentTheme = localStorage.getItem("theme") || "dark";
    this.tips = [
      "Simply type <code>'help'</code> and press <code>Enter</code> to view all the available commands.",
      "You can toggle the theme preference with <code>'toggle_theme'</code> command.",
      "Site preferences can be reset using <code>'reset'</code> command.",
      "Use <code>'default'</code> command in order to fetch the default content loaded on the site on opening first time.",
    ];
    this.updatedTipsIndex = 0;
    
    this.initializeTheme();
    this.initializeTimeUpdates();
    this.initializeTipsRotation();
  }

  // Theme management
  initializeTheme() {
    if (this.currentTheme === "light") {
      document.body.classList.add("light-theme");
    }
  }

  // Tips management
  displayIntroduction(showTips = false) {
    if (showTips) {
      const introMessage = `<div class="tips"><i class="fa-solid fa-circle-info" title="Tip"></i> <span id="tipsMessage">${this.tips[0]}</span></div>`;
      window.terminalUI.displayOutput(introMessage, "response", "intro");
    }
  }

  changeTips() {
    if (window.tmuxManager.currentSection === 'terminal') {
      this.updatedTipsIndex = (this.updatedTipsIndex + 1) % this.tips.length;
      const tipsMessage = document.getElementById("tipsMessage");
      if (tipsMessage) {
        tipsMessage.innerHTML = this.tips[this.updatedTipsIndex];
      }
    }
  }

  initializeTipsRotation() {
    // Change the tip every 5 seconds
    setInterval(() => this.changeTips(), 5000);
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
      tmuxInfo.textContent = `"Terminal.local" ${timeString} ${dateString}`;
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
      if (input === "clear" || input === "default") return;
      
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
}
