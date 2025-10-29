import { getChanges } from "./utils/changes.js";
import { getAllPackageNames, packageExists } from "./utils/packages.js";

/** @type {(packageName: string, changes: import('./utils/changes.js').Changes) => void} */
function printPackageChanges(packageName, changes) {
  console.log(`📦 ${packageName}`);
  console.log("─".repeat(50));
  console.log(changes.body);
  console.log();
}

const packageName = process.argv[2];

if (packageName) {
  if (!packageExists(packageName)) {
    console.error(`Error: Package "${packageName}" not found in ./packages`);
    process.exit(1);
  }

  const changes = getChanges(packageName, "Unreleased");

  if (changes) {
    printPackageChanges(packageName, changes);
  } else {
    console.log(`No pending changes found for package "${packageName}"`);
    console.log();
  }
} else {
  let hasChanges = false;

  const packageNames = getAllPackageNames();
  packageNames.forEach((packageName) => {
    const changes = getChanges(packageName, "Unreleased");
    if (changes) {
      hasChanges = true;
      printPackageChanges(packageName, changes);
    }
  });

  if (!hasChanges) {
    console.log("No packages have pending changes");
    console.log();
  }
}
