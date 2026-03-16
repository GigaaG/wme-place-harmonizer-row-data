import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });
const allowedRequirements = [
  "required",
  "recommended",
  "discouraged",
  "forbidden"
];

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function error(message) {
  console.error("ERROR", message);
  process.exit(1);
}

function validateSchema(filePath, schemaPath) {
  const data = loadJSON(filePath);
  const schema = loadJSON(schemaPath);

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    console.error(`Schema validation failed for ${filePath}`);
    console.error(validate.errors);
    process.exit(1);
  }
}

function listJsonFiles(rootDir) {
  const files = [];

  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...listJsonFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files.sort();
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

function validateLockLevel(lockLevel, allowedLockLevels, context) {
  if (lockLevel === undefined) {
    return;
  }

  if (!allowedLockLevels.includes(lockLevel)) {
    error(
      `Invalid lockLevel "${lockLevel}" in ${context}. Allowed values: ${allowedLockLevels.join(", ")}`
    );
  }
}

function validatePresenceRequirement(requirement, context) {
  if (requirement === undefined) {
    return;
  }

  if (!allowedRequirements.includes(requirement)) {
    error(
      `Invalid requirement "${requirement}" in ${context}. Allowed values: ${allowedRequirements.join(", ")}`
    );
  }
}

function validateAddressPolicy(addressPolicy, context) {
  if (!addressPolicy) {
    return;
  }

  for (const fieldName of ["city", "street", "houseNumber"]) {
    validatePresenceRequirement(
      addressPolicy[fieldName],
      `${context}.${fieldName}`
    );
  }
}

function validatePhoneFormatting(phoneFormatting, context) {
  if (!phoneFormatting) {
    return;
  }

  const allowedFormatStyles = ["national", "international"];

  if (
    phoneFormatting.formatStyle !== undefined &&
    !allowedFormatStyles.includes(phoneFormatting.formatStyle)
  ) {
    error(
      `Invalid formatStyle "${phoneFormatting.formatStyle}" in ${context}.formatStyle. Allowed values: ${allowedFormatStyles.join(", ")}`
    );
  }

  if (phoneFormatting.validationPatterns) {
    for (const pattern of phoneFormatting.validationPatterns) {
      try {
        new RegExp(pattern);
      } catch (validationError) {
        const message =
          validationError instanceof Error
            ? validationError.message
            : "Unknown regex error";

        error(
          `Invalid regex "${pattern}" in ${context}.validationPatterns: ${message}`
        );
      }
    }
  }
}

function validateUrlFormatting(urlFormatting, context) {
  if (!urlFormatting) {
    return;
  }

  if (urlFormatting.validationPatterns) {
    for (const pattern of urlFormatting.validationPatterns) {
      try {
        new RegExp(pattern);
      } catch (validationError) {
        const message =
          validationError instanceof Error
            ? validationError.message
            : "Unknown regex error";

        error(
          `Invalid regex "${pattern}" in ${context}.validationPatterns: ${message}`
        );
      }
    }
  }
}

function validateChainDataset(chains, context, sdkValues) {
  const allowedServices = sdkValues.services;
  const allowedLockLevels = sdkValues.lockLevels;

  if (!Array.isArray(chains.items)) {
    error(`${context} missing items array`);
  }

  for (const chain of chains.items) {
    validateServices(
      chain.standard?.services,
      allowedServices,
      `${context} chain ${chain.id} standard.services`
    );

    validateLockLevel(
      chain.policy?.lockLevel,
      allowedLockLevels,
      `${context} chain ${chain.id} policy.lockLevel`
    );

    if (chain.policy?.services) {
      const services = chain.policy.services;

      validateServices(
        services.required,
        allowedServices,
        `${context} chain ${chain.id} policy.services.required`
      );

      validateServices(
        services.recommended,
        allowedServices,
        `${context} chain ${chain.id} policy.services.recommended`
      );

      validateServices(
        services.discouraged,
        allowedServices,
        `${context} chain ${chain.id} policy.services.discouraged`
      );

      validateServices(
        services.forbidden,
        allowedServices,
        `${context} chain ${chain.id} policy.services.forbidden`
      );
    }

    validateAddressPolicy(
      chain.policy?.address,
      `${context} chain ${chain.id} policy.address`
    );
    validatePresenceRequirement(
      chain.policy?.phone,
      `${context} chain ${chain.id} policy.phone`
    );
    validatePresenceRequirement(
      chain.policy?.url,
      `${context} chain ${chain.id} policy.url`
    );
    validatePresenceRequirement(
      chain.policy?.openingHours,
      `${context} chain ${chain.id} policy.openingHours`
    );
    validatePresenceRequirement(
      chain.policy?.navigationPoints,
      `${context} chain ${chain.id} policy.navigationPoints`
    );
    validatePresenceRequirement(
      chain.policy?.externalProviderIds,
      `${context} chain ${chain.id} policy.externalProviderIds`
    );
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

    if ("required" in fileInfo && typeof fileInfo.required !== "boolean") {
      error(`Manifest entry for ${fileKey} has non-boolean 'required' value`);
    }

    if (!fs.existsSync(filePath)) {
      error(`Manifest references missing file: ${filePath}`);
    }
  }
}

function validateConfigObject(config, context, sdkValues) {
  const allowedGeometry = sdkValues.geometry;
  const allowedServices = sdkValues.services;
  const allowedLockLevels = sdkValues.lockLevels;
  const allowedSeverity = ["info", "warning", "error"];

  validatePhoneFormatting(config.formatting?.phone, `${context}.formatting.phone`);
  validateUrlFormatting(config.formatting?.url, `${context}.formatting.url`);

  if (config.rules) {
    for (const [ruleId, rule] of Object.entries(config.rules)) {
      if (!allowedSeverity.includes(rule.severity)) {
        error(
          `Invalid severity "${rule.severity}" in ${context}.rules.${ruleId}. Allowed values: ${allowedSeverity.join(", ")}`
        );
      }
    }
  }

  if (config.categoryStandards) {
    for (const [categoryId, standard] of Object.entries(config.categoryStandards)) {
      validateLockLevel(
        standard.lockLevel,
        allowedLockLevels,
        `${context}.categoryStandards.${categoryId}.lockLevel`
      );

      if (standard.geometry) {
        if (
          standard.geometry.required &&
          !allowedGeometry.includes(standard.geometry.required)
        ) {
          error(
            `Invalid geometry "${standard.geometry.required}" in ${context}.categoryStandards.${categoryId}.geometry.required`
          );
        }

        if (
          standard.geometry.recommended &&
          !allowedGeometry.includes(standard.geometry.recommended)
        ) {
          error(
            `Invalid geometry "${standard.geometry.recommended}" in ${context}.categoryStandards.${categoryId}.geometry.recommended`
          );
        }

        if (standard.geometry.allowed) {
          for (const geometry of standard.geometry.allowed) {
            if (!allowedGeometry.includes(geometry)) {
              error(
                `Invalid geometry "${geometry}" in ${context}.categoryStandards.${categoryId}.geometry.allowed`
              );
            }
          }
        }
      }

      if (standard.services) {
        validateServices(
          standard.services.required,
          allowedServices,
          `${context}.categoryStandards.${categoryId}.services.required`
        );

        validateServices(
          standard.services.recommended,
          allowedServices,
          `${context}.categoryStandards.${categoryId}.services.recommended`
        );

        validateServices(
          standard.services.discouraged,
          allowedServices,
          `${context}.categoryStandards.${categoryId}.services.discouraged`
        );

        validateServices(
          standard.services.forbidden,
          allowedServices,
          `${context}.categoryStandards.${categoryId}.services.forbidden`
        );
      }

      validateAddressPolicy(
        standard.address,
        `${context}.categoryStandards.${categoryId}.address`
      );
      validatePresenceRequirement(
        standard.phone,
        `${context}.categoryStandards.${categoryId}.phone`
      );
      validatePresenceRequirement(
        standard.url,
        `${context}.categoryStandards.${categoryId}.url`
      );
      validatePresenceRequirement(
        standard.openingHours,
        `${context}.categoryStandards.${categoryId}.openingHours`
      );
      validatePresenceRequirement(
        standard.navigationPoints,
        `${context}.categoryStandards.${categoryId}.navigationPoints`
      );
      validatePresenceRequirement(
        standard.externalProviderIds,
        `${context}.categoryStandards.${categoryId}.externalProviderIds`
      );
    }
  }
}

function ensureUniqueStrings(values, context) {
  const seen = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      error(`Duplicate value "${value}" found in ${context}`);
    }

    seen.add(value);
  }
}

function validateChainDuplicates(chains, context) {
  if (!Array.isArray(chains.items)) {
    error(`${context} missing items array`);
  }

  const seenChainIds = new Set();

  for (const chain of chains.items) {
    if (seenChainIds.has(chain.id)) {
      error(`Duplicate chain id "${chain.id}" found in ${context}`);
    }

    seenChainIds.add(chain.id);

    const aliases = chain.match?.aliases ?? [];
    ensureUniqueStrings(
      aliases,
      `${context} chain ${chain.id} match.aliases`
    );

    const canonicalName = chain.canonicalName?.trim().toLowerCase();
    for (const alias of aliases) {
      if (alias.trim().toLowerCase() === canonicalName) {
        error(
          `Alias "${alias}" in ${context} chain ${chain.id} duplicates canonicalName "${chain.canonicalName}"`
        );
      }
    }

    const regexList = chain.match?.regex ?? [];
    ensureUniqueStrings(
      regexList,
      `${context} chain ${chain.id} match.regex`
    );
  }
}

function runValidation() {
  const sdkValues = loadJSON("reference/sdk-values.json");

  console.log("Running data validation...");

  validateManifest();

  for (const filePath of listJsonFiles("config")) {
    validateSchema(filePath, "schemas/config.schema.json");
    validateConfigObject(loadJSON(filePath), filePath, sdkValues);
  }

  for (const filePath of listJsonFiles("chains")) {
    const dataset = loadJSON(filePath);

    validateSchema(filePath, "schemas/chain-dataset.schema.json");
    validateChainDataset(dataset, filePath, sdkValues);
    validateChainDuplicates(dataset, filePath);
  }

  console.log("OK Data validation passed");
}

runValidation();
