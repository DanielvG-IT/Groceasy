import React from "react";

const NotFound: React.FC = () => {
  return (
    <main
      role="main"
      aria-labelledby="notfound-heading"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 20px",
        background:
          "radial-gradient(1200px 600px at 10% 20%, rgba(99,102,241,0.08), transparent 8%), linear-gradient(180deg, #fff 0%, #fbfbfd 100%)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        color: "#0f172a",
      }}>
      <section
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: 980,
          width: "100%",
          gap: 36,
          margin: "0 auto",
          padding: 12,
        }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 12,
            width: "100%",
            maxWidth: 720,
          }}>
          <svg
            width="120"
            height="96"
            viewBox="0 0 120 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden>
            <rect x="8" y="12" width="104" height="72" rx="8" fill="#EEF2FF" />
            <path
              d="M28 36h64"
              stroke="#C7D2FE"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M34 52h12"
              stroke="#C7D2FE"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M58 52h28"
              stroke="#C7D2FE"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="36" cy="36" r="4" fill="#6366F1" />
            <circle cx="54" cy="36" r="4" fill="#34D399" />
          </svg>

          <h1
            id="notfound-heading"
            style={{
              fontSize: 44,
              margin: 0,
              lineHeight: 1.03,
              letterSpacing: "-0.01em",
              color: "#0f172a",
            }}>
            Oops - we couldn't find that page
          </h1>

          <p
            style={{
              marginTop: 12,
              color: "#475569",
              fontSize: 16,
              maxWidth: 560,
            }}>
            The page you're looking for may have been deleted, renamed, or
            moved. Here are some helpful places to get back to the right place.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 22,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
            aria-label="Quick actions">
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                background: "linear-gradient(90deg,#6d28d9,#4f46e5)",
                color: "white",
                textDecoration: "none",
                borderRadius: 10,
                boxShadow: "0 6px 18px rgba(79,70,229,0.18)",
                fontWeight: 600,
              }}>
              ← Go home
            </a>

            <a
              href="/app/lists"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                background: "transparent",
                color: "#4f46e5",
                border: "1px solid rgba(79,70,229,0.14)",
                textDecoration: "none",
                borderRadius: 10,
                fontWeight: 600,
              }}>
              View your lists
            </a>

            <a
              href="/app/lists/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                background: "transparent",
                color: "#0f172a",
                border: "1px solid rgba(15,23,42,0.06)",
                textDecoration: "none",
                borderRadius: 10,
                fontWeight: 600,
              }}>
              Create a new list
            </a>
          </div>

          <p
            style={{
              marginTop: 18,
              color: "#94a3b8",
              fontSize: 13,
            }}>
            Tip: Check the list name or try searching for an item. If this came
            from a shared link, the owner may have removed access.
          </p>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
