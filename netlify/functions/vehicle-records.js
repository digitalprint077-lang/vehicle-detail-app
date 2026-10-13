const { getStore } = require("@netlify/blobs");

const STORE_NAME = "vehicle-detail";
const DATA_KEY = "saved-records";

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function getRequestSecret(event) {
  const headers = event.headers || {};
  return headers["x-storage-secret"] || headers["X-Storage-Secret"] || "";
}

function isAuthorized(event) {
  const expected = process.env.PERMIT_STORE_SECRET;
  if (!expected) {
    return false;
  }
  return getRequestSecret(event) === expected;
}

function emptyPayload() {
  return { permits: [], fitness: [], updatedAt: null };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, body: "" };
  }

  if (!process.env.PERMIT_STORE_SECRET) {
    return jsonResponse(503, {
      error:
        "Server storage is not configured. Set PERMIT_STORE_SECRET in Netlify environment variables.",
    });
  }

  if (!isAuthorized(event)) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  if (event.httpMethod === "GET") {
    const data = (await store.get(DATA_KEY, { type: "json" })) || emptyPayload();
    return jsonResponse(200, {
      permits: Array.isArray(data.permits) ? data.permits : [],
      fitness: Array.isArray(data.fitness) ? data.fitness : [],
      updatedAt: data.updatedAt || null,
    });
  }

  if (event.httpMethod === "PUT" || event.httpMethod === "POST") {
    let body = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (error) {
      return jsonResponse(400, { error: "Invalid JSON body" });
    }

    const existing = (await store.get(DATA_KEY, { type: "json" })) || emptyPayload();
    const next = {
      permits: Array.isArray(body.permits) ? body.permits : existing.permits,
      fitness: Array.isArray(body.fitness) ? body.fitness : existing.fitness,
      updatedAt: new Date().toISOString(),
    };

    await store.setJSON(DATA_KEY, next);
    return jsonResponse(200, next);
  }

  return jsonResponse(405, { error: "Method not allowed" });
};
