(function () {
  var root = document.documentElement;
  var btn = document.getElementById("theme-toggle");

  if (!btn) return;

  function setButtonLabel() {
    btn.textContent = root.classList.contains("dark-theme") ? "Light" : "Dark";
  }

  function setTheme(theme) {
    if (theme === "dark") {
      root.classList.add("dark-theme");
    } else {
      root.classList.remove("dark-theme");
    }
    localStorage.setItem("theme", theme);
    setButtonLabel();
  }

  btn.addEventListener("click", function () {
    var nextTheme = root.classList.contains("dark-theme") ? "light" : "dark";
    setTheme(nextTheme);
  });

  setButtonLabel();
})();
