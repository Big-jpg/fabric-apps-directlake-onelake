import { describe, expect, it } from "vitest";
import { appMetadata } from "@/config/app-metadata";
import { columnMetadata, tableInventory } from "./table-inventory";

describe("tableInventory", () => {
  it("uses the configured semantic model connection", () => {
    expect(tableInventory().connection).toBe(appMetadata.semanticModelConnection);
  });

  it("loads the table inventory DAX query", () => {
    expect(tableInventory().query).toContain("INFO.VIEW.TABLES()");
  });

  it("keeps metadata keyed by exact query output names", () => {
    expect(Object.keys(columnMetadata)).toEqual(["[TableName]", "[Description]", "[IsHidden]", "[DataCategory]"]);
  });
});
