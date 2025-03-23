// components/TableRenderer.tsx
import React from "react";

interface TableRendererProps {
  data: any; // Can be array of arrays or array of objects
}

export default function TableRenderer({ data }: TableRendererProps) {
  if (!Array.isArray(data)) {
    return <div className="text-red-600">console.table expects an array</div>;
  }

  if (data.length === 0) {
    return <div className="text-gray-600">(empty table)</div>;
  }

  let headers: string[] = [];
  let rows: any[] = [];

  const firstRow = data[0];

  if (Array.isArray(firstRow)) {
    // Array of arrays
    headers = firstRow.map((_, colIndex) => `Col ${colIndex}`);
    rows = data;
  } else if (typeof firstRow === "object" && firstRow !== null) {
    // Array of objects
    const allKeys = new Set<string>();
    data.forEach((obj) => {
      Object.keys(obj).forEach((key) => allKeys.add(key));
    });
    headers = Array.from(allKeys);
    rows = data.map((obj) => headers.map((header) => obj[header]));
  } else {
    // Fallback: single column
    headers = ["Value"];
    rows = data.map((item) => [item]);
  }

  return (
    <table className="border-collapse border border-gray-400 text-sm">
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th key={i} className="border border-gray-400 px-2 py-1 bg-gray-100 text-gray-800">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((cell: any, cellIdx: number) => (
              <td key={cellIdx} className="border border-gray-400 px-2 py-1 text-gray-600">
                {String(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}