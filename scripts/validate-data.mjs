import fs from "node:fs";
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function error(message) {
  console.error("❌", message);
  process.exit(1);
}

function validateSchema(filePath, schemaPath) {
  const data = loadJSON(filePath);
  const schema = loadJSON(schemaPath);

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    console.error(`❌ Schema validation failed for ${filePath}`);
    console.error(validate.errors);
    process.exit(1);
  }
}

function validateServices(services, allowedServices, context) {
  if (!services) {
    return;
  }

  for (const service of services) {
    if (!allowedServices.includes(service)) {
      error(
        `Invalid service "${service}" in ${context}. Allowed values: ${allowedServices.join(", ")}`
      );
    }
  }
}

function validateChains() {
  const sdkValues = loadJSON("reference/sdk-values.json");
  const chains = loadJSON("chains/global.json");

  const allowedServices = sdkValues.services;

  if (!chains.items) {
    error("chains/global.json missing items array");
  }

  for (const chain of chains.items) {
    if (chain.policy?.services) {
      const services = chain.policy.services;

      validateServices(
        services.required,
        allowedServices,
        `chain ${chain.id} policy.services.required`
      );

      validateServices(
        services.recommended,
        allowedServices,
        `chain ${chain.id} policy.services.recommended`
      );

      validateServices(
        services.forbidden,
        allowedServices,
        `chain ${chain.id} policy.services.forbidden`
      );
    }
  }
}

function validateManifest() {
  const manifest = loadJSON("manifest/stable.json");

  if (!manifest.files || typeof manifest.files !== "object") {
    error("manifest/stable.json missing 'files' object");
  }

  for (const [fileKey, fileInfo] of Object.entries(manifest.files)) {
    const filePath =
      typeof fileInfo?.path === "string" ? fileInfo.path : fileKey;

    if (typeof fileInfo !== "object" || fileInfo === null) {
      error(`Manifest entry for ${fileKey} must be an object`);
    }

    if (
      "required" in fileInfo &&
      typeof fileInfo.required !== "boolean"
    ) {
      error(`Manifest entry for ${fileKey} has non-boolean 'required' value`);
    }

    if (!fs.existsSync(filePath)) {
      error(`Manifest references missing file: ${filePath}`);
    }
  }
}

function runValidation() {
  console.log("Running data validation...");

  validateManifest();

  validateSchema(
    "chains/global.json",
    "schemas/chain-dataset.schema.json"
  );

  validateChains();

  console.log("✅ Data validation passed");
}

runValidation();