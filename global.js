// global.js
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = `theme-${savedTheme}`;
    }

    // Listen for theme changes
    window.addEventListener('themeChanged', (event) => {
        document.body.className = `theme-${event.detail}`;
    });
});
