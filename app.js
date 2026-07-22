const form = document.getElementById("vehicle-form");
const permitForm = document.getElementById("route-permit-form");
const permitQrCanvas = document.getElementById("permit-qr-code");
const SAVED_PERMITS_KEY = "vehicleDetailSavedPermits";

const NEW_PERMIT_DEFAULTS = {
  routeDetails:
    "KARACHI, TANDO M KHAN, THATTA, TANDO ALLAH YAR, MATIARI, JAMSHORO, DADU, BADIN, SUJAWWAL, HYDERABAD, KAMBER SHAHDADKOT, LARKANA, SHIKARPUR, JACOBABAD, KASHMORE KANDHKOT, KHAIRPUR, SUKKUR, GHOTKI, THARPARKAR MITHI, MIRPURKHAS, UMERKOT, SHAHEED BENAZIRABAD, NAUSHEHROFEROZE, SANGHAR",
  signatoryTitle: "SECRETARY",
  signatoryAuthority: "PROVINCIAL TRANSPORT AUTHORITY, SINDH",
  signatoryCity: "KARACHI",
  urduFooter:
    "ضروری ہدایات۔ گاڑیوں کے آپریٹرز (مالکان / ڈرائیورز) انسانی جانوں کے تحفظ کے پیش نظر انڈس ہائی وے اور مہران ہائی وے کے ممنوعہ علاقوں میں سفر نہیں کریں گے۔\nفوری طبی امداد کا باکس رکھیں، آگ بجھانے کا آلہ لازمی رکھیں، بس میں ایمرجنسی گیٹ لازمی ہے۔",
};

let activeSavedPermitId = null;
let isSyncingRegistration = false;
function getFormDataObject() {
  if (!form) {
    return {
      registration: document.getElementById("registration")?.value || "",
      chassis: document.getElementById("chassis")?.value || "",
      engine: document.getElementById("engine")?.value || "",
      issueDate: document.getElementById("issue-date")?.value || "",
      expiryDate: document.getElementById("expiry-date")?.value || "",
      status: document.getElementById("status")?.value || "",
    };
  }

  const data = new FormData(form);
  return {
    registration: data.get("registration") || "",
    chassis: data.get("chassis") || "",
    engine: data.get("engine") || "",
    issueDate: data.get("issueDate") || "",
    expiryDate: data.get("expiryDate") || "",
    status: data.get("status") || "",
  };
}

function getPermitFormDataObject() {
  if (!permitForm) {
    return {
      rpNo: document.getElementById("rp-no")?.value || "",
      vehicleType: document.getElementById("vehicle-type")?.value || "",
      fullName: document.getElementById("full-name")?.value || "",
      cnicNtn: document.getElementById("cnic-ntn")?.value || "",
      ownerAddress: document.getElementById("owner-address")?.value || "",
      registrationNo: document.getElementById("permit-registration")?.value || "",
      validUpto: document.getElementById("valid-upto")?.value || "",
      routeDetails: document.getElementById("route-details")?.value || "",
      signatoryTitle: document.getElementById("signatory-title")?.value || "",
      signatoryAuthority: document.getElementById("signatory-authority")?.value || "",
      signatoryCity: document.getElementById("signatory-city")?.value || "",
      urduFooter: document.getElementById("urdu-footer")?.value || "",
    };
  }

  const data = new FormData(permitForm);
  return {
    rpNo: data.get("rpNo") || "",
    vehicleType: data.get("vehicleType") || "",
    fullName: data.get("fullName") || "",
    cnicNtn: data.get("cnicNtn") || "",
    ownerAddress: data.get("ownerAddress") || "",
    registrationNo: data.get("registrationNo") || "",
    validUpto: data.get("validUpto") || "",
    routeDetails: data.get("routeDetails") || "",
    signatoryTitle: data.get("signatoryTitle") || "",
    signatoryAuthority: data.get("signatoryAuthority") || "",
    signatoryCity: data.get("signatoryCity") || "",
    urduFooter: data.get("urduFooter") || "",
  };
}

function buildParamsFromData(data) {
  const params = new URLSearchParams();
  params.set("registration", data.registration);
  params.set("chassis", data.chassis);
  params.set("engine", data.engine);
  params.set("issueDate", data.issueDate);
  params.set("expiryDate", data.expiryDate);
  params.set("status", data.status);
  return params;
}

function getResultPageUrl() {
  return new URL("result.html", window.location.href).href.split("#")[0];
}

const permitPreviewFields = {
  rpNo: document.getElementById("preview-rp-no"),
  vehicleType: document.getElementById("preview-vehicle-type"),
  fullName: document.getElementById("preview-full-name"),
  cnicNtn: document.getElementById("preview-cnic"),
  ownerAddress: document.getElementById("preview-address"),
  registrationNo: document.getElementById("preview-registration"),
  validUpto: document.getElementById("preview-valid-upto"),
  routeDetails: document.getElementById("preview-route-details"),
  signatoryTitle: document.getElementById("preview-signatory-title"),
  signatoryAuthority: document.getElementById("preview-signatory-authority"),
  signatoryCity: document.getElementById("preview-signatory-city"),
  urduFooter: document.getElementById("preview-urdu-footer"),
};

function displayPermitValue(value) {
  if (!value) return "-";
  const trimmed = String(value).trim();
  return trimmed || "-";
}

function formatPermitDisplayValue(value) {
  const displayed = displayPermitValue(value);
  if (displayed === "-") return displayed;
  return displayed.toUpperCase();
}

function formatPermitDate(value) {
  if (!value) return "-";
  const date = new Date(value + "T00:00:00");
  if (Number.isNaN(date.getTime())) return displayPermitValue(value);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getResultLink(data) {
  const params = buildParamsFromData(data || getFormDataObject());
  return `${getResultPageUrl()}#${params.toString()}`;
}

function updatePermitPreview() {
  const data = getPermitFormDataObject();
  if (!permitPreviewFields.rpNo) return;

  permitPreviewFields.rpNo.textContent = displayPermitValue(data.rpNo);
  permitPreviewFields.vehicleType.textContent = displayPermitValue(data.vehicleType);
  permitPreviewFields.fullName.textContent = displayPermitValue(data.fullName);
  permitPreviewFields.cnicNtn.textContent = formatPermitDisplayValue(data.cnicNtn);
  permitPreviewFields.ownerAddress.textContent = formatPermitDisplayValue(data.ownerAddress);
  permitPreviewFields.registrationNo.textContent = formatPermitDisplayValue(data.registrationNo);
  permitPreviewFields.validUpto.textContent = formatPermitDate(data.validUpto);
  permitPreviewFields.routeDetails.textContent = formatPermitDisplayValue(data.routeDetails);
  permitPreviewFields.signatoryTitle.textContent = formatPermitDisplayValue(data.signatoryTitle);
  permitPreviewFields.signatoryAuthority.textContent = formatPermitDisplayValue(data.signatoryAuthority);
  permitPreviewFields.signatoryCity.textContent = formatPermitDisplayValue(data.signatoryCity);
  if (permitPreviewFields.urduFooter) {
    permitPreviewFields.urduFooter.textContent = displayPermitValue(data.urduFooter);
  }
}

async function updatePermitQrCode() {
  if (!permitQrCanvas) return;

  const link = getResultLink();

  try {
    if (window.QRCode) {
      await QRCode.toCanvas(permitQrCanvas, link, {
        width: 83,
        margin: 0,
        color: { dark: "#212121", light: "#ffffff" },
      });
      return;
    }
  } catch (error) {
    console.error("Permit QR render failed:", error);
  }

  const ctx = permitQrCanvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, permitQrCanvas.width, permitQrCanvas.height);
  }
}

function openResultTab(data) {
  const url = getResultLink(data);
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function syncRegistrationFields(source) {
  if (isSyncingRegistration) return;
  isSyncingRegistration = true;

  const permitRegistration = document.getElementById("permit-registration");
  const vehicleRegistration = document.getElementById("registration");
  const permitValidUpto = document.getElementById("valid-upto");
  const vehicleExpiry = document.getElementById("expiry-date");

  if (source === "permit") {
    if (permitRegistration && vehicleRegistration) {
      vehicleRegistration.value = permitRegistration.value;
    }
    if (permitValidUpto && vehicleExpiry) {
      vehicleExpiry.value = permitValidUpto.value;
    }
  } else if (source === "vehicle") {
    if (permitRegistration && vehicleRegistration) {
      permitRegistration.value = vehicleRegistration.value;
    }
    if (permitValidUpto && vehicleExpiry) {
      permitValidUpto.value = vehicleExpiry.value;
    }
  }

  isSyncingRegistration = false;
}

function onPermitFormChange() {
  syncRegistrationFields("permit");
  updatePermitPreview();
  updatePermitQrCode();
}

function onVehicleFormChange() {
  syncRegistrationFields("vehicle");
  updatePermitPreview();
  updatePermitQrCode();
}

function createPermitId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `permit-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSavedPermits() {
  try {
    const raw = localStorage.getItem(SAVED_PERMITS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read saved permits:", error);
    return [];
  }
}

function setSavedPermits(permits) {
  localStorage.setItem(SAVED_PERMITS_KEY, JSON.stringify(permits));
}

function getPermitLabel(permit, vehicle) {
  const rp = permit.rpNo?.trim() || "No R.P.";
  const reg = permit.registrationNo?.trim() || vehicle.registration?.trim() || "No Reg";
  const name = permit.fullName?.trim();
  return name ? `${rp} · ${reg} · ${name}` : `${rp} · ${reg}`;
}

function formatSavedDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function setPermitSaveStatus(message, isError = false) {
  const status = document.getElementById("permit-save-status");
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? "var(--panel-danger)" : "var(--panel-success)";
}

function applyPermitDataToForm(permit) {
  if (!permitForm || !permit) return;

  const fields = {
    rpNo: "rp-no",
    vehicleType: "vehicle-type",
    fullName: "full-name",
    cnicNtn: "cnic-ntn",
    ownerAddress: "owner-address",
    registrationNo: "permit-registration",
    validUpto: "valid-upto",
    routeDetails: "route-details",
    signatoryTitle: "signatory-title",
    signatoryAuthority: "signatory-authority",
    signatoryCity: "signatory-city",
    urduFooter: "urdu-footer",
  };

  Object.entries(fields).forEach(([key, id]) => {
    const input = document.getElementById(id);
    if (input && permit[key] !== undefined) {
      input.value = permit[key];
    }
  });
}

function applyVehicleDataToForm(vehicle) {
  if (!form || !vehicle) return;

  const fields = {
    registration: "registration",
    chassis: "chassis",
    engine: "engine",
    issueDate: "issue-date",
    expiryDate: "expiry-date",
    status: "status",
  };

  Object.entries(fields).forEach(([key, id]) => {
    const input = document.getElementById(id);
    if (input && vehicle[key] !== undefined) {
      input.value = vehicle[key];
    }
  });
}

function getSavedPermitSearchText(entry) {
  const permit = entry.permit || {};
  const vehicle = entry.vehicle || {};
  return [
    entry.label,
    getPermitLabel(permit, vehicle),
    permit.rpNo,
    permit.vehicleType,
    permit.fullName,
    permit.cnicNtn,
    permit.registrationNo,
    permit.ownerAddress,
    vehicle.registration,
    vehicle.chassis,
    vehicle.engine,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesSavedPermitSearch(entry, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return getSavedPermitSearchText(entry).includes(normalized);
}

function renderSavedPermitsList() {
  const list = document.getElementById("saved-permits-list");
  const empty = document.getElementById("saved-permits-empty");
  const count = document.getElementById("saved-permits-count");
  const searchInput = document.getElementById("saved-permits-search");
  if (!list || !empty || !count) return;

  const query = searchInput?.value || "";
  const allPermits = getSavedPermits().sort(
    (a, b) => new Date(b.updatedAt || b.savedAt) - new Date(a.updatedAt || a.savedAt)
  );
  const permits = allPermits.filter((entry) => matchesSavedPermitSearch(entry, query));

  count.textContent = String(allPermits.length);
  list.innerHTML = "";

  if (!allPermits.length) {
    list.classList.add("is-hidden");
    empty.classList.remove("is-hidden");
    empty.textContent =
      "No saved permits yet. Go to Edit Permit, fill the form, and click Save Permit.";
    return;
  }

  if (!permits.length) {
    list.classList.add("is-hidden");
    empty.classList.remove("is-hidden");
    empty.textContent = `No permits match "${query.trim()}".`;
    return;
  }

  list.classList.remove("is-hidden");
  empty.classList.add("is-hidden");
  empty.textContent =
    "No saved permits yet. Go to Edit Permit, fill the form, and click Save Permit.";

  permits.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "permit-saved-item";
    if (entry.id === activeSavedPermitId) {
      item.classList.add("is-active");
    }

    const info = document.createElement("div");
    info.className = "permit-saved-info";
    info.innerHTML = `
      <strong>${getPermitLabel(entry.permit, entry.vehicle)}</strong>
      <span>Saved ${formatSavedDate(entry.updatedAt || entry.savedAt)}</span>
    `;

    const buttons = document.createElement("div");
    buttons.className = "permit-saved-buttons";

    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.className = "permit-saved-btn permit-saved-btn-load";
    loadBtn.textContent = "Load";
    loadBtn.addEventListener("click", () => loadSavedPermit(entry.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "permit-saved-btn permit-saved-btn-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteSavedPermit(entry.id));

    buttons.append(loadBtn, deleteBtn);
    item.append(info, buttons);
    list.appendChild(item);
  });
}

function saveCurrentPermit() {
  const permit = getPermitFormDataObject();
  const vehicle = getFormDataObject();
  const now = new Date().toISOString();
  const permits = getSavedPermits();
  const label = getPermitLabel(permit, vehicle);

  if (activeSavedPermitId) {
    const index = permits.findIndex((entry) => entry.id === activeSavedPermitId);
    if (index !== -1) {
      permits[index] = {
        ...permits[index],
        label,
        permit,
        vehicle,
        updatedAt: now,
      };
      setSavedPermits(permits);
      renderSavedPermitsList();
      setPermitSaveStatus(`Updated: ${label}`);
      return;
    }
  }

  const entry = {
    id: createPermitId(),
    label,
    permit,
    vehicle,
    savedAt: now,
    updatedAt: now,
  };

  permits.push(entry);
  activeSavedPermitId = entry.id;
  setSavedPermits(permits);
  renderSavedPermitsList();
  setPermitSaveStatus(`Saved: ${label}`);
}

function loadSavedPermit(id) {
  const entry = getSavedPermits().find((item) => item.id === id);
  if (!entry) {
    setPermitSaveStatus("Saved permit not found.", true);
    renderSavedPermitsList();
    return;
  }

  activeSavedPermitId = entry.id;
  applyPermitDataToForm(entry.permit);
  applyVehicleDataToForm(entry.vehicle);
  onPermitFormChange();
  renderSavedPermitsList();
  switchPermitTab("edit");
  setPermitSaveStatus(`Loaded: ${entry.label || getPermitLabel(entry.permit, entry.vehicle)}`);
}

function deleteSavedPermit(id) {
  const entry = getSavedPermits().find((item) => item.id === id);
  if (!entry) {
    renderSavedPermitsList();
    return;
  }

  const label = entry.label || getPermitLabel(entry.permit, entry.vehicle);
  if (!window.confirm(`Delete saved permit?\n\n${label}`)) {
    return;
  }

  const permits = getSavedPermits().filter((item) => item.id !== id);
  setSavedPermits(permits);

  if (activeSavedPermitId === id) {
    activeSavedPermitId = null;
  }

  renderSavedPermitsList();
  setPermitSaveStatus(`Deleted: ${label}`);
}

function resetFormForNewPermit() {
  const expiryDate = document.getElementById("expiry-date")?.value || "";

  applyPermitDataToForm({
    rpNo: "",
    vehicleType: "",
    fullName: "",
    cnicNtn: "",
    registrationNo: "",
    ownerAddress: "",
    validUpto: expiryDate,
    ...NEW_PERMIT_DEFAULTS,
  });

  applyVehicleDataToForm({
    registration: "",
    chassis: "",
    engine: "",
    issueDate: "",
    expiryDate,
    status: "Valid Certificate",
  });
}

function startNewPermit() {
  activeSavedPermitId = null;
  resetFormForNewPermit();
  onPermitFormChange();
  renderSavedPermitsList();
  switchPermitTab("edit");
  setPermitSaveStatus("New permit started. Route details, signatory, expiry date, and Urdu footer kept.");
}

function switchPermitTab(tabName) {
  const isEdit = tabName === "edit";
  const editPanel = document.getElementById("permit-tab-edit");
  const savedPanel = document.getElementById("permit-tab-saved");
  const editBtn = document.getElementById("permit-tab-btn-edit");
  const savedBtn = document.getElementById("permit-tab-btn-saved");

  editPanel?.classList.toggle("is-active", isEdit);
  savedPanel?.classList.toggle("is-active", !isEdit);
  editBtn?.classList.toggle("is-active", isEdit);
  savedBtn?.classList.toggle("is-active", !isEdit);
  editBtn?.setAttribute("aria-selected", isEdit ? "true" : "false");
  savedBtn?.setAttribute("aria-selected", isEdit ? "false" : "true");

  if (editPanel) editPanel.hidden = !isEdit;
  if (savedPanel) savedPanel.hidden = isEdit;
}

function initPermitSaving() {
  document.getElementById("save-permit-btn")?.addEventListener("click", saveCurrentPermit);
  document.getElementById("new-permit-btn")?.addEventListener("click", startNewPermit);
  document.getElementById("permit-tab-btn-edit")?.addEventListener("click", () => switchPermitTab("edit"));
  document.getElementById("permit-tab-btn-saved")?.addEventListener("click", () => switchPermitTab("saved"));
  document.getElementById("saved-permits-search")?.addEventListener("input", renderSavedPermitsList);
  renderSavedPermitsList();
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  openResultTab(getFormDataObject());
});

permitForm?.addEventListener("input", onPermitFormChange);
permitForm?.addEventListener("change", onPermitFormChange);

form?.addEventListener("input", onVehicleFormChange);
form?.addEventListener("change", onVehicleFormChange);

document.getElementById("print-permit-btn")?.addEventListener("click", () => {
  document.body.classList.add("is-printing-permit");
  window.print();
});

window.addEventListener("afterprint", () => {
  document.body.classList.remove("is-printing-permit");
});

initPermitSaving();
onPermitFormChange();
