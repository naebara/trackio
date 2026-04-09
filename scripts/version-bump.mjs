import fs from "node:fs";
import path from "node:path";

const mode = process.argv[2];
const validModes = new Set(["patch", "minor", "year"]);

if (!validModes.has(mode)) {
  console.error("Usage: node scripts/version-bump.mjs <patch|minor|year>");
  process.exit(1);
}

const packageJsonPath = path.join(process.cwd(), "package.json");
const packageLockPath = path.join(process.cwd(), "package-lock.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function bumpVersion(currentVersion, bumpMode) {
  const currentYear = new Date().getFullYear();
  const versionParts = currentVersion.split(".").map(Number);
  let [year, minor, patch] =
    versionParts.length === 3 && versionParts.every(Number.isFinite)
      ? versionParts
      : [currentYear, 0, 0];

  if (bumpMode === "year") {
    return `${currentYear}.0.0`;
  }

  if (year !== currentYear || year < 2000) {
    year = currentYear;
    minor = 0;
    patch = 0;
  }

  if (bumpMode === "minor") {
    return `${year}.${minor + 1}.0`;
  }

  return `${year}.${minor}.${patch + 1}`;
}

const packageJson = readJson(packageJsonPath);
const packageLock = readJson(packageLockPath);
const nextVersion = bumpVersion(packageJson.version, mode);

packageJson.version = nextVersion;
packageLock.version = nextVersion;

if (packageLock.packages?.[""]) {
  packageLock.packages[""].version = nextVersion;
}

writeJson(packageJsonPath, packageJson);
writeJson(packageLockPath, packageLock);

console.log(nextVersion);
