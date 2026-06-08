import { appMetadata } from "@/config/app-metadata";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import baseQuery from "./table-inventory.dax?raw";

const connection = appMetadata.semanticModelConnection;

export const columnMetadata: ColumnMetadataMap = {
  "[TableName]": {
    name: "TableName",
    displayName: "Table",
  },
  "[Description]": {
    name: "Description",
    displayName: "Description",
  },
  "[IsHidden]": {
    name: "IsHidden",
    displayName: "Hidden",
  },
  "[DataCategory]": {
    name: "DataCategory",
    displayName: "Category",
  },
};

export function tableInventory() {
  return { connection, query: baseQuery, columnMetadata };
}
