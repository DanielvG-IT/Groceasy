"use client";

import React from "react";

const IntroScreen: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f5f5f5",
      }}>
      <h1>Welcome to Groceasy</h1>
      <p>Your one-stop solution for easy grocery shopping!</p>
      <button
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#0078D4",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "20px",
        }}
        onClick={() => alert("Let’s get started!")}>
        Get Started
      </button>
    </div>
  );
};

export default IntroScreen;
