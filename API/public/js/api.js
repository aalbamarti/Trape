// js/api.js
export const apiUrl = "http://localhost:3000/tricks";

export async function fetchTricks() {
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch tricks from backend");
  }
  return await response.json();
}
