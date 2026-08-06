// src/components/Header.jsx
import React from "react";

function Header({ theme, toggleTheme }) {
  return (
    <header className="header card container">
      <h1 className="app-title" style={{ margin: 0, fontFamily: "'Roboto', sans-serif" }}>
        Expense Tracker Live
      </h1>
      <button
        className="button"
        onClick={toggleTheme}
        aria-label="Toggle light/dark theme"
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </header>
  );
}

export default Header;
