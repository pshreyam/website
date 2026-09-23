// Applied synchronously from <head> to prevent a saved preference flashing.
try {
  const theme = localStorage.getItem("theme");
  if (theme === "light" || theme === "dark") {
    document.documentElement.dataset.theme = theme;
  }
} catch (error) {}
