import * as cp from "node:child_process";
import { readFile, readJson, writeFile, writeJson } from "./utils/fs.js";
import { getPackageFile } from "./utils/packages.js";
import { logAndExec } from "./utils/process.js";
import { getNextVersion } from "./utils/semver.js";

const rawArgs = process.argv.slice(2);

if (rawArgs.length === 0) {
  console.error("Usage:");
  console.error("  node tag-release.js <packageName> <releaseType>");
  console.error("  node tag-release.js <package@releaseType> [<package@releaseType> ...]");
  process.exit(1);
}

/** @typedef {{ packageName: string, releaseType: string }} ReleaseInput */

/** @type {ReleaseInput[]} */
const inputs = [];

if (rawArgs.length === 2 && !rawArgs[0].includes("@") && !rawArgs[1].includes("@")) {
  // node tag-release.js <packageName> <releaseType>
  inputs.push({ packageName: rawArgs[0], releaseType: rawArgs[1] });
} else {
  // node tag-release.js <package@releaseType> [<package@releaseType> ...]
  for (const arg of rawArgs) {
    const idx = arg.indexOf("@");
    if (idx <= 0 || idx === arg.length - 1) {
      console.error(`Invalid argument: "${arg}"`);
      console.error("Each argument must be in the form <package@releaseType>");
      process.exit(1);
    }
    const packageName = arg.slice(0, idx);
    const releaseType = arg.slice(idx + 1);
    inputs.push({ packageName, releaseType });
  }
}

// 1) Ensure git staging area is clean
const status = cp.execSync("git status --porcelain").toString();
if (status !== "") {
  console.error("Git staging area is not clean");
  process.exit(1);
}

/** @type {{ packageName: string, currentVersion: string, nextVersion: string, tag: string }[]} */
const releases = [];

// 2) For each package, compute next version, update files, and stage changes
for (const { packageName, releaseType } of inputs) {
  const packageJsonFile = getPackageFile(packageName, "package.json");
  const packageJson = readJson(packageJsonFile);
  const currentVersion = packageJson.version;
  const nextVersion = getNextVersion(currentVersion, releaseType);
  const tag = `${packageName}@${nextVersion}`;

  console.log(`Tagging release ${tag} ...`);

  // 2a) Update package.json with the new release version
  writeJson(packageJsonFile, { ...packageJson, version: nextVersion });
  logAndExec(`git add ${packageJsonFile}`);

  // 2b) Update jsr.json (if applicable) with the new release version
  // let jsrJsonFile = getPackageFile(packageName, 'jsr.json');
  // if (fileExists(jsrJsonFile)) {
  //   let jsrJson = readJson(jsrJsonFile);
  //   writeJson(jsrJsonFile, { ...jsrJson, version: nextVersion });
  //   logAndExec(`git add ${jsrJsonFile}`);
  // }

  // 2c) Swap out "## Unreleased" in CHANGELOG.md with the new release version + date
  const changelogFile = getPackageFile(packageName, "CHANGELOG.md");
  let changelog = readFile(changelogFile);
  const match = /^## Unreleased\n/m.exec(changelog);
  if (match) {
    const [today] = new Date().toISOString().split("T");

    changelog =
      changelog.slice(0, match.index) +
      `## v${nextVersion} (${today})\n` +
      changelog.slice(match.index + match[0].length);

    writeFile(changelogFile, changelog);
    logAndExec(`git add ${changelogFile}`);
  }

  releases.push({ packageName, currentVersion, nextVersion, tag });
}

// 3) Commit and create one tag per release
const commitTitle =
  releases.length === 1
    ? `Release ${releases[0].tag}`
    : `Release ${releases.map((r) => r.tag).join(", ")}`;
const commitBody = releases
  .map((r) => `- ${r.packageName}: ${r.currentVersion} -> ${r.nextVersion}`)
  .join("\n");

logAndExec(`git commit -m "${commitTitle}" -m "${commitBody}"`);

for (const r of releases) {
  logAndExec(`git tag ${r.tag}`);
}

console.log();
