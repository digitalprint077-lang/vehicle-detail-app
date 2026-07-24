const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

const loginParams = new URLSearchParams(window.location.search);
const loginRedirect = loginParams.get("redirect");
if (loginRedirect && isResultPath(loginRedirect)) {
  window.location.replace(toResultPageUrl(loginRedirect));
}

if (isAuthenticated() && loginParams.get("loggedOut") !== "1") {
  redirectAfterLogin();
}
loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  loginError.classList.add("hidden");

  const data = new FormData(loginForm);
  const username = data.get("username");
  const password = data.get("password");

  if (login(username, password)) {
    redirectAfterLogin();
    return;
  }

  loginError.classList.remove("hidden");
});

const passwordInput = document.getElementById("password");
const passwordToggleBtn = document.getElementById("password-toggle-btn");

passwordToggleBtn?.addEventListener("click", () => {
  if (!passwordInput) return;
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  passwordToggleBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  const icon = passwordToggleBtn.querySelector("[data-icon]");
  if (icon) {
    icon.setAttribute("data-icon", isHidden ? "eye-off" : "eye");
    window.PanelIcons?.init?.(passwordToggleBtn);
  }
});
