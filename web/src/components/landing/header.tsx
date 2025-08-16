import React from "react";

const Header = () => {
  return (
    <header className="antialiased bg-white/60 backdrop-blur-sm border-b">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-bold">Groceasy</span>
          <span className="text-sm text-gray-500">
            Simplify grocery shopping
          </span>
        </div>
        <nav className="flex items-center space-x-4 text-sm">
          <a href="/" className="hover:underline">
            Home
          </a>
          <a href="/features" className="hover:underline">
            Features
          </a>
          <a href="/about" className="hover:underline">
            About
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
