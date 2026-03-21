import axios from "axios";

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  return `${trimmed}/`;
}

const baseURL = process.env.NEXT_PUBLIC_API_URL
  ? normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL)
  : "http://localhost:8080/";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
