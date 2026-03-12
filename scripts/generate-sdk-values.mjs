import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve("reference", "sdk-values.json");

const sdkValues = {
  geometry: [
    "point",
    "polygon"
  ],
  services: [
    "DRIVETHROUGH",
    "TAKE_AWAY",
    "DINE_IN",
    "RESTROOMS",
    "PARKING_FOR_CUSTOMERS",
    "WIFI",
    "DELIVERIES"
  ],
  mainCategories: [
    "FOOD_AND_DRINK",
    "PARKING_LOT",
    "PROFESSIONAL_AND_PUBLIC",
    "SHOPPING_AND_SERVICES"
  ]
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(sdkValues, null, 2) + "\n", "utf8");

console.log(`Wrote ${outputPath}`);