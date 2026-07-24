function formatResultDate(value) {
  if (!value) return "-";
  const date = new Date(value + "T00:00:00");
  if (Number.isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function displayResultValue(value) {
  if (!value) return "-";
  const trimmed = String(value).trim();
  return trimmed || "-";
}

function applyResultStatusStyle(element, status) {
  if (!element) return;
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

function updateResultDisplays(data) {
  const source = data || {};
  const fieldMap = {
    registration: displayResultValue(source.registration),
    chassis: displayResultValue(source.chassis),
    engine: displayResultValue(source.engine),
    issueDate: formatResultDate(source.issueDate),
    expiryDate: formatResultDate(source.expiryDate),
    status: source.status || "-",
  };

  Object.entries(fieldMap).forEach(([field, value]) => {
    document.querySelectorAll(`[data-result-field="${field}"]`).forEach((element) => {
      if (field === "status") {
        element.textContent = value;
        applyResultStatusStyle(element, value);
        return;
      }
      element.textContent = value;
    });
  });
}

function loadResultFromUrl() {
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
  const params = new URLSearchParams(hash || window.location.search);

  updateResultDisplays({
    registration: params.get("registration"),
    chassis: params.get("chassis"),
    engine: params.get("engine"),
    issueDate: params.get("issueDate"),
    expiryDate: params.get("expiryDate"),
    status: params.get("status"),
  });
}
