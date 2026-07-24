const form = document.getElementById("vehicle-form");
const fitnessForm = document.getElementById("fitness-form");
const permitForm = document.getElementById("route-permit-form");
const permitQrCanvas = document.getElementById("permit-qr-code");
const fitnessQrCanvas = document.getElementById("fitness-qr-code");
const SAVED_PERMITS_KEY = "vehicleDetailSavedPermits";
const SAVED_FITNESS_KEY = "vehicleDetailSavedFitness";

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
let activeSavedFitnessId = null;

function refreshPanelIcons(root) {
  if (typeof window.PanelIcons?.init === "function") {
    window.PanelIcons.init(root || document);
  }
}

function createIconButton(className, iconName, label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `${className} btn-with-icon`;
  button.innerHTML = `<span data-icon="${iconName}" aria-hidden="true"></span><span>${label}</span>`;
  button.addEventListener("click", onClick);
  return button;
}
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

function getFitnessPageUrl() {
  return new URL("fitness.html", window.location.href).href.split("#")[0];
}

function getResultLink(data) {
  const params = buildParamsFromData(data || getFormDataObject());
  return `${getResultPageUrl()}#${params.toString()}`;
}

function getFitnessFormDataObject() {
  if (!fitnessForm) {
    return {
      registration: document.getElementById("fitness-registration")?.value || "",
      chassis: document.getElementById("fitness-chassis")?.value || "",
      engine: document.getElementById("fitness-engine")?.value || "",
      issueDate: document.getElementById("fitness-issue-date")?.value || "",
      expiryDate: document.getElementById("fitness-expiry-date")?.value || "",
      status: document.getElementById("fitness-status")?.value || "",
    };
  }

  const data = new FormData(fitnessForm);
  return {
    registration: data.get("registration") || "",
    chassis: data.get("chassis") || "",
    engine: data.get("engine") || "",
    issueDate: data.get("issueDate") || "",
    expiryDate: data.get("expiryDate") || "",
    status: data.get("status") || "",
  };
}

function getFitnessLink(data) {
  const params = buildParamsFromData(data || getFitnessFormDataObject());
  return `${getFitnessPageUrl()}#${params.toString()}`;
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

async function updateFitnessQrCode() {
  if (!fitnessQrCanvas) return;

  const link = getFitnessLink();
  const linkLabel = document.getElementById("fitness-qr-link");
  if (linkLabel) {
    linkLabel.textContent = link;
  }

  try {
    if (window.QRCode) {
      await QRCode.toCanvas(fitnessQrCanvas, link, {
        width: 180,
        margin: 1,
        color: { dark: "#212121", light: "#ffffff" },
      });
      return;
    }
  } catch (error) {
    console.error("Fitness QR render failed:", error);
  }

  const ctx = fitnessQrCanvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, fitnessQrCanvas.width, fitnessQrCanvas.height);
  }
}

function onFitnessFormChange() {
  updateFitnessQrCode();
}

function downloadFitnessQr() {
  if (!fitnessQrCanvas) return;
  const link = document.createElement("a");
  link.download = "fitness-qr.png";
  link.href = fitnessQrCanvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function openResultPage(url) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function openResultTab(data) {
  openResultPage(getResultLink(data));
}

function openFitnessTab(data) {
  openResultPage(getFitnessLink(data));
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

function setFitnessSaveStatus(message, isError = false) {
  const status = document.getElementById("fitness-save-status");
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

function applyFitnessDataToForm(fitness) {
  if (!fitnessForm || !fitness) return;

  const fields = {
    registration: "fitness-registration",
    chassis: "fitness-chassis",
    engine: "fitness-engine",
    issueDate: "fitness-issue-date",
    expiryDate: "fitness-expiry-date",
    status: "fitness-status",
  };

  Object.entries(fields).forEach(([key, id]) => {
    const input = document.getElementById(id);
    if (input && fitness[key] !== undefined) {
      input.value = fitness[key];
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

    const loadBtn = createIconButton(
      "permit-saved-btn permit-saved-btn-load",
      "folder",
      "Load",
      () => loadSavedPermit(entry.id)
    );

    const deleteBtn = createIconButton(
      "permit-saved-btn permit-saved-btn-delete",
      "trash",
      "Delete",
      () => deleteSavedPermit(entry.id)
    );

    buttons.append(loadBtn, deleteBtn);
    item.append(info, buttons);
    list.appendChild(item);
  });

  refreshPanelIcons(list);
}

function getSavedFitness() {
  try {
    const raw = localStorage.getItem(SAVED_FITNESS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read saved fitness records:", error);
    return [];
  }
}

function setSavedFitness(records) {
  localStorage.setItem(SAVED_FITNESS_KEY, JSON.stringify(records));
}

function getFitnessLabel(fitness) {
  const registration = fitness.registration?.trim() || "No Reg";
  const engine = fitness.engine?.trim();
  const status = fitness.status?.trim();
  if (engine && status) {
    return `${registration} · ${engine} · ${status}`;
  }
  if (engine) {
    return `${registration} · ${engine}`;
  }
  return registration;
}

function getSavedFitnessSearchText(entry) {
  const fitness = entry.fitness || {};
  return [
    entry.label,
    getFitnessLabel(fitness),
    fitness.registration,
    fitness.chassis,
    fitness.engine,
    fitness.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesSavedFitnessSearch(entry, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return getSavedFitnessSearchText(entry).includes(normalized);
}

function renderSavedFitnessList() {
  const list = document.getElementById("saved-fitness-list");
  const empty = document.getElementById("saved-fitness-empty");
  const count = document.getElementById("saved-fitness-count");
  const searchInput = document.getElementById("saved-fitness-search");
  if (!list || !empty || !count) return;

  const query = searchInput?.value || "";
  const allRecords = getSavedFitness().sort(
    (a, b) => new Date(b.updatedAt || b.savedAt) - new Date(a.updatedAt || a.savedAt)
  );
  const records = allRecords.filter((entry) => matchesSavedFitnessSearch(entry, query));

  count.textContent = String(allRecords.length);
  list.innerHTML = "";

  if (!allRecords.length) {
    list.classList.add("is-hidden");
    empty.classList.remove("is-hidden");
    empty.textContent =
      "No saved fitness records yet. Go to Edit Fitness, fill the form, and click Save Fitness.";
    return;
  }

  if (!records.length) {
    list.classList.add("is-hidden");
    empty.classList.remove("is-hidden");
    empty.textContent = `No fitness records match "${query.trim()}".`;
    return;
  }

  list.classList.remove("is-hidden");
  empty.classList.add("is-hidden");
  empty.textContent =
    "No saved fitness records yet. Go to Edit Fitness, fill the form, and click Save Fitness.";

  records.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "permit-saved-item";
    if (entry.id === activeSavedFitnessId) {
      item.classList.add("is-active");
    }

    const info = document.createElement("div");
    info.className = "permit-saved-info";
    info.innerHTML = `
      <strong>${entry.label || getFitnessLabel(entry.fitness)}</strong>
      <span>Saved ${formatSavedDate(entry.updatedAt || entry.savedAt)}</span>
    `;

    const buttons = document.createElement("div");
    buttons.className = "permit-saved-buttons";

    const loadBtn = createIconButton(
      "permit-saved-btn permit-saved-btn-load",
      "folder",
      "Load",
      () => loadSavedFitness(entry.id)
    );

    const deleteBtn = createIconButton(
      "permit-saved-btn permit-saved-btn-delete",
      "trash",
      "Delete",
      () => deleteSavedFitness(entry.id)
    );

    buttons.append(loadBtn, deleteBtn);
    item.append(info, buttons);
    list.appendChild(item);
  });

  refreshPanelIcons(list);
}

function saveCurrentFitness() {
  const fitness = getFitnessFormDataObject();
  const now = new Date().toISOString();
  const records = getSavedFitness();
  const label = getFitnessLabel(fitness);

  if (activeSavedFitnessId) {
    const index = records.findIndex((entry) => entry.id === activeSavedFitnessId);
    if (index !== -1) {
      records[index] = {
        ...records[index],
        label,
        fitness,
        updatedAt: now,
      };
      setSavedFitness(records);
      renderSavedFitnessList();
      setFitnessSaveStatus(`Updated: ${label}`);
      return;
    }
  }

  const entry = {
    id: createPermitId(),
    label,
    fitness,
    savedAt: now,
    updatedAt: now,
  };

  records.push(entry);
  activeSavedFitnessId = entry.id;
  setSavedFitness(records);
  renderSavedFitnessList();
  setFitnessSaveStatus(`Saved: ${label}`);
}

function loadSavedFitness(id) {
  const entry = getSavedFitness().find((item) => item.id === id);
  if (!entry) {
    setFitnessSaveStatus("Saved fitness record not found.", true);
    renderSavedFitnessList();
    return;
  }

  activeSavedFitnessId = entry.id;
  applyFitnessDataToForm(entry.fitness);
  onFitnessFormChange();
  renderSavedFitnessList();
  switchFitnessTab("edit");
  setFitnessSaveStatus(`Loaded: ${entry.label || getFitnessLabel(entry.fitness)}`);
}

function deleteSavedFitness(id) {
  const entry = getSavedFitness().find((item) => item.id === id);
  if (!entry) {
    renderSavedFitnessList();
    return;
  }

  const label = entry.label || getFitnessLabel(entry.fitness);
  if (!window.confirm(`Delete saved fitness record?\n\n${label}`)) {
    return;
  }

  const records = getSavedFitness().filter((item) => item.id !== id);
  setSavedFitness(records);

  if (activeSavedFitnessId === id) {
    activeSavedFitnessId = null;
  }

  renderSavedFitnessList();
  setFitnessSaveStatus(`Deleted: ${label}`);
}

function resetFormForNewFitness() {
  applyFitnessDataToForm({
    registration: "",
    chassis: "",
    engine: "",
    issueDate: "",
    expiryDate: "",
    status: "Valid Certificate",
  });
}

function startNewFitness() {
  activeSavedFitnessId = null;
  resetFormForNewFitness();
  onFitnessFormChange();
  renderSavedFitnessList();
  switchFitnessTab("edit");
  setFitnessSaveStatus("New fitness record started.");
}

function switchFitnessTab(tabName) {
  const isEdit = tabName === "edit";
  const editPanel = document.getElementById("fitness-tab-edit");
  const savedPanel = document.getElementById("fitness-tab-saved");
  const editBtn = document.getElementById("fitness-tab-btn-edit");
  const savedBtn = document.getElementById("fitness-tab-btn-saved");

  editPanel?.classList.toggle("is-active", isEdit);
  savedPanel?.classList.toggle("is-active", !isEdit);
  editBtn?.classList.toggle("is-active", isEdit);
  savedBtn?.classList.toggle("is-active", !isEdit);
  editBtn?.setAttribute("aria-selected", isEdit ? "true" : "false");
  savedBtn?.setAttribute("aria-selected", isEdit ? "false" : "true");

  if (editPanel) editPanel.hidden = !isEdit;
  if (savedPanel) savedPanel.hidden = isEdit;
}

function initFitnessSaving() {
  document.getElementById("save-fitness-btn")?.addEventListener("click", saveCurrentFitness);
  document.getElementById("new-fitness-btn")?.addEventListener("click", startNewFitness);
  document.getElementById("fitness-tab-btn-edit")?.addEventListener("click", () => switchFitnessTab("edit"));
  document.getElementById("fitness-tab-btn-saved")?.addEventListener("click", () => switchFitnessTab("saved"));
  document.getElementById("saved-fitness-search")?.addEventListener("input", renderSavedFitnessList);
  renderSavedFitnessList();
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

fitnessForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  openFitnessTab(getFitnessFormDataObject());
});

fitnessForm?.addEventListener("input", onFitnessFormChange);
fitnessForm?.addEventListener("change", onFitnessFormChange);

document.getElementById("fitness-qr-download-btn")?.addEventListener("click", downloadFitnessQr);

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

function switchMainPanelTab(tabName) {
  const isRoute = tabName === "route";
  const routePanel = document.getElementById("panel-main-tab-route");
  const fitnessPanel = document.getElementById("panel-main-tab-fitness");
  const routeBtn = document.getElementById("panel-main-tab-btn-route");
  const fitnessBtn = document.getElementById("panel-main-tab-btn-fitness");

  routePanel?.classList.toggle("is-active", isRoute);
  fitnessPanel?.classList.toggle("is-active", !isRoute);
  routeBtn?.classList.toggle("is-active", isRoute);
  fitnessBtn?.classList.toggle("is-active", !isRoute);
  routeBtn?.setAttribute("aria-selected", isRoute ? "true" : "false");
  fitnessBtn?.setAttribute("aria-selected", isRoute ? "false" : "true");

  if (routePanel) routePanel.hidden = !isRoute;
  if (fitnessPanel) fitnessPanel.hidden = isRoute;

  try {
    localStorage.setItem("vehicleDetailPanelMainTab", tabName);
  } catch (error) {
    // ignore storage errors
  }

  if (!isRoute) {
    onFitnessFormChange();
  }
}

function initMainPanelTabs() {
  let initialTab = "route";

  try {
    const savedTab = localStorage.getItem("vehicleDetailPanelMainTab");
    if (savedTab === "route" || savedTab === "fitness") {
      initialTab = savedTab;
    }
  } catch (error) {
    // ignore storage errors
  }

  const tabParam = new URLSearchParams(window.location.search).get("tab");
  if (tabParam === "fitness" || tabParam === "route") {
    initialTab = tabParam;
  }

  document.getElementById("panel-main-tab-btn-route")?.addEventListener("click", () => {
    switchMainPanelTab("route");
  });
  document.getElementById("panel-main-tab-btn-fitness")?.addEventListener("click", () => {
    switchMainPanelTab("fitness");
  });

  switchMainPanelTab(initialTab);
}

initPermitSaving();
initFitnessSaving();
initMainPanelTabs();
onPermitFormChange();
onFitnessFormChange();
