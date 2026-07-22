const fields = {
  registration: document.getElementById("result-registration"),
  chassis: document.getElementById("result-chassis"),
  engine: document.getElementById("result-engine"),
  issueDate: document.getElementById("result-issue-date"),
  expiryDate: document.getElementById("result-expiry-date"),
  status: document.getElementById("result-status"),
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value + "T00:00:00");
  if (Number.isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function displayValue(value) {
  if (!value) return "-";
  const trimmed = String(value).trim();
  return trimmed || "-";
}

function applyStatusStyle(element, status) {
  element.classList.remove("valid", "expired", "invalid", "pending");

  if (status === "Valid Certificate") {
    element.classList.add("valid");
  } else if (status === "Expired") {
    element.classList.add("expired");
  } else if (status === "Invalid") {
    element.classList.add("invalid");
  } else if (status === "Pending") {
    element.classList.add("pending");
  }
}

function loadResult() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : "";
  const params = new URLSearchParams(hash || window.location.search);

  fields.registration.textContent = displayValue(params.get("registration"));
  fields.chassis.textContent = displayValue(params.get("chassis"));
  fields.engine.textContent = displayValue(params.get("engine"));
  fields.issueDate.textContent = formatDate(params.get("issueDate"));
  fields.expiryDate.textContent = formatDate(params.get("expiryDate"));

  const status = params.get("status") || "-";
  fields.status.textContent = status;
  applyStatusStyle(fields.status, status);
}

loadResult();
initCustomCursor();
