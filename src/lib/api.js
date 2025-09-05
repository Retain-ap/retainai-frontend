// src/lib/api.js

export const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) ||
  "https://retainai-app.onrender.com";

const toURL = (path) => (path.startsWith("http") ? path : API_BASE + path);

async function handle(res) {
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) {
    throw new Error(`Bad JSON from ${res.url}: ${text?.slice(0, 200)}`);
  }
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || res.statusText || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data ?? {};
}

export const getJSON = (path) =>
  fetch(toURL(path), { credentials: "include" }).then(handle);

export const postJSON = (path, body) =>
  fetch(toURL(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  }).then(handle);

export const postForm = (path, formData) =>
  fetch(toURL(path), { method: "POST", credentials: "include", body: formData }).then(handle);

export const getUser = () => getJSON("/api/me");

export default { API_BASE, getJSON, postJSON, postForm, getUser };
