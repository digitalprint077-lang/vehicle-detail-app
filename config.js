window.APP_CONFIG = {
  // Change these before hosting (client-side login for static sites)
  auth: {
    username: "admin",
    password: "admin123",
  },
  // Saved permits/fitness sync to Netlify (see netlify/functions/permits.js).
  // Netlify env: PERMIT_STORE_SECRET = long random string (not your login password).
  // Injected at build into storage-secret.js — do not commit the real secret here.
  storage: {
    remote: true,
    apiPath: "/.netlify/functions/permits",
    apiSecret: "",
  },
  routes: {
    home: "/",
    login: "/login",
    result: "/result",
    fitness: "/fitness",
  },
  routeFiles: {
    home: "/",
    login: "/login.html",
    result: "/result.html",
    fitness: "/fitness.html",
  },
};

function getAppRoute(name) {
  return window.APP_CONFIG?.routes?.[name] || `/${name}`;
}

function getAppRouteFile(name) {
  return window.APP_CONFIG?.routeFiles?.[name] || getAppRoute(name);
}

function appPageUrl(path, options = {}) {
  const target = path.startsWith("/")
    ? path
    : getAppRouteFile(path);
  const url = new URL(target, window.location.origin);

  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  if (options.hash) {
    url.hash = options.hash.startsWith("#") ? options.hash.slice(1) : options.hash;
  }

  return url.href;
}

function appPublicUrl(path, options = {}) {
  const target = path.startsWith("/")
    ? path
    : getAppRoute(path);
  const url = new URL(target, window.location.origin);

  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  if (options.hash) {
    url.hash = options.hash.startsWith("#") ? options.hash.slice(1) : options.hash;
  }

  return url.href;
}
