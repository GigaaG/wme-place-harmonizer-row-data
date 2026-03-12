import fs from "node:fs";
import path from "node:path";

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function error(message) {
  console.error("❌", message);
  process.exit(1);
}

function validateServices(services, allowedServices, context) {
  if (!services) return;

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

function runValidation() {
  console.log("Running data validation…");

  validateChains();

  console.log("✅ Data validation passed");
}

runValidation();