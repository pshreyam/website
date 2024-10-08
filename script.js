const inputField = document.getElementById("input");
const outputDiv = document.getElementById("output");

let commandHistory = JSON.parse(localStorage.getItem("commandHistory")) || []; // Load command history
let historyIndex = commandHistory.length; // Pointer to track position in command history

// Retrieve theme from localStorage
let currentTheme = localStorage.getItem("theme") || "dark"; // Default to dark theme

const commands = {
  help: {
    content: () => {
      // Dynamically build the help text
      let helpText = "Available commands:\n\n";
      for (const [key, { description }] of Object.entries(commands)) {
        helpText += `- ${key}: ${description}\n`; // Use the description from the command
      }
      return helpText;
    },
    description: "Displays a list of available commands",
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
    content: "[This is undergoing maintainance. Coming Soon ...]",
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
  history: {
    content: () => {
      return commandHistory.join("\n"); // Return the command history
    },
    description: "Fetches the history of input commands",
  },
  clear: {
    content: () => {
      outputDiv.innerHTML = ""; // Clear the terminal output
    },
    description: "Clears the terminal output (Ctrl + L does the same)",
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
    description: "Reset the site preferences (theme and history)",
  },
};

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "l") {
    event.preventDefault();
    outputDiv.innerHTML = "";
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
      commandHistory.push(input); // Save the command to history
      localStorage.setItem("commandHistory", JSON.stringify(commandHistory)); // Update localStorage with new command
      historyIndex = commandHistory.length; // Update history index
      inputField.value = ""; // Clear the input field
      handleCommand(input); // Call the function to handle the command
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    // Handle Up Arrow Key
    if (historyIndex > 0) {
      historyIndex--; // Move up in history
      inputField.value = commandHistory[historyIndex]; // Set input to command in history
      console.log("Up arrow action executed");
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

function displayIntroduction() {
  const introMessage =
    "Welcome to this terminal interface, where you can discover more about me, <b>Shreyam Pokharel</b>.\n" +
    "If you're unfamiliar with terminal usage, simply type 'help' and press Enter to view all available commands.\n" +
    "<i>Tip: You can also toggle the theme with the 'toggle_theme' command and reset the site settings using `reset` command.!</i><hr>";

  const output = document.createElement("div");
  output.innerHTML = `<span class="response">${introMessage}</span>\n`;
  outputDiv.appendChild(output);
}

function handleCommand(input) {
  const output = document.createElement("div");

  if (input in commands) {
    var response =
      typeof commands[input].content === "function"
        ? commands[input].content()
        : commands[input].content;

    if (input === "clear") return;

    response = response || "";

    output.innerHTML = `<span class="command">> ${input}</span>\n<span class="response">${response}</span>\n\n`;
  } else {
    output.innerHTML = `<span class="command">> ${input}</span>\n<span class="response warning">Command not found. Type 'help' for available commands.</span>\n\n`;
  }
  outputDiv.appendChild(output);
  outputDiv.scrollTop = outputDiv.scrollHeight; // auto-scroll to the bottom
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

if (!lastCommandsRunTime || currentTime - lastCommandsRunTime > 300000) {
  // 300000 ms = 5 minutes
  // Automatically run the basic commands when the terminal initializes
  ["image", "bio", "contacts", "experience", "education"].forEach((item) => {
    // commandHistory.push(item);
    // historyIndex = commandHistory.length;
    handleCommand(item);
  });
  localStorage.setItem(lastCommandsRunKey, currentTime); // Update the timestamp
}

inputField.focus();
