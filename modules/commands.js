// Commands module - handles all command definitions and execution
export class CommandManager {
  constructor() {
    this.commands = {
      help: {
        content: () => {
          // Dynamically build the help text
          let helpText = "Available commands:\n\n";
          const commandWidth = 20; // Fixed width for commands (adjust as needed)
          for (const [key, { description }] of Object.entries(this.commands)) {
            const paddedCommand = key.padEnd(commandWidth); // Pad command to fixed width
            helpText += `${paddedCommand} ${description}\n`; // Add padded command with description
          }
          return helpText.trim();
        },
        description: "Displays a list of available commands",
      },
      name: {
        content: "Shreyam Pokharel",
        description: "Displays my name",
      },
      bio: {
        content:
          "I am a passionate Linux enthusiast with a strong penchant for Python programming. I am also familiar with C, C++, Bash and a little bit JavaScript. During my free time, I love delving into innovative programming and tech concepts. I am also interested in learning about GNU/Linux tools and concepts.",
        description: "Shows my bio",
      },
      image: {
        content: () => {
          return "<img src='shreyam.jpg' alt='Shreyam Pokharel' class='profile-image' />";
        },
        description: "Displays my image",
      },
      contacts: {
        content: () => {
          const email = "<a href='mailto:pshreyam@gmail.com' class='link'>pshreyam@gmail.com</a>";
          const linkedin = "<a href='https://www.linkedin.com/in/shreyam-pokharel/' target='_blank' class='link'>shreyam-pokharel</a>";
          const github = "<a href='https://github.com/pshreyam' target='_blank' class='link'>@pshreyam</a>";
          return `Email: ${email} <br>LinkedIn: ${linkedin}<br>GitHub: ${github}`;
        },
        description: "Shows my contact details",
      },
      experience: {
        content:
          "- Backend Engineer @ Docsumo (July 2023 - present)\n" +
          "- Python Intern @ Docsumo (April 2023 - July 2023)",
        description: "Lists my professional experience",
      },
      projects: {
        content:
          "Please visit <a href='https://github.com/pshreyam' target='_blank' class='link'>my github profile</a> to view my projects.",
        description: "Lists my projects",
      },
      education: {
        content:
          "- BE in Computer Engineering @ Kathmandu University (2018 - 2023)\n" +
          "- Secondary Education @ Capital College and Research Center (2016 - 2018)\n" +
          "- School Leaving Certificate @ Paragon Public School (2016)",
        description: "Lists my educational qualifications",
      },
      blogs: {
        content: "[This is undergoing maintainance. Stay tuned ...]",
        description: "Lists my blogs",
      },
      hobbies: {
        content:
          "- Exploring programming languages and tinkering my operating system\n" +
          "- Singing and participating in various sports",
        description: "Lists my hobbies",
      },
      default: {
        content: () => this.runHomeSection(),
        description: "Run all the commands which are run by default upon page initialization",
      },
      history: {
        content: () => {
          return this.getCommandHistory().join("\n");
        },
        description: "Fetches the history of input commands",
      },
      clear: {
        content: () => {
          return this.clearTerminal();
        },
        description: "Clears the terminal output (Ctrl + L does the same)",
      },
      ping: {
        content: "pong",
        description: "Checks if the terminal is active and responds with 'pong'",
      },
      toggle_theme: {
        content: () => {
          return this.toggleTheme();
        },
        description: "Switch between light and dark themes",
      },
      reset: {
        content: () => {
          return this.resetPreferences();
        },
        description: "Reset the theme preference and command history",
      },
    };
    
    this.commandHistory = JSON.parse(localStorage.getItem("commandHistory")) || [];
    this.historyIndex = this.commandHistory.length;
  }

  // Section runners
  runHomeSection() {
    const homeCommands = ["name", "image", "bio", "contacts", "experience", "education"];
    homeCommands.forEach((item) => {
      window.terminalUI.handleCommand(item);
    });
  }

  runBlogsSection() {
    const blogsCommands = ['blogs'];
    blogsCommands.forEach(cmd => {
      window.terminalUI.handleCommand(cmd);
    });
  }

  runProjectsSection() {
    const projectsCommands = ['projects'];
    projectsCommands.forEach(cmd => {
      window.terminalUI.handleCommand(cmd);
    });
  }

  runContactsSection() {
    const contactsCommands = ['contacts'];
    contactsCommands.forEach(cmd => {
      window.terminalUI.handleCommand(cmd);
    });
  }

  runTerminalSection() {
    // Clear terminal but don't run any automatic commands
    // This is the interactive terminal where users can type commands
  }

  // Command execution
  executeCommand(input) {
    if (input in this.commands) {
      let response = typeof this.commands[input].content === "function"
        ? this.commands[input].content()
        : this.commands[input].content;

      if (input === "clear" || input === "default") return;
      return response || "";
    } else {
      return null; // Command not found
    }
  }

  // Command history management
  addToHistory(command) {
    if (this.commandHistory.length === 0 || 
        this.commandHistory[this.commandHistory.length - 1] !== command) {
      this.commandHistory.push(command);
      localStorage.setItem("commandHistory", JSON.stringify(this.commandHistory));
      this.historyIndex = this.commandHistory.length;
    }
  }

  getCommandHistory() {
    return this.commandHistory;
  }

  getHistoryCommand(direction) {
    if (direction === 'up' && this.historyIndex > 0) {
      this.historyIndex--;
      return this.commandHistory[this.historyIndex];
    } else if (direction === 'down' && this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      return this.commandHistory[this.historyIndex];
    } else if (direction === 'down' && this.historyIndex === this.commandHistory.length - 1) {
      this.historyIndex = this.commandHistory.length;
      return "";
    }
    return null;
  }

  // Utility functions
  clearTerminal() {
    window.terminalUI.clearOutput();
    window.uiManager.displayIntroduction(window.tmuxManager.currentSection === 'terminal');
  }

  toggleTheme() {
    if (window.uiManager.currentTheme === "dark") {
      document.body.classList.add("light-theme");
      window.uiManager.currentTheme = "light";
      localStorage.setItem("theme", "light");
      return "Switched to Light Theme.";
    } else {
      document.body.classList.remove("light-theme");
      window.uiManager.currentTheme = "dark";
      localStorage.setItem("theme", "dark");
      return "Switched to Dark Theme.";
    }
  }

  resetPreferences() {
    localStorage.clear();
    this.commandHistory = [];
    this.historyIndex = -1;
    location.reload();
  }
}
