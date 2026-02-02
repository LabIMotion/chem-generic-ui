import React, { useState, useMemo } from "react";

// Colors for diff
const colorMap = {
  added: "#d4edda",
  removed: "#f8d7da",
  updated: "#fff3cd",
  same: "transparent"
};

// Recursive tree builder
const buildTree = (oldObj, newObj, key = "") => {
  const nodes = [];
  const allKeys = new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {})
  ]);

  allKeys.forEach((k) => {
    const oldVal = oldObj?.[k];
    const newVal = newObj?.[k];
    const fullKey = key ? `${key}.${k}` : k;

    let change = "same";
    if (oldVal !== newVal) {
      change =
        oldVal === undefined
          ? "added"
          : newVal === undefined
          ? "removed"
          : "updated";
    }

    if (Array.isArray(oldVal) || Array.isArray(newVal)) {
      const length = Math.max(
        Array.isArray(oldVal) ? oldVal.length : 0,
        Array.isArray(newVal) ? newVal.length : 0
      );
      const children = [];
      for (let i = 0; i < length; i++) {
        const arrayKey = `${fullKey}[${i}]`;
        const oldItem = oldVal?.[i] ?? {};
        const newItem = newVal?.[i] ?? {};
        if (
          typeof oldItem === "object" ||
          typeof newItem === "object"
        ) {
          children.push(...buildTree(oldItem, newItem, arrayKey));
        } else {
          // Primitive array items
          children.push({
            key: arrayKey,
            oldValue: oldItem ?? "",
            newValue: newItem ?? "",
            change: oldItem !== newItem ? "updated" : "same"
          });
        }
      }
      nodes.push({
        key: fullKey,
        oldValue: "(array)",
        newValue: "(array)",
        change,
        children
      });
    } else if (
      (oldVal && typeof oldVal === "object") ||
      (newVal && typeof newVal === "object")
    ) {
      const children = buildTree(
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
    } else {
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

// Recursive row
const TreeRow = ({ node, level = 0, filterText, collapseMap, setCollapseMap }) => {
  const collapsed = collapseMap[node.key] ?? true;

  const toggleCollapse = () =>
    setCollapseMap((prev) => ({ ...prev, [node.key]: !collapsed }));

  const matchesFilter =
    !filterText ||
    node.key.includes(filterText) ||
    String(node.oldValue).includes(filterText) ||
    String(node.newValue).includes(filterText);

  if (!matchesFilter) return null;

  return (
    <>
      <tr>
        <td
          style={{
            paddingLeft: level * 16,
            fontWeight: node.children ? "bold" : "normal",
            cursor: node.children ? "pointer" : "default",
            backgroundColor: colorMap[node.change]
          }}
          onClick={node.children ? toggleCollapse : undefined}
        >
          {node.children && (collapsed ? "▶ " : "▼ ")}
          {node.key}
        </td>
        <td style={{ backgroundColor: colorMap[node.change] }}>{node.oldValue}</td>
        <td style={{ backgroundColor: colorMap[node.change] }}>{node.newValue}</td>
        <td style={{ backgroundColor: colorMap[node.change] }}>{node.change}</td>
      </tr>
      {!collapsed &&
        node.children?.map((child, idx) => (
          <TreeRow
            key={idx}
            node={child}
            level={level + 1}
            filterText={filterText}
            collapseMap={collapseMap}
            setCollapseMap={setCollapseMap}
          />
        ))}
    </>
  );
};

// Main component
export default function JsonDiffTree({ oldJson, newJson }) {
  const [filterText, setFilterText] = useState("");
  const [collapseMap, setCollapseMap] = useState({});

  const treeData = useMemo(() => buildTree(oldJson, newJson), [oldJson, newJson]);

  const setAllCollapse = (collapsed) => {
    const map = {};
    const traverse = (nodes) => {
      nodes.forEach((node) => {
        if (node.children) {
          map[node.key] = collapsed;
          traverse(node.children);
        }
      });
    };
    traverse(treeData);
    setCollapseMap(map);
  };

  return (
    <div style={{ fontFamily: "monospace" }}>
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Quick filter..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{ flexGrow: 1, padding: "5px" }}
        />
        <button onClick={() => setAllCollapse(false)}>Expand All</button>
        <button onClick={() => setAllCollapse(true)}>Collapse All</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Key</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Old Value</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>New Value</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Change</th>
            </tr>
          </thead>
          <tbody>
            {treeData.map((node, idx) => (
              <TreeRow
                key={idx}
                node={node}
                filterText={filterText}
                collapseMap={collapseMap}
                setCollapseMap={setCollapseMap}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
