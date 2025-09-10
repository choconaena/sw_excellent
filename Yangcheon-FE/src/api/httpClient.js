// src/api/httpClient.js
import { API_BASE_URL } from "../config/env";

function getToken() {
  return localStorage.getItem("jwtToken");
}

export async function http(path, { method = "GET", headers = {}, body } = {}) {
  const token = getToken();

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const isBinary =
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof Uint8Array;

  // FormData(또는 바이너리)일 때는 Content-Type 자동 설정 금지
  const finalHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
  if (!isFormData && !isBinary) {
    finalHeaders["Content-Type"] =
      finalHeaders["Content-Type"] || "application/json";
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body:
      isFormData || isBinary
        ? body
        : body != null
        ? JSON.stringify(body)
        : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : null;
}
