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
  window.location.replace(appPageUrl("login", { searchParams: { loggedOut: "1" } }));
}

function requireAuth() {
  if (isAuthenticated()) return;

  const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(appPageUrl("login", { searchParams: { redirect: returnPath } }));
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

  window.location.replace(appPageUrl("home"));
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
  const resultPath = getAppRoute("result");

  if (pathOrHash.startsWith("#")) {
    return `${resultPath}${pathOrHash}`;
  }

  const hashIndex = pathOrHash.indexOf("#");
  if (hashIndex !== -1) {
    return `${resultPath}${pathOrHash.slice(hashIndex)}`;
  }

  return resultPath;
}

function redirectResultHashToPublicPage() {
  if (!isResultHash(window.location.hash)) return false;
  window.location.replace(`${getAppRoute("result")}${window.location.hash}`);
  return true;
}
