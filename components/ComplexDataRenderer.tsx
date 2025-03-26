// components/ComplexDataRenderer.tsx
import React from "react";

interface ComplexDataRendererProps {
  data: any; // The nested data from console.dir or console.table
  level?: number; // For indentation or nesting depth
}

// Helper function to check if the value is a plain object
function isObject(val: any): boolean {
  return val && typeof val === "object" && !Array.isArray(val);
}

// Helper function to check if the value is an array
function isArray(val: any): boolean {
  return Array.isArray(val);
}

export default function ComplexDataRenderer({
  data,
  level = 0,
}: ComplexDataRendererProps) {
  // Base case: If data is null or a primitive, render it as plain text
  if (data === null || typeof data !== "object") {
    return <span>{String(data)}</span>;
  }

  // Case 1: If data is an array, render it as a collapsible list
  if (isArray(data)) {
    return (
      <details style={{ paddingLeft: `${level * 12}px` }}>
        <summary>Array[{data.length}]</summary>
        <div style={{ marginLeft: "20px" }}>
          {data.map((item: any, idx: number) => (
            <div key={idx}>
              <strong>[{idx}]: </strong>
              <ComplexDataRenderer data={item} level={level + 1} />
            </div>
          ))}
        </div>
      </details>
    );
  }

  // Case 2: If data is an object, render its properties as key-value pairs
  if (isObject(data)) {
    const entries = Object.entries(data);
    return (
      <details style={{ paddingLeft: `${level * 12}px` }}>
        <summary>Object</summary>
        <div style={{ marginLeft: "20px" }}>
          {entries.map(([key, val], idx) => (
            <div key={idx}>
              <strong>{key}: </strong>
              <ComplexDataRenderer data={val} level={level + 1} />
            </div>
          ))}
        </div>
      </details>
    );
  }

  // Fallback: Render unexpected data as a string
  return <span>{String(data)}</span>;
}