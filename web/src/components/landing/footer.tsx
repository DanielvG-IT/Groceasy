import React from "react";

const Footer = () => {
  return (
    <footer className="mt-12 border-t">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
        <div>© {new Date().getFullYear()} Groceasy. All rights reserved.</div>
        <div className="flex items-center space-x-4 mt-3 sm:mt-0">
          <a href="/privacy" className="hover:underline">
            Privacy
          </a>
          <a href="/terms" className="hover:underline">
            Terms
          </a>
          <a href="/contact" className="hover:underline">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
