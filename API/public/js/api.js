// js/api.js
import { getToken } from "./auth.js";

export const apiUrl = "http://localhost:3000/tricks";

export async function fetchTricks() {
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch tricks from backend");
  }
  return await response.json();
}

export async function updateProgress(trick_id, status) {
  const token = getToken(); // your existing function

  const res = await fetch("http://localhost:3000/progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({trick_id, status })
  });

    if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error updating progress");
  }
  return await res.json();
}

const API_BASE = "http://localhost:3000";

// fetch all progress for the current user
export async function fetchProgress() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/progress`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {})
    }
  });
  if (!res.ok) {
    // return empty map if unauthorized or no data
    return {};
  }
  const rows = await res.json(); // array of { id, user_id, trick_id, status, updated_at }
  // convert to a map: { [trick_id]: status }
  const map = {};
  rows.forEach(r => { map[r.trick_id] = r.status; });
  return map;
}
