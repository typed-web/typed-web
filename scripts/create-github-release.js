import * as cp from "node:child_process";
import { createRelease } from "./utils/github-releases.js";
import { isValidVersion } from "./utils/semver.js";

const tag = process.argv[2];

// If no tag provided, print usage and exit
if (tag === undefined) {
  console.error("Usage:");
  console.error("  node create-github-release.js <tag>");
  process.exit(1);
}

// Parse and validate the tag
const [packageName, version] = tag.split("@");
if (!packageName || !version || !isValidVersion(version)) {
  console.error(`Invalid tag: "${tag}"`);
  process.exit(1);
}

// Verify we are on the right tag
const currentTags = cp.execSync("git tag --points-at HEAD").toString().trim().split("\n");
if (!currentTags.includes(tag)) {
  console.error(`Tag "${tag}" does not point to HEAD`);
  process.exit(1);
}

// Create the GitHub Release
console.log(`Creating GitHub Release for ${tag} ...`);
console.log();

const url = await createRelease(packageName, version);
console.log(`Done, see ${url}`);
console.log();
