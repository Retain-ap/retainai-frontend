// src/components/Login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import defaultAvatar from "../assets/default-avatar.png";

// ---- Config ----
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://retainai-app.onrender.com";

const BG = {
  page: "#0B0C0E",
  card: "#15171B",
  line: "#24262B",
  gold: "#F5D87E",
  goldDeep: "#D7BB66",
  text60: "rgba(255,255,255,.60)",
  text80: "rgba(255,255,255,.80)",
};

const SUPPORT_EMAIL = "owner@retainai.ca";

// Small input
function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  onKeyDown,
  rightEl,
  autoComplete,
}) {
  return (
    <div style={{ position: "relative" }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          padding: "12px 14px",
          paddingRight: rightEl ? 54 : 14,
          borderRadius: 12,
          border: `1px solid ${BG.line}`,
          background: "#0E1013",
          color: "#fff",
          outline: "none",
          fontSize: 16,
        }}
      />
      {rightEl ? (
        <div
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {rightEl}
        </div>
      ) : null}
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Prefill remembered email
  useEffect(() => {
    const saved = localStorage.getItem("rememberEmail");
    if (saved) setEmail(saved);
    const savedFlag = localStorage.getItem("rememberFlag");
    if (savedFlag) setRemember(savedFlag === "1");
  }, []);

  // Helpers
  const setUserEmailCookie = (value) => {
    try {
      // 1-year cookie on the frontend domain
      document.cookie = `user_email=${encodeURIComponent(
        value || ""
      )}; Path=/; Max-Age=31536000; SameSite=None; Secure`;
    } catch {}
  };

  // Forgot password -> open email to support with prefilled body
  const handleForgot = () => {
    const subject = encodeURIComponent("Password reset request — RetainAI");
    const body = encodeURIComponent(
      `Hi RetainAI,\n\nPlease reset my password.\n\nAccount email: ${
        email || "<enter your email>"
      }\n\nThanks!`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  // Start Google OAuth via backend (no @react-oauth/google to avoid origin_mismatch)
  const beginGoogle = async () => {
    setError("");
    if (!email) {
      setError("Enter your email above before continuing with Google.");
      return;
    }
    setSubmitting(true);
    try {
      // Remember & cookie right away (helps your flows)
      if (remember) {
        localStorage.setItem("rememberEmail", email);
        localStorage.setItem("rememberFlag", "1");
      }
      setUserEmailCookie(email);

      const url = `${API_BASE}/api/google/auth-url?user_email=${encodeURIComponent(
        email
      )}`;
      const r = await fetch(url, { credentials: "include" });
      const data = await r.json();
      if (!r.ok || !data?.url) {
        throw new Error(data?.error || "Could not start Google login.");
      }
      // Redirect user to Google's consent screen
      window.location.href = data.url;
    } catch (e) {
      setError(e.message || "Google login error.");
      setSubmitting(false);
    }
  };

  // Email/password login
  async function handleLogin(e) {
    e.preventDefault();
    if (submitting) return;
    setError("");
    if (!email || !password) {
      setError("All fields required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // accept/set any cookies from server
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Login failed.");
        setSubmitting(false);
        return;
      }

      // Persist basic user info locally for UI
      localStorage.setItem(
        "user",
        JSON.stringify({
          email,
          businessType: data.user?.businessType,
          name: data.user?.name,
          logo: data.user?.logo || defaultAvatar,
        })
      );
      localStorage.setItem("userEmail", email);

      if (remember) {
        localStorage.setItem("rememberEmail", email);
        localStorage.setItem("rememberFlag", "1");
      } else {
        localStorage.removeItem("rememberEmail");
        localStorage.setItem("rememberFlag", "0");
      }

      setUserEmailCookie(email);
      navigate("/app");
    } catch {
      setError("Login error.");
      setSubmitting(false);
    }
  }

  const onEnter = (e, fn) => e.key === "Enter" && fn(e);

  // ---------- UI ----------
  return (
    <div style={{ minHeight: "100vh", background: BG.page, color: "#fff" }}>
      {/* gold glows */}
      <div
        aria-hidden
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
      >
        <div
          style={{
            position: "absolute",
            top: -240,
            right: -200,
            width: 900,
            height: 900,
            borderRadius: "9999px",
            filter: "blur(140px)",
            opacity: 0.2,
            background: BG.gold,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "70vw",
            height: "60vh",
            borderRadius: "9999px",
            filter: "blur(120px)",
            opacity: 0.1,
            background: `linear-gradient(90deg, ${BG.gold}, transparent)`,
          }}
        />
      </div>

      {/* top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          background: "#0C0D10",
          borderBottom: `1px solid ${BG.line}`,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={logo}
              alt="RetainAI"
              style={{ width: 28, height: 28, borderRadius: 6 }}
            />
            <span
              style={{
                color: BG.gold,
                fontWeight: 900,
                letterSpacing: 0.2,
              }}
            >
              RetainAI
            </span>
          </div>
          <div style={{ fontSize: 13, color: BG.text60 }}>
            New here?{" "}
            <Link
              to="/signup"
              style={{ color: BG.goldDeep, textDecoration: "underline" }}
            >
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1120,
          margin: "0 auto",
          padding: "64px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 460px",
          gap: 24,
        }}
      >
        {/* left brand card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 24,
            border: `1px solid ${BG.line}`,
            background:
              "radial-gradient(1200px 800px at -10% 100%, rgba(245,216,126,.12), transparent 60%), #101216",
            minHeight: 520,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img
              src={logo}
              alt="RetainAI"
              style={{
                width: 84,
                height: 84,
                borderRadius: 18,
                background: "#111",
                objectFit: "cover",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  letterSpacing: 0.4,
                  color: BG.gold,
                }}
              >
                RetainAI
              </div>
              <div style={{ color: BG.text80, marginTop: 6, fontSize: 16 }}>
                Client relationships. Done right.
              </div>
            </div>
          </div>
        </div>

        {/* right login card */}
        <div
          style={{
            borderRadius: 24,
            border: `1px solid ${BG.line}`,
            background: BG.card,
            padding: 28,
            minHeight: 520,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              color: BG.gold,
              fontWeight: 800,
              fontSize: 28,
              marginBottom: 12,
            }}
          >
            Welcome back
          </h2>

          <form onSubmit={handleLogin}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => onEnter(e, handleLogin)}
                placeholder="Email"
                autoComplete="username"
              />
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => onEnter(e, handleLogin)}
                placeholder="Password"
                autoComplete="current-password"
                rightEl={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={{
                      fontSize: 12,
                      color: BG.text60,
                      background: "transparent",
                      border: 0,
                      cursor: "pointer",
                    }}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                }
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 2,
                }}
              >
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: BG.text80,
                    fontSize: 14,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={{ accentColor: BG.gold }}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={handleForgot}
                  style={{
                    color: BG.goldDeep,
                    fontSize: 14,
                    textDecoration: "underline",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div
                  style={{
                    background: "#1a1306",
                    border: "1px solid #6b4e00",
                    color: BG.gold,
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 14,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !email || !password}
                style={{
                  background: BG.gold,
                  color: "#0B0B0C",
                  fontWeight: 800,
                  border: 0,
                  borderRadius: 12,
                  padding: "12px 0",
                  fontSize: 16,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting || !email || !password ? 0.7 : 1,
                }}
              >
                {submitting ? "Signing in…" : "Login"}
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: BG.text60,
                  fontWeight: 700,
                  fontSize: 14,
                  margin: "6px 0",
                }}
              >
                <div style={{ flex: 1, borderBottom: `1px solid ${BG.line}` }} />
                <span>or</span>
                <div style={{ flex: 1, borderBottom: `1px solid ${BG.line}` }} />
              </div>

              {/* Google via backend redirect */}
              <button
                type="button"
                onClick={beginGoogle}
                disabled={submitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  width: "100%",
                  borderRadius: 999,
                  border: `1px solid ${BG.line}`,
                  background: "#0E1013",
                  color: "#fff",
                  padding: "12px 0",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                  fontWeight: 700,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: "inline-block",
                    width: 18,
                    height: 18,
                    borderRadius: 3,
                    background:
                      "conic-gradient(from 45deg, #DB4437 0 25%, #F4B400 25% 50%, #0F9D58 50% 75%, #4285F4 75% 100%)",
                  }}
                />
                {submitting ? "Starting Google…" : "Sign in with Google"}
              </button>

              <div
                style={{
                  marginTop: 8,
                  textAlign: "center",
                  color: BG.text60,
                  fontSize: 12,
                }}
              >
                We’ll never post or share without permission.
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
