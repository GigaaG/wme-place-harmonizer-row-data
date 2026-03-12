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

function validateConfig() {
  const sdkValues = loadJSON("reference/sdk-values.json");
  const config = loadJSON("config/global.json");

  const allowedGeometry = sdkValues.geometry;
  const allowedServices = sdkValues.services;
  const allowedSeverity = ["info", "warning", "error"];

  if (config.rules) {
    for (const [ruleId, rule] of Object.entries(config.rules)) {
      if (!allowedSeverity.includes(rule.severity)) {
        error(
          `Invalid severity "${rule.severity}" in config.rules.${ruleId}. Allowed values: ${allowedSeverity.join(", ")}`
        );
      }
    }
  }

  if (config.categoryStandards) {
    for (const [categoryId, standard] of Object.entries(config.categoryStandards)) {
      if (standard.geometry) {
        if (
          standard.geometry.required &&
          !allowedGeometry.includes(standard.geometry.required)
        ) {
          error(
            `Invalid geometry "${standard.geometry.required}" in config.categoryStandards.${categoryId}.geometry.required`
          );
        }

        if (
          standard.geometry.recommended &&
          !allowedGeometry.includes(standard.geometry.recommended)
        ) {
          error(
            `Invalid geometry "${standard.geometry.recommended}" in config.categoryStandards.${categoryId}.geometry.recommended`
          );
        }

        if (standard.geometry.allowed) {
          for (const geometry of standard.geometry.allowed) {
            if (!allowedGeometry.includes(geometry)) {
              error(
                `Invalid geometry "${geometry}" in config.categoryStandards.${categoryId}.geometry.allowed`
              );
            }
          }
        }
      }

      if (standard.services) {
        validateServices(
          standard.services.required,
          allowedServices,
          `config.categoryStandards.${categoryId}.services.required`
        );

        validateServices(
          standard.services.recommended,
          allowedServices,
          `config.categoryStandards.${categoryId}.services.recommended`
        );

        validateServices(
          standard.services.forbidden,
          allowedServices,
          `config.categoryStandards.${categoryId}.services.forbidden`
        );
      }
    }
  }
}

function runValidation() {
  console.log("Running data validation...");

  validateManifest();

  validateSchema(
    "config/global.json",
    "schemas/config.schema.json"
  );

  validateSchema(
    "chains/global.json",
    "schemas/chain-dataset.schema.json"
  );

  validateConfig();
  validateChains();

  console.log("✅ Data validation passed");
}

runValidation();