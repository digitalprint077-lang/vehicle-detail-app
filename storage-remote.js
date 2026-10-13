(function initRemoteStorageModule() {
  function getStorageConfig() {
    return window.APP_CONFIG?.storage || {};
  }

  function getStorageSecret() {
    const fromBuild = window.__PERMIT_STORE_SECRET__;
    if (typeof fromBuild === "string" && fromBuild.length > 0) {
      return fromBuild;
    }
    const fromConfig = getStorageConfig().apiSecret;
    if (typeof fromConfig === "string" && fromConfig.length > 0) {
      return fromConfig;
    }
    return "";
  }

  function getDisableReason() {
    const config = getStorageConfig();
    if (config.remote === false) {
      return "disabled";
    }
    if (!config.apiPath) {
      return "no-api";
    }
    if (!getStorageSecret()) {
      return "no-secret";
    }
    return null;
  }

  function isEnabled() {
    return getDisableReason() === null;
  }

  function getApiUrl() {
    return getStorageConfig().apiPath || "/.netlify/functions/vehicle-records";
  }

  async function apiRequest(method, body) {
    const response = await fetch(getApiUrl(), {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Storage-Secret": getStorageSecret(),
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
        lastSyncError = new Error("Server rejected the storage secret.");
        return { ok: false, reason: "auth" };
      }
      if (response.status === 503) {
        lastSyncError = new Error("Netlify PERMIT_STORE_SECRET is not configured.");
        return { ok: false, reason: "config" };
      }
      if (!response.ok) {
        lastSyncError = new Error(`Server returned ${response.status}`);
        return {
          ok: false,
          reason: response.status === 404 ? "not-found" : "http",
          status: response.status,
        };
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
      return { ok: false, reason: "network", detail: error?.message || String(error) };
    }
  }

  window.RemoteStorage = {
    isEnabled,
    getDisableReason,
    hydrate,
    pushLocalToServer,
    scheduleSync,
    getLastSyncError,
  };
})();
