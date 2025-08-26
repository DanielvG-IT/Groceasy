"use client";

import React, { useState } from "react";
import {
  getAccessToken,
  setAccessToken,
  refreshAccessToken,
  backendFetch,
  deleteAccessToken,
} from "@/lib/fetcher";

const TestPage = () => {
  const [accessToken, setAccessTokenInput] = useState("");
  const [output, setOutput] = useState("");

  const pushOutput = (entry: string) => {
    setOutput((prev) => (prev ? `${prev}\n${entry}` : entry));
  };

  const handleSetTokens = async () => {
    try {
      pushOutput("$ set-tokens");
      pushOutput("> Setting tokens...");
      // example expiries: access 1 hour, refresh 7 days
      const accessExpiry = new Date(Date.now() + 60 * 60 * 1000);

      await setAccessToken(accessToken, accessExpiry);
      pushOutput("> Tokens set (cookies).");
    } catch (err) {
      pushOutput(`! Error setting tokens: ${String(err)}`);
    }
  };

  const handleGetTokens = async () => {
    try {
      pushOutput("$ get-tokens");
      const a = await getAccessToken();
      setAccessTokenInput(a ?? "");
      pushOutput(`> Access Token: ${a ?? "<none>"}`);
    } catch (err) {
      pushOutput(`! Error getting tokens: ${String(err)}`);
    }
  };

  const handleClearTokens = async () => {
    try {
      pushOutput("$ clear-tokens");
      await deleteAccessToken();
      pushOutput("> Tokens cleared.");
    } catch (err) {
      pushOutput(`! Error clearing tokens: ${String(err)}`);
    }
  };

  const handleRefreshAccessToken = async () => {
    try {
      pushOutput("$ refresh-access-token");
      pushOutput("> Refreshing access token...");
      await refreshAccessToken();
      const a = await getAccessToken();
      pushOutput(`> New Access Token: ${a ?? "<none>"}`);
    } catch (err) {
      pushOutput(`! Error refreshing token: ${String(err)}`);
    }
  };

  const handleBackendFetch = async () => {
    try {
      pushOutput("$ backend-fetch /household");
      pushOutput("> Calling backend...");
      const res = await backendFetch("/household", { method: "GET" });
      const text = await res.data;
      pushOutput(`> Status: ${res.status}`);
      pushOutput(text ? `\n${text}` : "> <no body>");
    } catch (err) {
      pushOutput(`! Backend fetch error: ${String(err)}`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Tokens</h1>

      <div style={{ marginBottom: "10px", maxWidth: 1000 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ minWidth: 120 }}>Access Token:</span>
          <input
            type="text"
            value={accessToken}
            onChange={(e) => setAccessTokenInput(e.target.value)}
            style={{
              flex: 1,
              minWidth: 500,
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
            }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {(() => {
          const base: React.CSSProperties = {
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(16,24,40,0.08)",
            transition:
              "transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease",
            fontWeight: 600,
            fontSize: 14,
          };

          const styles = {
            primary: {
              ...base,
              background: "linear-gradient(90deg,#667eea,#764ba2)",
            } as React.CSSProperties,
            success: {
              ...base,
              background: "linear-gradient(90deg,#06b6d4,#0891b2)",
            } as React.CSSProperties,
            warn: {
              ...base,
              background: "linear-gradient(90deg,#f59e0b,#d97706)",
            } as React.CSSProperties,
            danger: {
              ...base,
              background: "linear-gradient(90deg,#ef4444,#dc2626)",
            } as React.CSSProperties,
            neutral: {
              ...base,
              background: "#fff",
              color: "#111827",
              boxShadow:
                "inset 0 0 0 1px rgba(15,23,42,0.06), 0 2px 6px rgba(16,24,40,0.04)",
            } as React.CSSProperties,
          };

          return (
            <>
              <button
                type="button"
                style={styles.primary}
                onClick={handleSetTokens}
                title="Set access & refresh tokens as cookies">
                ⚙️ Set Tokens
              </button>

              <button
                type="button"
                style={styles.neutral}
                onClick={handleGetTokens}
                title="Read tokens from cookies">
                🔍 Get Tokens
              </button>

              <button
                type="button"
                style={styles.danger}
                onClick={handleClearTokens}
                title="Remove tokens (clear cookies)">
                🧹 Clear Tokens
              </button>

              <button
                type="button"
                style={styles.warn}
                onClick={handleRefreshAccessToken}
                title="Refresh the access token using the refresh token">
                🔁 Refresh Access Token
              </button>

              <button
                type="button"
                style={styles.success}
                onClick={handleBackendFetch}
                title='Call backendFetch("/protected")'>
                🌐 Call /protected
              </button>
            </>
          );
        })()}
      </div>

      {output && (
        <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
          <h2>Output:</h2>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
};

export default TestPage;
