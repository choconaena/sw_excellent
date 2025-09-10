import { login, fetchUserInfo } from "../api/auth";
import { useAuthStore } from "../store/authStore";

function normalizeUser(u) {
  return {
    userId: u.user_id,
    name: u.name,
    email: u.email,
    phoneNumber: u.phone_number,
    birthdate: u.birthdate,
    gender: u.gender,
    permission: u.permission,
  };
}

export async function loginAndFetchProfile({ email, password }) {
  const res = await login({ email, password }); // { status, token, msg, ... }
  if (!res?.status || !res?.token) throw new Error(res?.msg || "로그인 실패");

  localStorage.setItem("jwtToken", res.token);
  localStorage.setItem("loginStatus", "true");

  const rawUser = await fetchUserInfo(); // /db/users → [ { ... } ]
  const user = normalizeUser(rawUser);

  if (user.userId != null) {
    localStorage.setItem("userId", String(user.userId));
  }

  // 전역 스토어 갱신
  const { login: storeLogin } = useAuthStore.getState();
  if (storeLogin) storeLogin(user, res.token);

  return {
    success: true,
    message: res.msg || "로그인 성공",
    token: res.token,
    user,
  };
}

export async function autoLogin() {
  const loginStatus = localStorage.getItem("loginStatus") === "true";
  const token = localStorage.getItem("jwtToken");
  if (!loginStatus || !token) {
    return {
      success: false,
      message: "자동 로그인 불가",
      shouldRedirectToLogin: true,
    };
  }

  try {
    const rawUser = await fetchUserInfo();
    const user = normalizeUser(rawUser);

    // 전역 스토어 갱신
    const { login: storeLogin } = useAuthStore.getState();
    if (storeLogin) storeLogin(user, token);

    return { success: true, user };
  } catch {
    clearAuthStorage();
    const { logout: storeLogout } = useAuthStore.getState();
    if (storeLogout) storeLogout();
    return {
      success: false,
      message: "프로필 조회 실패",
      shouldRedirectToLogin: true,
    };
  }
}

export function clearAuthStorage() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("loginStatus");
  localStorage.removeItem("userId");
}

export function logout() {
  clearAuthStorage();
  const { logout: storeLogout } = useAuthStore.getState();
  if (storeLogout) storeLogout();
}

export function getStoredToken() {
  return localStorage.getItem("jwtToken");
}

export function isAuthenticated() {
  const { loginStatus } = useAuthStore.getState();
  return loginStatus && !!getStoredToken();
}
