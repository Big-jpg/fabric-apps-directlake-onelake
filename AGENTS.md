# Agent Instructions

## Purpose

This repo is a configurable React starter for Microsoft Fabric Apps backed by a Power BI semantic model. The default experience is intentionally small: it reads the configured semantic model and renders an animated inventory of all model tables.

Keep the starter generic. Do not add sample business data, mock data, sales-specific logic, write-back flows, or external data sources unless the user explicitly changes the product direction.

## Integration Config

The user creates a local `app.integration.json` from `app.integration.template.json`.

```powershell
copy app.integration.template.json app.integration.json
# Edit app.integration.json with real workspace, semantic model, and app values.
npm run configure
npm run fabric:generate
```

`app.integration.json` is ignored by Git. `npm run configure` regenerates:

- `fabric.yaml`
- `rayfin/rayfin.yml`
- `src/config/app-metadata.ts`

`npm run fabric:generate` regenerates `src/fabric.generated.ts`.

Do not hand-edit those generated files for model identity changes; update `app.integration.json` and regenerate.

## Query Organization

Generic starter queries live under:

```txt
src/queries/semantic-model/
```

Each query surface gets a `.dax` file and a matching TypeScript factory. Factory functions import DAX with `?raw` and return:

```ts
{
  connection,
  query,
  columnMetadata,
}
```

Use `appMetadata.semanticModelConnection` for the connection value.

Column metadata must be keyed by exact query output column names from the Fabric CLI result. Do not guess keys. For this starter, `table-inventory.dax` was validated to return:

- `[TableName]`
- `[Description]`
- `[IsHidden]`
- `[DataCategory]`

## Data Rules

- Never use mock, fake, hardcoded, or local data as a substitute for the semantic model.
- Never silently add external data sources.
- Do not ask the user to describe the schema; use DAX metadata queries where possible.
- Prefer `INFO.VIEW.*` functions for read-level schema discovery.
- Use the local CLI script, not `npx fabric-app-data`, for query execution:

```powershell
npm run fabric:query -- <alias> --file src/queries/semantic-model/table-inventory.dax --limit 20
```

## React Data Pattern

Components call a query factory and then `useSemanticModelQuery`:

```tsx
const { connection, query, columnMetadata } = tableInventory();
const { data, isLoading, error } = useSemanticModelQuery({ connection, query });
```

When data succeeds, convert the SDK `QueryTable` with `toDataTable(data.table, columnMetadata)`. Custom React components can then use normalized column metadata and rows.

Handle all async states:

- Loading
- SDK/network error
- `data.status === "error"`
- Empty results
- Success

## Styling

Use Tailwind v4 classes and design tokens from `src/global.css`. The starter uses custom React/Tailwind/framer-motion components by default.

Do not reintroduce `@microsoft/fabric-visuals`, `VegaVisual`, `@microsoft/fabric-datagrid`, or `DataGrid` unless the user explicitly chooses that approach.

## Validation

Run code checks locally:

```powershell
npm run lint
npm test
npm run build
```

The app depends on Fabric embedded auth and the parent-frame query bridge. Plain localhost validates compilation only. For real browser validation, use:

```powershell
npm run test:fabric
```

The first portal run may require the user to sign in. Do not automate credentials.

## Deployment

Use:

```powershell
npx rayfin up
```

The build command regenerates `src/fabric.generated.ts`, runs TypeScript, builds Vite, and deploys static content through Rayfin.
