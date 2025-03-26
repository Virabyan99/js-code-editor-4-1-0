// components/ComplexDataRenderer.tsx
import React, { useState } from "react";
import { useThemeStore } from '@/store/themeStore';

interface ComplexDataRendererProps {
  data: any;
  level?: number;
  visited?: WeakSet<object>; // Track visited objects for circular references
  maxItems?: number; // Limit for truncation
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
  visited,
  maxItems = 200, // Default to 200 items before truncation
}: ComplexDataRendererProps) {
  // Create a local WeakSet if not provided (for top-level calls)
  const localVisited = visited || new WeakSet<object>();
  const { theme } = useThemeStore();

  // Define text color class based on theme
  const textColorClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';

  // Base case: Render null or primitives as plain text
  if (data === null || typeof data !== "object") {
    return <span className={textColorClass}>{String(data)}</span>;
  }

  // Check for circular reference
  if (localVisited.has(data)) {
    return <span className={textColorClass}>[Circular]</span>;
  }

  // Mark this object as visited
  localVisited.add(data);

  // Render arrays with truncation
  if (isArray(data)) {
    return (
      <ArrayRenderer
        data={data}
        level={level}
        visited={localVisited}
        maxItems={maxItems}
      />
    );
  }

  // Render objects with truncation
  if (isObject(data)) {
    return (
      <ObjectRenderer
        data={data}
        level={level}
        visited={localVisited}
        maxItems={maxItems}
      />
    );
  }

  // Fallback: Render unexpected data as a string
  return <span className={textColorClass}>{String(data)}</span>;
}

// Component to render arrays with truncation
function ArrayRenderer({
  data,
  level,
  visited,
  maxItems,
}: {
  data: any[];
  level: number;
  visited: WeakSet<object>;
  maxItems: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { theme } = useThemeStore();
  const shouldTruncate = data.length > maxItems && !expanded;
  const itemsToShow = shouldTruncate ? data.slice(0, maxItems) : data;

  // Define button color based on theme
  const expandButtonClass = theme === 'dark' ? 'text-blue-300' : 'text-blue-500';

  return (
    <details style={{ paddingLeft: `${level * 12}px` }}>
      <summary>Array[{data.length}]</summary>
      <div style={{ marginLeft: "20px" }}>
        {itemsToShow.map((item, idx) => (
          <div key={idx}>
            <strong>[{idx}]: </strong>
            <ComplexDataRenderer
              data={item}
              level={level + 1}
              visited={visited}
              maxItems={maxItems}
            />
          </div>
        ))}
        {shouldTruncate && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent toggling <details>
              setExpanded(true);
            }}
            className={`${expandButtonClass} underline`}
            aria-label={`Expand ${data.length - maxItems} more array items`}
          >
            Expand {data.length - maxItems} more...
          </button>
        )}
      </div>
    </details>
  );
}

// Component to render objects with truncation
function ObjectRenderer({
  data,
  level,
  visited,
  maxItems,
}: {
  data: Record<string, any>;
  level: number;
  visited: WeakSet<object>;
  maxItems: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { theme } = useThemeStore();
  const entries = Object.entries(data);
  const shouldTruncate = entries.length > maxItems && !expanded;
  const entriesToShow = shouldTruncate ? entries.slice(0, maxItems) : entries;

  // Define button color based on theme
  const expandButtonClass = theme === 'dark' ? 'text-blue-300' : 'text-blue-500';

  return (
    <details style={{ paddingLeft: `${level * 12}px` }}>
      <summary>Object</summary>
      <div style={{ marginLeft: "20px" }}>
        {entriesToShow.map(([key, val], idx) => (
          <div key={idx}>
            <strong>{key}: </strong>
            <ComplexDataRenderer
              data={val}
              level={level + 1}
              visited={visited}
              maxItems={maxItems}
            />
          </div>
        ))}
        {shouldTruncate && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent toggling <details>
              setExpanded(true);
            }}
            className={`${expandButtonClass} underline`}
            aria-label={`Expand ${entries.length - maxItems} more object properties`}
          >
            Expand {entries.length - maxItems} more...
          </button>
        )}
      </div>
    </details>
  );
}