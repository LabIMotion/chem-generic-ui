import React, { useState } from "react";
import { create } from "jsondiffpatch";
import { diffChars } from "diff";

// Initialize jsondiffpatch with array handling
const jsondiffpatch = create({
  objectHash: (obj) => obj?.key || JSON.stringify(obj), // Match array items by "key"
  arrays: { detectMove: true },
});

const colorMap = {
  added: "#d4edda",
  removed: "#f8d7da",
  modified: "#fff3cd",
};

// Inline string diff
const InlineDiff = ({ oldStr = "", newStr = "" }) => {
  const changes = diffChars(oldStr, newStr);
  return (
    <span>
      {changes.map((part, index) => {
        const style = {
          backgroundColor: part.added
            ? colorMap.added
            : part.removed
            ? colorMap.removed
            : "transparent",
        };
        return (
          <span key={index} style={style}>
            {part.value}
          </span>
        );
      })}
    </span>
  );
};

// Single row renderer
const DiffRow = ({
  keyName,
  oldValue,
  newValue,
  delta,
  level = 0,
  showOnlyChanges,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => setCollapsed(!collapsed);

  const isComplex = (val) => val && typeof val === "object";

  const changed = oldValue !== newValue || !!delta;
  if (showOnlyChanges && !changed) return null;

  // Handle primitive values
  if (!isComplex(oldValue) && !isComplex(newValue)) {
    return (
      <tr>
        <td style={{ paddingLeft: level * 16, padding: "8px" }}>{keyName}</td>
        <td
          style={{
            backgroundColor: oldValue !== newValue ? colorMap.removed : "transparent",
            padding: "8px",
            wordBreak: "break-word"
          }}
        >
          {typeof oldValue === "string" && oldValue !== newValue ? (
            <InlineDiff oldStr={oldValue} newStr="" />
          ) : (
            JSON.stringify(oldValue)
          )}
        </td>
        <td
          style={{
            backgroundColor: oldValue !== newValue ? colorMap.added : "transparent",
            padding: "8px",
            wordBreak: "break-word"
          }}
        >
          {typeof newValue === "string" && oldValue !== newValue ? (
            <InlineDiff oldStr="" newStr={newValue} />
          ) : (
            JSON.stringify(newValue)
          )}
        </td>
      </tr>
    );
  }

  // Handle arrays or objects
  const oldKeys = Array.isArray(oldValue)
    ? oldValue.map((_, i) => i)
    : Object.keys(oldValue || {});
  const newKeys = Array.isArray(newValue)
    ? newValue.map((_, i) => i)
    : Object.keys(newValue || {});
  const allKeys = Array.from(new Set([...oldKeys, ...newKeys]));

  const hasNestedChanges = allKeys.some(
    (key) => oldValue?.[key] !== newValue?.[key]
  );
  if (showOnlyChanges && !hasNestedChanges) return null;

  return (
    <>
      <tr>
        <td
          style={{
            paddingLeft: level * 16,
            fontWeight: "bold",
            cursor: "pointer",
            padding: "8px"
          }}
          onClick={toggleCollapse}
        >
          {collapsed ? "▶" : "▼"} {keyName}
        </td>
        <td colSpan={2} style={{ padding: "8px" }}></td>
      </tr>
      {!collapsed &&
        allKeys.map((key) => (
          <DiffRow
            key={key}
            keyName={key}
            oldValue={oldValue?.[key]}
            newValue={newValue?.[key]}
            delta={delta?.[key]}
            level={level + 1}
            showOnlyChanges={showOnlyChanges}
          />
        ))}
    </>
  );
};

const JsonDiffCompact = ({ oldJson, newJson, showOnlyChanges = false }) => {
  const delta = jsondiffpatch.diff(oldJson, newJson);

  return (
    <div style={{
      overflow: "auto",
      fontFamily: "monospace",
      maxHeight: "100%",
      border: "1px solid #dee2e6",
      borderRadius: "0.375rem"
    }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa" }}>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "8px" }}>Key</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "8px" }}>Old</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "8px" }}>New</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys({ ...oldJson, ...newJson }).map((key) => (
            <DiffRow
              key={key}
              keyName={key}
              oldValue={oldJson[key]}
              newValue={newJson[key]}
              delta={delta?.[key]}
              showOnlyChanges={showOnlyChanges}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JsonDiffCompact;
