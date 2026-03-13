import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import zlib from "node:zlib";

const outputPath = path.resolve("reference", "sdk-values.json");
const defaultTypingsUrl =
  "https://web-assets.waze.com/wme_sdk_docs/production/latest/wme-sdk-typings.tgz";
const archiveOverridePath = process.env.WME_SDK_TYPINGS_ARCHIVE_PATH;
const archiveSource = archiveOverridePath ?? defaultTypingsUrl;

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          resolve(download(response.headers.location));
          return;
        }

        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download SDK typings archive from ${url}: HTTP ${response.statusCode}`
            )
          );
          return;
        }

        const chunks = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });
        response.on("end", () => {
          resolve(Buffer.concat(chunks));
        });
        response.on("error", reject);
      })
      .on("error", reject);
  });
}

function loadArchiveBuffer(source) {
  if (!archiveOverridePath) {
    return download(source);
  }

  return Promise.resolve(fs.readFileSync(source));
}

function readNullTerminatedString(buffer) {
  const nullIndex = buffer.indexOf(0);
  const slice = nullIndex === -1 ? buffer : buffer.subarray(0, nullIndex);
  return slice.toString("utf8").trim();
}

function extractTarEntry(gzipBuffer, entryPath) {
  const tarBuffer = zlib.gunzipSync(gzipBuffer);
  let offset = 0;

  while (offset + 512 <= tarBuffer.length) {
    const header = tarBuffer.subarray(offset, offset + 512);

    if (header.every((byte) => byte === 0)) {
      break;
    }

    const name = readNullTerminatedString(header.subarray(0, 100));
    const sizeText = readNullTerminatedString(header.subarray(124, 136));
    const size = Number.parseInt(sizeText || "0", 8);
    const contentStart = offset + 512;
    const contentEnd = contentStart + size;

    if (name === entryPath) {
      return tarBuffer.subarray(contentStart, contentEnd);
    }

    offset = contentStart + Math.ceil(size / 512) * 512;
  }

  throw new Error(`Archive entry not found: ${entryPath}`);
}

function extractDeclaredConstValues(sourceText, constName) {
  const declarationPattern = new RegExp(
    `export declare const ${constName}: \\{([\\s\\S]*?)\\n\\};`
  );
  const match = sourceText.match(declarationPattern);

  if (!match) {
    throw new Error(`Could not find SDK declaration for ${constName}`);
  }

  const values = [];
  const valuePattern = /readonly\s+[A-Z0-9_]+:\s+"([A-Z0-9_]+)";/g;

  for (const valueMatch of match[1].matchAll(valuePattern)) {
    values.push(valueMatch[1]);
  }

  if (values.length === 0) {
    throw new Error(`No values found in SDK declaration for ${constName}`);
  }

  return values;
}

function extractVenueGeometryValues(sourceText) {
  const venueMatch = sourceText.match(
    /export interface Venue\s*\{[\s\S]*?\bgeometry:\s*([A-Za-z0-9_$]+)\s*\|\s*([A-Za-z0-9_$]+);/
  );

  if (!venueMatch) {
    throw new Error("Could not determine venue geometry types from SDK typings");
  }

  return [venueMatch[1], venueMatch[2]].map((value) =>
    value.replace(/\$\d+$/, "").toLowerCase()
  );
}

function extractLockLevels(sourceText) {
  const userRankMatch = sourceText.match(/type UserRank = ([^;]+);/);

  if (!userRankMatch) {
    throw new Error("Could not determine UserRank values from SDK typings");
  }

  return userRankMatch[1]
    .split("|")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value) && value > 0);
}

async function main() {
  const archiveBuffer = await loadArchiveBuffer(archiveSource);
  const typingsSource = extractTarEntry(archiveBuffer, "package/index.d.ts")
    .toString("utf8");

  const sdkValues = {
    geometry: extractVenueGeometryValues(typingsSource),
    services: [
      ...extractDeclaredConstValues(typingsSource, "GENERAL_SERVICE_TYPE"),
      ...extractDeclaredConstValues(typingsSource, "PARKING_LOT_SERVICE_TYPE")
    ].filter((value, index, values) => values.indexOf(value) === index),
    lockLevels: extractLockLevels(typingsSource),
    mainCategories: extractDeclaredConstValues(typingsSource, "VENUE_MAIN_CATEGORY")
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(sdkValues, null, 2) + "\n", "utf8");

  console.log(`Wrote ${outputPath} from ${archiveSource}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
