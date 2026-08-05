import axios from "axios";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});