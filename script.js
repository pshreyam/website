const inputField = document.getElementById("input");
const outputDiv = document.getElementById("output");
const terminalDiv = document.getElementById("terminal");

let commandHistory = JSON.parse(localStorage.getItem("commandHistory")) || []; // Load command history
let historyIndex = commandHistory.length; // Pointer to track position in command history

// Retrieve theme from localStorage
let currentTheme = localStorage.getItem("theme") || "dark"; // Default to dark theme

const commands = {
  help: {
    content: () => {
      // Dynamically build the help text
      let helpText = "Available commands:\n\n";
      const commandWidth = 20; // Fixed width for commands (adjust as needed)
      for (const [key, { description }] of Object.entries(commands)) {
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
      email =
        "<a href='mailto:pshreyam@gmail.com' class='link'>pshreyam@gmail.com</a>";
      linkedin =
        "<a href='https://www.linkedin.com/in/shreyam-pokharel/' target='_blank' class='link'>shreyam-pokharel</a>";
      github =
        "<a href='https://github.com/pshreyam' target='_blank' class='link'>@pshreyam</a>";
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
    content: "[This is undergoing maintainance. Coming Soon ...]",
    description: "Lists my blogs",
  },
  hobbies: {
    content:
      "- Exploring programming languages and tinkering my operating system\n" +
      "- Singing and participating in various sports",
    description: "Lists my hobbies",
  },
  default: {
    content: runDefaultCommands,
    description:
      "Run all the commands which are run by default upon page initialization",
  },
  history: {
    content: () => {
      return commandHistory.join("\n"); // Return the command history
    },
    description: "Fetches the history of input commands",
  },
  clear: {
    content: () => {
      outputDiv.innerHTML = ""; // Clear the terminal output
      displayIntroduction();
    },
    description: "Clears the terminal output (Ctrl + L does the same)",
  },
  ping: {
    content: "pong",
    description: "Checks if the terminal is active and responds with 'pong'",
  },
  toggle_theme: {
    content: () => {
      // Toggle theme
      if (currentTheme === "dark") {
        document.body.classList.add("light-theme");
        currentTheme = "light"; // Update the current theme
        localStorage.setItem("theme", "light"); // Save to localStorage
        return "Switched to Light Theme.";
      } else {
        document.body.classList.remove("light-theme");
        currentTheme = "dark"; // Update the current theme
        localStorage.setItem("theme", "dark"); // Save to localStorage
        return "Switched to Dark Theme.";
      }
    },
    description: "Switch between light and dark themes",
  },
  reset: {
    content: () => {
      localStorage.clear(); // Clear all localStorage data
      commandHistory = []; // Reset command history array
      historyIndex = -1; // Reset history index
      location.reload();
    },
    description: "Reset the theme preference and command history",
  },
};

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "l") {
    event.preventDefault();
    outputDiv.innerHTML = "";
    displayIntroduction();
  } else if (event.ctrlKey && event.key === "u") {
    // Handle Ctrl + U to clear the input field
    event.preventDefault(); // Prevent default action
    console.log("The custom Ctrl + U action trigerred.");
    const cursorPosition = inputField.selectionStart; // Get cursor position
    const currentValue = inputField.value; // Current input value

    // Set the input value to be the part after the cursor
    inputField.value = currentValue.substring(cursorPosition); // Keep text to the right of cursor

    // Move the cursor to the end of the new input
    inputField.selectionStart = inputField.selectionEnd = 0;
  } else if (event.ctrlKey && event.key === "k") {
    // Handle Ctrl + K to clear the right of the cursor
    event.preventDefault(); // Prevent default action
    console.log("The custom Ctrl + K action trigerred.");
    const cursorPosition = inputField.selectionStart; // Get cursor position
    const currentValue = inputField.value; // Current input value

    // Set the input value to be the part before the cursor
    inputField.value = currentValue.substring(0, cursorPosition); // Keep text before the cursor

    // Move the cursor to the end of the new input
    inputField.selectionStart = inputField.selectionEnd = -1;
  }
});

inputField.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const input = inputField.value.trim();
    if (input) {
      // If the commandHistory is empty or the current command is different to the last command in
      // history, only then push the command to history.
      // This declutters the command history by removing duplicate commands.
      if (
        commandHistory.length === 0 ||
        commandHistory[commandHistory.length - 1] !== input
      ) {
        commandHistory.push(input); // Save the command to history
        localStorage.setItem("commandHistory", JSON.stringify(commandHistory)); // Update localStorage with new command
        historyIndex = commandHistory.length; // Update history index
      }
      inputField.value = ""; // Clear the input field
      handleCommand(input); // Call the function to handle the command
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    // Handle Up Arrow Key
    if (historyIndex > 0) {
      historyIndex--; // Move up in history
      inputField.value = commandHistory[historyIndex]; // Set input to command in history
      inputField.selectionStart = inputField.selectionEnd =
        inputField.value.length;
    }
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    // Handle Down Arrow Key
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++; // Move down in history
      inputField.value = commandHistory[historyIndex]; // Set input to command in history
      inputField.selectionStart = inputField.selectionEnd =
        inputField.value.length;
    } else {
      historyIndex = commandHistory.length; // Reset to the end
      inputField.value = ""; // Clear input if at the end
      inputField.selectionStart = inputField.selectionEnd =
        inputField.value.length;
    }
  }
});

const tips = [
  "Simply type <code>'help'</code> and press <code>Enter</code> to view all the available commands.",
  "You can toggle the theme preference with <code>'toggle_theme'</code> command.",
  "Site preferences can be reset using <code>'reset'</code> command.",
  "Use <code>'default'</code> command in order to fetch the default content loaded on the site on opening first time.",
];
let updatedTipsIndex = 0;

function displayIntroduction() {
  const introMessage = `<strong>Welcome to this terminal interface!</strong> Discover more about me, <b style="font-size: 1.05em;">Shreyam Pokharel</b>.
<div class="tips"><i class="fa-solid fa-circle-info" title="Tip"></i> <span id="tipsMessage">${tips[0]}</span></div>`;

  const output = document.createElement("div");
  output.innerHTML = `<span class="response" id="intro">${introMessage}</span>\n`;
  outputDiv.appendChild(output);
}

function handleCommand(input) {
  const output = document.createElement("div");

  if (input in commands) {
    var response =
      typeof commands[input].content === "function"
        ? commands[input].content()
        : commands[input].content;

    if (input === "clear" || input === "default") return;

    response = response || "";

    output.innerHTML = `<span class="command"><span class="prompt"><i class="fa-solid fa-arrow-right"></i></span>${input}</span>\n<span class="response">${response}</span>\n\n`;
  } else {
    output.innerHTML = `<span class="command"><span class="prompt"><i class="fa-solid fa-arrow-right"></i></span>${input}</span>\n<span class="response warning">Command not found. Type 'help' for available commands.</span>\n\n`;
  }
  outputDiv.appendChild(output);
  terminalDiv.scrollTop = outputDiv.scrollHeight; // auto-scroll to the bottom
}

function runDefaultCommands() {
  let defaultCommands = [
    "name",
    "image",
    "bio",
    "contacts",
    "experience",
    "education",
  ];

  defaultCommands.forEach((item) => {
    // commandHistory.push(item);
    // historyIndex = commandHistory.length;
    handleCommand(item);
  });
}

function changeTips() {
  updatedTipsIndex = (updatedTipsIndex + 1) % tips.length;
  const tipsMessage = document.getElementById("tipsMessage");
  tipsMessage.innerHTML = tips[updatedTipsIndex];
}

/*
The main logic.
*/

// Apply the stored theme immediately
if (currentTheme === "light") {
  document.body.classList.add("light-theme");
}

const lastCommandsRunKey = "lastCommandsRunTime";

// Check if the initial commands (like image command) should run
const lastCommandsRunTime = localStorage.getItem(lastCommandsRunKey);
const currentTime = new Date().getTime();

// Display the introductory message
displayIntroduction(); // Call function to display the introduction

// Automatically run the default commands when the terminal webpage initializes
// Do not run the command upon reloading the website if the command was last run 300000 ms (5 minutes) ago.
if (!lastCommandsRunTime || currentTime - lastCommandsRunTime > 300000) {
  runDefaultCommands();
  localStorage.setItem(lastCommandsRunKey, currentTime); // Update the timestamp
}

// Change the tip every 5 seconds
setInterval(changeTips, 5000);

// Immediately focus on the input prompt after the terminal webpage initializes
inputField.focus();
