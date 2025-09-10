// src/api/auth.js
import { http } from "./httpClient";
import { ENDPOINTS } from "./endpoints";

export function login({ email, password }) {
  return http(ENDPOINTS.login, { method: "POST", body: { email, password } });
}

// Dart의 fetchUserInfo와 동일한 동작: 배열이면 첫 요소 반환
export async function fetchUserInfo() {
  const json = await http(ENDPOINTS.profile, { method: "GET" }); // /db/users
  if (Array.isArray(json) && json.length > 0) return json[0];
  throw new Error("사용자 정보가 존재하지 않습니다.");
}
