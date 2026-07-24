window.APP_CONFIG = {
  // Change these before hosting (client-side login for static sites)
  auth: {
    username: "admin",
    password: "admin123",
  },
  routes: {
    home: "/",
    login: "/login",
    result: "/result",
    fitness: "/fitness",
  },
};

function getAppRoute(name) {
  return window.APP_CONFIG?.routes?.[name] || `/${name}`;
}

function appPageUrl(path, options = {}) {
  const target = path.startsWith("/") ? path : getAppRoute(path);
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