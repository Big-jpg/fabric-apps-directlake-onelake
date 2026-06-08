#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = resolve(projectRoot, process.argv[2] ?? "app.integration.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function assertString(value, path) {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`Missing integration config value: ${path}`);
  }

  if (/^<.+>$/.test(value.trim())) {
    fail(
      [
        `Integration config still contains a template placeholder: ${path} = ${value}`,
        "",
        "Edit app.integration.json with real Fabric values, then rerun:",
        "  npm run configure",
        "  npm run fabric:generate",
        "",
        "Required Fabric values:",
        "  fabric.workspaceId",
        "  fabric.workspaceName",
        "  fabric.semanticModel.alias",
        "  fabric.semanticModel.name",
        "  fabric.semanticModel.itemId",
      ].join("\n"),
    );
  }
  return value.trim();
}

function yamlString(value) {
  if (/^[A-Za-z0-9_.:/-]+$/.test(value)) {
    return value;
  }
  return JSON.stringify(value);
}

function tsString(value) {
  return JSON.stringify(value);
}

if (!existsSync(configPath)) {
  fail(
    [
      `Integration config not found: ${configPath}`,
      "",
      "Create a local integration config first:",
      "  copy app.integration.template.json app.integration.json",
      "",
      "Then edit app.integration.json with real Fabric values and rerun:",
      "  npm run configure",
      "  npm run fabric:generate",
    ].join("\n"),
  );
}

const config = JSON.parse(readFileSync(configPath, "utf8"));

const appId = assertString(config.app?.id, "app.id");
const appName = assertString(config.app?.name, "app.name");
const dashboardTitle = assertString(config.app?.dashboardTitle, "app.dashboardTitle");
const workspaceId = assertString(config.fabric?.workspaceId, "fabric.workspaceId");
const workspaceName = assertString(config.fabric?.workspaceName, "fabric.workspaceName");
const fabricPortalUrl = assertString(config.fabric?.portalUrl, "fabric.portalUrl");
const semanticModelAlias = assertString(config.fabric?.semanticModel?.alias, "fabric.semanticModel.alias");
const semanticModelName = assertString(config.fabric?.semanticModel?.name, "fabric.semanticModel.name");
const semanticModelItemId = assertString(config.fabric?.semanticModel?.itemId, "fabric.semanticModel.itemId");
const allowedRedirectUris = Array.isArray(config.auth?.allowedRedirectUris)
  ? config.auth.allowedRedirectUris.map((uri, index) => assertString(uri, `auth.allowedRedirectUris[${index}]`))
  : ["http://localhost:5173"];

const fabricYaml = `activeProfile: default
profiles:
  default:
    semanticModels:
      ${semanticModelAlias}:
        workspaceId: ${workspaceId}
        itemId: ${semanticModelItemId}
`;

const rayfinYaml = `id: ${yamlString(appId)}
name: ${yamlString(appName)}
version: 1.0.0
services:
  auth:
    enabled: true
    fabric:
      enabled: true
    allowedRedirectUris:
${allowedRedirectUris.map((uri) => `      - ${yamlString(uri)}`).join("\n")}
  data:
    enabled: false
  storage:
    enabled: false
  staticHosting:
    enabled: true
    folder: dist
    buildCommand: npm run build:fabric
    indexDocument: index.html
  functions:
    enabled: false
`;

const appMetadata = `// Generated from app.integration.json by \`npm run configure\`.
// Keep app/workspace/model identity in app.integration.json, then regenerate.

export const appMetadata = {
  appId: ${tsString(appId)},
  appName: ${tsString(appName)},
  dashboardTitle: ${tsString(dashboardTitle)},
  workspaceId: ${tsString(workspaceId)},
  workspaceName: ${tsString(workspaceName)},
  fabricPortalUrl: ${tsString(fabricPortalUrl)},
  semanticModelConnection: ${tsString(semanticModelAlias)},
  semanticModelName: ${tsString(semanticModelName)},
  semanticModelItemId: ${tsString(semanticModelItemId)},
} as const;
`;

const rayfinDirectory = resolve(projectRoot, "rayfin");
const appConfigDirectory = resolve(projectRoot, "src", "config");

mkdirSync(rayfinDirectory, { recursive: true });
mkdirSync(appConfigDirectory, { recursive: true });

writeFileSync(resolve(projectRoot, "fabric.yaml"), fabricYaml);
writeFileSync(resolve(rayfinDirectory, "rayfin.yml"), rayfinYaml);
writeFileSync(resolve(appConfigDirectory, "app-metadata.ts"), appMetadata);

console.log(`Applied integration config from ${configPath}`);
console.log(`- Fabric workspace: ${workspaceName} (${workspaceId})`);
console.log(`- Semantic model: ${semanticModelName} as ${semanticModelAlias}`);
console.log(`- App: ${appName} (${appId})`);
