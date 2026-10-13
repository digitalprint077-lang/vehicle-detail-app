(function initRemoteStorageModule() {
  function getStorageConfig() {
    return window.APP_CONFIG?.storage || {};
  }

  function isEnabled() {
    const config = getStorageConfig();
    return config.remote !== false && Boolean(config.apiPath);
  }

  function getApiUrl() {
    return getStorageConfig().apiPath || "/.netlify/functions/permits";
  }

  function getPassword() {
    if (typeof getActivePassword === "function") {
      return getActivePassword();
    }
    return getStorageConfig().password || "";
  }

  async function apiRequest(method, body) {
    const response = await fetch(getApiUrl(), {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Password": getPassword(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return response;
  }

  function readLocalJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  let syncTimer = null;
  let lastSyncError = null;

  function getLastSyncError() {
    return lastSyncError;
  }

  async function pushLocalToServer() {
    if (!isEnabled()) return false;

    const permits = readLocalJson("vehicleDetailSavedPermits", []);
    const fitness = readLocalJson("vehicleDetailSavedFitness", []);

    const response = await apiRequest("PUT", { permits, fitness });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Sync failed (${response.status}): ${detail}`);
    }

    lastSyncError = null;
    return true;
  }

  function scheduleSync() {
    if (!isEnabled()) return;

    clearTimeout(syncTimer);
    syncTimer = window.setTimeout(async () => {
      try {
        await pushLocalToServer();
      } catch (error) {
        lastSyncError = error;
        console.error("Could not sync saved records to Netlify:", error);
      }
    }, 500);
  }

  async function hydrate() {
    if (!isEnabled()) {
      return { ok: false, reason: "disabled" };
    }

    try {
      const response = await apiRequest("GET");
      if (response.status === 401) {
        lastSyncError = new Error("Server rejected the admin password.");
        return { ok: false, reason: "auth" };
      }
      if (response.status === 503) {
        lastSyncError = new Error("Netlify ADMIN_PASSWORD is not configured.");
        return { ok: false, reason: "config" };
      }
      if (!response.ok) {
        lastSyncError = new Error(`Server returned ${response.status}`);
        return { ok: false, reason: "http" };
      }

      const data = await response.json();
      const remotePermits = Array.isArray(data.permits) ? data.permits : [];
      const remoteFitness = Array.isArray(data.fitness) ? data.fitness : [];
      const localPermits = readLocalJson("vehicleDetailSavedPermits", []);
      const localFitness = readLocalJson("vehicleDetailSavedFitness", []);

      const remoteEmpty = remotePermits.length === 0 && remoteFitness.length === 0;
      const localHasData = localPermits.length > 0 || localFitness.length > 0;

      if (remoteEmpty && localHasData) {
        localStorage.setItem("vehicleDetailSavedPermits", JSON.stringify(localPermits));
        localStorage.setItem("vehicleDetailSavedFitness", JSON.stringify(localFitness));
        await pushLocalToServer();
      } else {
        localStorage.setItem("vehicleDetailSavedPermits", JSON.stringify(remotePermits));
        localStorage.setItem("vehicleDetailSavedFitness", JSON.stringify(remoteFitness));
      }

      lastSyncError = null;
      return { ok: true };
    } catch (error) {
      lastSyncError = error;
      console.warn("Remote storage unavailable; using browser cache only.", error);
      return { ok: false, reason: "network" };
    }
  }

  window.RemoteStorage = {
    isEnabled,
    hydrate,
    scheduleSync,
    getLastSyncError,
  };
})();
