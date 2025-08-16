import React from "react";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1 style={{ fontSize: "3rem", color: "#ff6b6b" }}>404</h1>
      <p style={{ fontSize: "1.5rem", color: "#555" }}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        style={{
          textDecoration: "none",
          color: "#4caf50",
          fontSize: "1.2rem",
        }}>
        Go back to Home
      </a>
    </div>
  );
};

export default NotFound;
