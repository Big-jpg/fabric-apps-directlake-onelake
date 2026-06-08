# Architecture

## Overview

This application is a Microsoft Fabric App: a React single-page app embedded inside the Fabric portal as an iframe. It connects to one configured Power BI semantic model and renders a small starter experience that lists every table in that model.

## Data Access Pattern

```txt
TableInventoryShowcase
  -> useSemanticModelQuery({ connection, query })
    -> FabricClient.semanticModel(connection).query(dax)
      -> EmbedFabricApiProxy
        -> Fabric host postMessage bridge
          -> Semantic model executes DAX
            -> QueryTable { columns[], rows[][] }
```

The browser app does not call the `pbidedicated.windows.net` endpoint directly. The Fabric iframe host owns the working query channel.

## Configuration

Local app/model binding starts in `app.integration.json`, created from `app.integration.template.json`.

Running `npm run setup` projects the local config into:

- `fabric.yaml` for the Fabric semantic-model connection.
- `rayfin/rayfin.yml` for Rayfin app identity and redirect URIs.
- `src/config/app-metadata.ts` for frontend labels and the query connection alias.
- `src/fabric.generated.ts`, generated from `fabric.yaml` for the runtime Fabric client.

All projected files are environment-specific and ignored by Git. The tracked source of truth is `app.integration.template.json`; each developer or deployment environment creates its own ignored `app.integration.json` and runs `npm run setup`.

Rayfin-managed `rayfin/.env`, `rayfin/.deployments.json`, and compiled `dist/` output are also local-only generated state.

## Query Surface

The starter ships one generic metadata query:

```txt
src/queries/semantic-model/
├── table-inventory.dax
└── table-inventory.ts
```

`table-inventory.dax` uses `INFO.VIEW.TABLES()` and projects:

- `[TableName]`
- `[Description]`
- `[IsHidden]`
- `[DataCategory]`

The TypeScript factory stores column metadata keyed by those exact CLI output names.

## Component Structure

```txt
src/
├── App.tsx
├── Root.tsx
├── components/
│   ├── auth-gate.component.tsx
│   └── semantic-model/
│       └── TableInventoryShowcase.tsx
├── hooks/
│   └── use-semantic-model-query.ts
├── lib/
│   ├── fabric-client.ts
│   └── to-data-table.ts
└── queries/
    └── semantic-model/
        ├── table-inventory.dax
        └── table-inventory.ts
```

## Styling

- Tailwind CSS v4 with CSS-first tokens in `src/global.css`.
- Light Fabric-friendly palette by default.
- Custom React/Tailwind/framer-motion components, not Power BI visuals.

## Known Limits

1. The app is read-only.
2. Runtime data access requires the Fabric portal embed context.
3. The starter connects to one semantic model at a time.
4. Real model metadata appears only after `app.integration.json`, `fabric.yaml`, and `src/fabric.generated.ts` are generated for a real Fabric workspace and semantic model.
