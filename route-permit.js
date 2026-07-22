const fields = {

  rpNo: document.getElementById("permit-rp-no"),

  vehicleType: document.getElementById("permit-vehicle-type"),

  fullName: document.getElementById("permit-full-name"),

  cnicNtn: document.getElementById("permit-cnic"),

  ownerAddress: document.getElementById("permit-address"),

  registrationNo: document.getElementById("permit-registration"),

  validUpto: document.getElementById("permit-valid-upto"),

  routeDetails: document.getElementById("permit-route-details"),

  signatoryTitle: document.getElementById("permit-signatory-title"),
  signatoryAuthority: document.getElementById("permit-signatory-authority"),

  signatoryCity: document.getElementById("permit-signatory-city"),

  urduFooter: document.getElementById("permit-urdu-footer"),

};



function displayValue(value) {

  if (!value) return "-";

  const trimmed = String(value).trim();

  return trimmed || "-";

}



function formatDisplayValue(value) {

  const displayed = displayValue(value);

  if (displayed === "-") return displayed;

  return displayed.toUpperCase();

}



function formatValidDate(value) {

  if (!value) return "-";

  const date = new Date(value + "T00:00:00");

  if (Number.isNaN(date.getTime())) return displayValue(value);



  const day = String(date.getDate()).padStart(2, "0");

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const year = date.getFullYear();

  return `${day}/${month}/${year}`;

}



function loadPermit() {

  const hash = window.location.hash.startsWith("#")

    ? window.location.hash.slice(1)

    : "";

  const params = new URLSearchParams(hash || window.location.search);



  fields.rpNo.textContent = displayValue(params.get("rpNo"));

  fields.vehicleType.textContent = displayValue(params.get("vehicleType"));

  fields.fullName.textContent = displayValue(params.get("fullName"));

  fields.cnicNtn.textContent = formatDisplayValue(params.get("cnicNtn"));

  fields.ownerAddress.textContent = formatDisplayValue(params.get("ownerAddress"));

  fields.registrationNo.textContent = formatDisplayValue(params.get("registrationNo"));

  fields.validUpto.textContent = formatValidDate(params.get("validUpto"));

  fields.routeDetails.textContent = formatDisplayValue(params.get("routeDetails"));

  fields.signatoryTitle.textContent = formatDisplayValue(params.get("signatoryTitle"));
  fields.signatoryAuthority.textContent = formatDisplayValue(params.get("signatoryAuthority"));

  fields.signatoryCity.textContent = formatDisplayValue(params.get("signatoryCity"));

  if (fields.urduFooter) {

    fields.urduFooter.textContent = displayValue(params.get("urduFooter"));

  }

}



async function renderPermitQr() {

  const permitQrCanvas = document.getElementById("permit-qr-code");

  if (!permitQrCanvas || !window.QRCode) return;



  const hash = window.location.hash.startsWith("#")

    ? window.location.hash.slice(1)

    : "";

  const params = new URLSearchParams(hash || window.location.search);

  const resultParams = new URLSearchParams();

  resultParams.set("registration", params.get("registration") || params.get("registrationNo") || "");

  resultParams.set("chassis", params.get("chassis") || "");

  resultParams.set("engine", params.get("engine") || "");

  resultParams.set("issueDate", params.get("issueDate") || "");

  resultParams.set("expiryDate", params.get("expiryDate") || params.get("validUpto") || "");

  resultParams.set("status", params.get("status") || "Valid Certificate");



  const link = `${new URL("result.html", window.location.href).href.split("#")[0]}#${resultParams.toString()}`;



  try {

    await QRCode.toCanvas(permitQrCanvas, link, {

      width: 83,

      margin: 0,

      color: { dark: "#212121", light: "#ffffff" },

    });

  } catch (error) {

    console.error("Permit QR render failed:", error);

  }

}



loadPermit();

renderPermitQr();

