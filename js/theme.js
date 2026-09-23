document.addEventListener("DOMContentLoaded", () => {
  const toggles = document.querySelectorAll(".theme-toggle");
  
  if (toggles.length > 0) {
    toggles.forEach(toggle => {
      toggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
      });
    });
  }
});
