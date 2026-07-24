(function redirectLegacyHtmlUrls() {
  const path = window.location.pathname;
  const pageMatch = path.match(/\/([^/]+)\.html$/);
  if (pageMatch && pageMatch[1] !== "index") {
    window.location.replace(`/${pageMatch[1]}${window.location.search}${window.location.hash}`);
    return;
  }

  if (path.endsWith("/index.html")) {
    const cleanPath = path.slice(0, -"/index.html".length) || "/";
    window.location.replace(`${cleanPath}${window.location.search}${window.location.hash}`);
  }
})();
