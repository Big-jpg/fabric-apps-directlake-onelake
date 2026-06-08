import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Database, EyeOff, Layers3, Table2 } from "lucide-react";
import { appMetadata } from "@/config/app-metadata";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { toDataTable } from "@/lib/to-data-table";
import { tableInventory } from "@/queries/semantic-model/table-inventory";

interface ModelTable {
  name: string;
  description: string;
  isHidden: boolean;
  category: string;
}

export function TableInventoryShowcase() {
  const { connection, query, columnMetadata } = tableInventory();
  const { data, isLoading, error } = useSemanticModelQuery({ connection, query });

  if (isLoading) {
    return <TableInventoryLoading />;
  }

  if (error) {
    return <StatusMessage tone="error">Unable to read semantic model tables: {error.message}</StatusMessage>;
  }

  if (data?.status === "error") {
    return <StatusMessage tone="error">Query error: {data.error.message}</StatusMessage>;
  }

  if (data?.status !== "success") {
    return <StatusMessage>No semantic model metadata returned yet.</StatusMessage>;
  }

  const dataTable = toDataTable(data.table, columnMetadata);
  const tableNameIndex = findColumnIndex(dataTable.columns, "TableName");
  const descriptionIndex = findColumnIndex(dataTable.columns, "Description");
  const hiddenIndex = findColumnIndex(dataTable.columns, "IsHidden");
  const categoryIndex = findColumnIndex(dataTable.columns, "DataCategory");

  const tables = dataTable.rows
    .map((row) => ({
      name: String(row[tableNameIndex] ?? "Unnamed table"),
      description: String(row[descriptionIndex] ?? ""),
      isHidden: row[hiddenIndex] === true || String(row[hiddenIndex]).toLowerCase() === "true",
      category: String(row[categoryIndex] ?? "Regular"),
    }))
    .filter((table) => table.name.trim().length > 0);

  if (tables.length === 0) {
    return <StatusMessage>No tables were returned by the semantic model.</StatusMessage>;
  }

  return <TableInventoryContent tables={tables} />;
}

function TableInventoryContent({ tables }: { tables: ModelTable[] }) {
  const visibleTables = tables.filter((table) => !table.isHidden);
  const hiddenTables = tables.length - visibleTables.length;
  const categories = useMemo(() => Array.from(new Set(tables.map((table) => table.category))).sort(), [tables]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent px-3 py-1 text-200 font-semibold uppercase tracking-wide text-accent-foreground">
                <Database className="icon-size-200" aria-hidden="true" />
                Semantic model starter
              </div>
              <h1 className="mt-5 max-w-3xl text-hero-800 font-bold leading-hero-800 tracking-normal text-foreground">
                Connected to {appMetadata.semanticModelName}
              </h1>
              <p className="mt-3 max-w-2xl text-300 leading-500 text-muted-foreground">
                This starter reads metadata from the configured Fabric semantic model and renders it with custom React components.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricTile label="Total tables" value={tables.length} icon={<Table2 className="icon-size-300" aria-hidden="true" />} />
              <MetricTile label="Visible" value={visibleTables.length} icon={<Layers3 className="icon-size-300" aria-hidden="true" />} />
              <MetricTile label="Hidden" value={hiddenTables} icon={<EyeOff className="icon-size-300" aria-hidden="true" />} />
            </div>
          </div>

          <ModelPulse tables={visibleTables.slice(0, 8)} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-500 font-bold leading-500 text-foreground">Tables</h2>
              <p className="mt-1 text-300 text-muted-foreground">Live table inventory from `INFO.VIEW.TABLES()`.</p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-200 font-semibold text-secondary-foreground">
              {tables.length} total
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {tables.map((table, index) => (
              <motion.article
                key={table.name}
                className="min-w-0 rounded-xl border border-border bg-background p-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(index * 0.025, 0.35) }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-300 font-bold text-foreground">{table.name}</h3>
                    <p className="mt-1 text-200 text-muted-foreground">{table.category || "Regular"}</p>
                  </div>
                  {table.isHidden ? (
                    <span className="rounded-full border border-border bg-muted px-2 py-1 text-100 font-semibold uppercase text-muted-foreground">
                      Hidden
                    </span>
                  ) : null}
                </div>
                {table.description ? <p className="mt-3 text-200 leading-300 text-muted-foreground">{table.description}</p> : null}
              </motion.article>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-400 font-bold leading-400 text-foreground">Categories</h2>
          <div className="mt-4 space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center justify-between rounded-xl bg-background px-3 py-2">
                <span className="text-300 font-semibold text-foreground">{category || "Uncategorized"}</span>
                <span className="text-200 font-semibold text-muted-foreground">
                  {tables.filter((table) => table.category === category).length}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}

function ModelPulse({ tables }: { tables: ModelTable[] }) {
  const displayTables = tables.length > 0 ? tables : [{ name: "Model", description: "", isHidden: false, category: "Regular" }];

  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-border bg-background p-5">
      <div className="absolute inset-x-5 top-5 h-px bg-border" />
      <div className="absolute inset-x-5 bottom-5 h-px bg-border" />
      <div className="relative flex h-full min-h-[240px] flex-col justify-center gap-3">
        {displayTables.map((table, index) => (
          <motion.div
            key={`${table.name}-${index}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 shadow-sm"
            initial={{ opacity: 0.25, x: index % 2 === 0 ? -14 : 14 }}
            animate={{ opacity: [0.45, 1, 0.72], x: 0 }}
            transition={{
              duration: 1.8,
              delay: index * 0.12,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 2.4,
              ease: "easeInOut",
            }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Table2 className="icon-size-200" aria-hidden="true" />
            </span>
            <span className="min-w-0 truncate text-300 font-semibold text-foreground">{table.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MetricTile({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-200 font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <p className="mt-2 font-numeric text-hero-700 font-bold leading-hero-700 text-foreground">{value.toLocaleString("en-AU")}</p>
    </article>
  );
}

function StatusMessage({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "error" }) {
  return (
    <div
      className={
        tone === "error"
          ? "rounded-2xl border border-destructive bg-card px-4 py-3 text-300 text-destructive"
          : "rounded-2xl border border-border bg-card px-4 py-3 text-300 text-muted-foreground"
      }
    >
      {children}
    </div>
  );
}

function TableInventoryLoading() {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm lg:p-8">
      <div className="max-w-xl">
        <div className="h-7 w-48 animate-pulse rounded-full bg-muted" />
        <div className="mt-5 h-10 w-full max-w-lg animate-pulse rounded-xl bg-muted" />
        <div className="mt-3 h-5 w-72 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </section>
  );
}

function findColumnIndex(columns: Array<{ name?: string; displayName?: string }>, name: string) {
  const index = columns.findIndex((column) => column.name === name || column.displayName === name);
  return index >= 0 ? index : 0;
}
