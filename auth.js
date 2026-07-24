const AUTH_SESSION_KEY = "vehicleDetailAuth";
const AUTH_PASSWORD_KEY = "vehicleDetailPassword";

function getAuthConfig() {
  return window.APP_CONFIG?.auth || {};
}

function getConfiguredUsername() {
  return getAuthConfig().username || "admin";
}

function getConfiguredPassword() {
  return getAuthConfig().password || "admin123";
}

function getActivePassword() {
  try {
    const stored = localStorage.getItem(AUTH_PASSWORD_KEY);
    if (typeof stored === "string" && stored.length > 0) {
      return stored;
    }
  } catch (error) {
    // ignore storage errors
  }
  return getConfiguredPassword();
}

function setActivePassword(password) {
  localStorage.setItem(AUTH_PASSWORD_KEY, password);
}

function isAuthenticated() {
  try {
    return localStorage.getItem(AUTH_SESSION_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function login(username, password) {
  const validUser = getConfiguredUsername();
  const validPass = getActivePassword();

  if (username === validUser && password === validPass) {
    try {
      localStorage.setItem(AUTH_SESSION_KEY, "true");
    } catch (error) {
      return false;
    }
    return true;
  }

  return false;
}

function changePassword(currentPassword, newPassword) {
  if (!isAuthenticated()) {
    return { ok: false, message: "You must be logged in to change the password." };
  }

  if (!currentPassword || !newPassword) {
    return { ok: false, message: "Fill in all password fields." };
  }

  if (currentPassword !== getActivePassword()) {
    return { ok: false, message: "Current password is incorrect." };
  }

  if (newPassword.length < 6) {
    return { ok: false, message: "New password must be at least 6 characters." };
  }

  if (newPassword === currentPassword) {
    return { ok: false, message: "New password must be different from the current password." };
  }

  try {
    setActivePassword(newPassword);
  } catch (error) {
    return { ok: false, message: "Could not save the new password in this browser." };
  }

  return { ok: true, message: "Password updated. Use the new password next time you log in." };
}

function logout() {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch (error) {
    // ignore storage errors
  }
}

function logoutAndRedirect() {
  logout();
  const loginUrl = new URL("login.html", window.location.href);
  loginUrl.searchParams.set("loggedOut", "1");
  window.location.replace(loginUrl.href);
}

function requireAuth() {
  if (isAuthenticated()) return;

  const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const loginUrl = new URL("login.html", window.location.href);
  loginUrl.searchParams.set("redirect", returnPath);
  window.location.replace(loginUrl.href);
}

function redirectAfterLogin() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");

  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    const target = decodeURIComponent(redirect);
    if (isResultPath(target)) {
      window.location.replace(toResultPageUrl(target));
      return;
    }
    window.location.replace(target);
    return;
  }

  window.location.replace(new URL("index.html", window.location.href).href);
}

function isResultHash(hash) {
  const value = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!value) return false;
  const params = new URLSearchParams(value);
  return params.has("registration") || params.has("chassis") || params.has("engine");
}

function isResultPath(path) {
  return isResultHash(path) || /[#?].*(registration|chassis|engine)=/i.test(path);
}

function toResultPageUrl(pathOrHash) {
  if (pathOrHash.startsWith("#")) {
    return `result.html${pathOrHash}`;
  }

  const hashIndex = pathOrHash.indexOf("#");
  if (hashIndex !== -1) {
    return `result.html${pathOrHash.slice(hashIndex)}`;
  }

  return "result.html";
}

function redirectResultHashToPublicPage() {
  if (!isResultHash(window.location.hash)) return false;
  window.location.replace(`result.html${window.location.hash}`);
  return true;
}
