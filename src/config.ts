
const API_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_URL) {
  throw new Error("VITE_API_BASE_URL não está definida. Verifique seu .env");
}

export const config = {
  apiBaseUrl: API_URL,
};