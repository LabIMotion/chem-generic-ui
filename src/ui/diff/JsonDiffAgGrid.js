import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";

const colorMap = {
  added: "#d4edda",
  removed: "#f8d7da",
  updated: "#fff3cd",
  same: "transparent"
};

const buildTreeData = (oldObj, newObj, parentKey = "") => {
  const nodes = [];
  const allKeys = new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {})
  ]);

  allKeys.forEach((k) => {
    const oldVal = oldObj?.[k];
    const newVal = newObj?.[k];
    const fullKey = parentKey ? `${parentKey}.${k}` : k;

    let change = "same";
    if (oldVal !== newVal) {
      change =
        oldVal === undefined
          ? "added"
          : newVal === undefined
          ? "removed"
          : "updated";
    }

    const node = {
      id: fullKey,
      key: fullKey,
      oldValue:
        typeof oldVal === "object" && oldVal !== null ? "(object)" : oldVal ?? "",
      newValue:
        typeof newVal === "object" && newVal !== null ? "(object)" : newVal ?? "",
      change
    };

    // Handle nested object or array
    if (
      (oldVal && typeof oldVal === "object") ||
      (newVal && typeof newVal === "object")
    ) {
      const children = Array.isArray(oldVal) || Array.isArray(newVal)
        ? (oldVal || newVal || []).map((item, i) => {
            const oldItem = Array.isArray(oldVal) ? oldVal[i] : {};
            const newItem = Array.isArray(newVal) ? newVal[i] : {};
            return buildTreeData(oldItem, newItem, `${fullKey}[${i}]`);
          }).flat()
        : buildTreeData(oldVal || {}, newVal || {}, fullKey);
      node.children = children;
    }

    nodes.push(node);
  });

  return nodes;
};

export default function JsonDiffAgGrid({ oldJson, newJson }) {
  const rowData = useMemo(() => buildTreeData(oldJson, newJson), [oldJson, newJson]);

  const columnDefs = [
    { field: "key", rowGroup: true, hide: true },
    { field: "oldValue", headerName: "Old Value" },
    { field: "newValue", headerName: "New Value" },
    { field: "change", headerName: "Change" }
  ];

  return (
    <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        treeData={true}
        animateRows={true}
        groupDefaultExpanded={-1} // all expanded
        getDataPath={(data) => data.key.split(".")}
        autoGroupColumnDef={{
          headerName: "Key",
          cellRendererParams: { suppressCount: true }
        }}
        getRowStyle={(params) => ({
          backgroundColor: colorMap[params.data.change] || "transparent"
        })}
      />
    </div>
  );
}
