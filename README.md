# Fabric Semantic Model Starter

A configurable React starter for building Microsoft Fabric Apps that connect to a Power BI semantic model. The first screen reads the configured semantic model and renders an animated inventory of its tables using live DAX metadata, custom React components, Tailwind CSS, and the Fabric embedded query bridge.

## What It Shows

1. **Fabric Apps can be custom React apps.** The UI is ordinary React, Tailwind, framer-motion, and lucide icons.
2. **The semantic model remains the data contract.** The starter queries metadata with DAX through `@microsoft/fabric-app-data`.
3. **Configuration is centralized.** A local `app.integration.json` controls the app name, workspace, semantic model item, connection alias, and redirect URIs.
4. **The starter is read-only.** It does not include write-back, storage, sample data, or data model-specific logic.

## Starter Screen

The app renders one generic semantic-model explorer:

- Connects to the semantic model alias from `app.integration.json`.
- Runs `src/queries/semantic-model/table-inventory.dax`.
- Uses `INFO.VIEW.TABLES()` to list tables.
- Shows total, visible, hidden, and category counts.
- Animates the connected tables as a simple React element.

## Configure Your Own Semantic Model With A React Frontend

Use this repository as a starter template in your own environment:

<img width="359" height="266" alt="image" src="https://github.com/user-attachments/assets/12462d6a-1d7f-4f32-879c-86ee7035d2fa" />

This repository contains automated build logic from the official Rayfin starter templates. It also includes agent and skill markdown files relevant to Rayfin and Fabric Apps development.

Create a local integration config from the template:

```powershell
copy app.integration.template.json app.integration.json
notepad app.integration.json
```

Fill in:

- `app.id`
- `app.name`
- `app.dashboardTitle`
- `fabric.workspaceId`
- `fabric.workspaceName`
- `fabric.semanticModel.alias`
- `fabric.semanticModel.name`
- `fabric.semanticModel.itemId`
- `auth.allowedRedirectUris`

- `Save the file, close Notepad, and reload your local IDE.`

Ensure local deps are installed:

```powershell
npm install
```

Build local config files

```powershell
npm run setup
```

`npm run setup` writes:

- `fabric.yaml`
- `rayfin/rayfin.yml`
- `src/config/app-metadata.ts`
- `src/fabric.generated.ts`

Those files are generated automatically and must not be committed. Rayfin builds also generate `.env.local` and `.env.fabric`.

Rayfin additionally creates local runtime state during development and deployment:

- `rayfin/.env`
- `rayfin/.deployments.json`
- `dist/`

Those files are generated automatically and must not be committed.
Rayfin build will generate .env.local and .env.fabric files

## Deploy

When prompted, type the Fabric workspace display name you are deploying the app to, for example `Sales_Dev`.

```powershell
npx rayfin up
```

Rayfin runs `npm run build:fabric`, packages the Vite build, and deploys the static app to Fabric.

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4
- framer-motion
- lucide-react
- @microsoft/rayfin-client
- @microsoft/fabric-app-data
- @microsoft/fabric-app-data-embed-client

## License

MIT
