const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "storage-secret.js");
const secret = process.env.PERMIT_STORE_SECRET || "";

const contents = `// Generated at build time. Do not put your secret in git.
window.__PERMIT_STORE_SECRET__ = ${JSON.stringify(secret)};
`;

fs.writeFileSync(target, contents, "utf8");

if (!secret) {
  console.warn(
    "PERMIT_STORE_SECRET is not set. Cloud save will be disabled until you add it in Netlify environment variables."
  );
} else {
  console.log("Wrote storage-secret.js for cloud save (secret not printed).");
}
