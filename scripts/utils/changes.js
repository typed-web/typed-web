import { fileExists, readFile } from "./fs.js";
import { getPackageFile } from "./packages.js";

/** @typedef {{ version: string; date?: Date; body: string }} Changes */
/** @typedef {Record<string, Changes>} AllChanges */

/** @type (packageName: string) => AllChanges | null */
export function getAllChanges(packageName) {
  const changelogFile = getPackageFile(packageName, "CHANGELOG.md");

  if (!fileExists(changelogFile)) {
    return null;
  }

  const changelog = readFile(changelogFile);
  const parser = /^## ([a-z\d\.\-]+)(?: \(([^)]+)\))?$/gim;

  /** @type {AllChanges} */
  const result = {};

  let match;
  while ((match = parser.exec(changelog))) {
    const [, versionString, dateString] = match;
    const lastIndex = parser.lastIndex;
    const version = versionString.startsWith("v") ? versionString.slice(1) : versionString;
    const date = dateString ? new Date(dateString) : undefined;
    const nextMatch = parser.exec(changelog);
    const body = changelog.slice(lastIndex, nextMatch ? nextMatch.index : undefined).trim();
    result[version] = { version, date, body };
    parser.lastIndex = lastIndex;
  }

  return result;
}

/** @type (packageName: string, version: string) => Changes | null */
export function getChanges(packageName, version) {
  const allChanges = getAllChanges(packageName);

  if (allChanges !== null) {
    return allChanges[version] ?? null;
  }

  return null;
}
