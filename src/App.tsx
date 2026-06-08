import { Database } from "lucide-react";
import { appMetadata } from "@/config/app-metadata";
import { TableInventoryShowcase } from "@/components/semantic-model/TableInventoryShowcase";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Database className="icon-size-300" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-400 font-bold leading-400 text-foreground">{appMetadata.dashboardTitle}</h1>
              <p className="text-200 font-semibold uppercase tracking-wide text-muted-foreground">Fabric semantic model app</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-200 font-semibold text-muted-foreground">
            <span className="rounded-full border border-border bg-background px-3 py-1">{appMetadata.workspaceName}</span>
            <span className="rounded-full border border-border bg-background px-3 py-1">{appMetadata.semanticModelConnection}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">
        <TableInventoryShowcase />
      </main>
    </div>
  );
}

export default App;
