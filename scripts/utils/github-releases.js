import { request } from "@octokit/request";
import { getChanges } from "./changes.js";

const token = process.env.GITHUB_TOKEN;

/** @type (packageName: string, version: string) => Promise<string> */
export async function createRelease(packageName, version) {
  if (token === undefined) {
    console.error("GITHUB_TOKEN environment variable is required to create a GitHub release");
    process.exit(1);
  }

  const tagName = `${packageName}@${version}`;
  const changes = getChanges(packageName, version);

  const response = await request("POST /repos/{owner}/{repo}/releases", {
    headers: {
      authorization: `token ${token}`,
    },
    owner: "typed-web",
    repo: "typed-web",
    tag_name: tagName,
    name: `${packageName} v${version}`,
    body: changes?.body ?? "No changes.",
  });

  if (response.status !== 201) {
    console.error("Failed to create release:", response);
    process.exit(1);
  }

  return response.data.html_url;
}
