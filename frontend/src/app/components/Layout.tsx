"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function Layout({ title, children }: LayoutProps) {
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
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleDarkMode}
          className="btn btn-gray"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>
      <div className="w-full max-w-3xl mt-6">{children}</div>
    </div>
  );
}
