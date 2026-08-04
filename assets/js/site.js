(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  // Mobile nav
  const navToggle = header.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");

  if (navToggle && nav) {
    const setOpen = (open) => {
      if (open) header.setAttribute("data-menu", "open");
      else header.removeAttribute("data-menu");
      navToggle.setAttribute("aria-expanded", String(open));
    };

    navToggle.addEventListener("click", () => {
      setOpen(header.getAttribute("data-menu") !== "open");
    });

    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  // Theme toggle — persists an explicit choice, otherwise follows the OS.
  const themeToggle = header.querySelector("[data-theme-toggle]");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
      const current = document.documentElement.dataset.theme || (prefersDark ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    });
  }

  // Border under the header only once the page has scrolled.
  const setStuck = () => header.setAttribute("data-stuck", String(window.scrollY > 4));
  setStuck();
  addEventListener("scroll", setStuck, { passive: true });
})();
