"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    document.documentElement.classList.toggle("dark", newMode);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 p-6">
      {/* Dark Mode Button oben rechts */}
      <div className="absolute top-4 right-4">
        <button onClick={toggleDarkMode} className="btn btn-gray">
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-10 text-center">Dashboard</h1>

      {/* Buttons für Navigation */}
      <div className="flex flex-col sm:flex-row gap-6">
        <Link href="/manage" className="btn btn-blue text-lg px-6 py-3">Personen verwalten</Link>
        <Link href="/edit" className="btn btn-green text-lg px-6 py-3">Personen bearbeiten</Link>
      </div>
    </div>
  );
}
