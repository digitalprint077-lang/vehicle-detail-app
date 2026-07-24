(function cleanLegacyHtmlUrls() {
  const cleanMap = {
    "/index.html": "/",
    "/login.html": "/login",
    "/result.html": "/result",
    "/fitness.html": "/fitness",
  };

  const cleanPath = cleanMap[window.location.pathname];
  if (!cleanPath) return;

  const nextUrl = `${cleanPath}${window.location.search}${window.location.hash}`;
  history.replaceState(null, "", nextUrl);
})();
