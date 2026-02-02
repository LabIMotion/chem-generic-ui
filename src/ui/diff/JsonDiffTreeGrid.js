import React, { useMemo, useRef, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// Build tree data for nested objects and arrays
const buildTreeData = (oldJson, newJson, parentKey = "") => {
  const nodes = [];
  const allKeys = new Set([
    ...Object.keys(oldJson || {}),
    ...Object.keys(newJson || {})
  ]);

  allKeys.forEach((key) => {
    const oldVal = oldJson?.[key];
    const newVal = newJson?.[key];
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    let change = "same";
    if (oldVal !== newVal) {
      change = oldVal === undefined ? "added" :
               newVal === undefined ? "removed" :
               "updated";
    }

    // Handle arrays
    if (Array.isArray(oldVal) || Array.isArray(newVal)) {
      const length = Math.max(
        Array.isArray(oldVal) ? oldVal.length : 0,
        Array.isArray(newVal) ? newVal.length : 0
      );
      const children = [];
      for (let i = 0; i < length; i++) {
        children.push(...buildTreeData(
          oldVal?.[i] ?? {},
          newVal?.[i] ?? {},
          `${fullKey}[${i}]`
        ));
      }
      nodes.push({
        key: fullKey,
        oldValue: "(array)",
        newValue: "(array)",
        change,
        children
      });
    }
    // Handle nested objects
    else if ((oldVal && typeof oldVal === "object") || (newVal && typeof newVal === "object")) {
      const children = buildTreeData(
        oldVal && typeof oldVal === "object" ? oldVal : {},
        newVal && typeof newVal === "object" ? newVal : {},
        fullKey
      );
      nodes.push({
        key: fullKey,
        oldValue: "(object)",
        newValue: "(object)",
        change,
        children
      });
    }
    // Primitive values
    else {
      nodes.push({
        key: fullKey,
        oldValue: oldVal ?? "",
        newValue: newVal ?? "",
        change
      });
    }
  });

  return nodes;
};

export default function JsonDiffTreeGrid({ oldJson, newJson }) {
  const gridRef = useRef();
  const [quickFilterText, setQuickFilterText] = useState("");
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    const data = buildTreeData(oldJson, newJson);
    setRowData(data);
  }, [oldJson, newJson]);

  const columnDefs = useMemo(() => [
    { field: "key", headerName: "Key", flex: 2 },
    { field: "oldValue", headerName: "Old Value", flex: 1 },
    { field: "newValue", headerName: "New Value", flex: 1 },
    { field: "change", headerName: "Change", flex: 1 }
  ], []);

  const getRowStyle = (params) => {
    switch (params.data.change) {
      case "added": return { backgroundColor: "#d4edda" };
      case "removed": return { backgroundColor: "#f8d7da" };
      case "updated": return { backgroundColor: "#fff3cd" };
      default: return {};
    }
  };

  const onFilterTextBoxChanged = (e) => {
    setQuickFilterText(e.target.value);
    gridRef.current.api.setQuickFilter(e.target.value);
  };

  return (
    <div style={{ width: "100%", height: 500 }}>
      <input
        type="text"
        placeholder="Quick filter..."
        onChange={onFilterTextBoxChanged}
        style={{ marginBottom: "10px", width: "100%", padding: "5px" }}
      />
      <div className="ag-theme-alpine" style={{ width: "100%", height: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          treeData={true}
          animateRows={true}
          getDataPath={(data) => data.key.split(".")}
          getRowStyle={getRowStyle}
          defaultColDef={{ sortable: true, filter: true, flex: 1 }}
        />
      </div>
    </div>
  );
}
