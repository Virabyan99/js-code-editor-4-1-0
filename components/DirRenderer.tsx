// components/DirRenderer.tsx
import React from "react";

interface DirRendererProps {
  dataString: string;
}

export default function DirRenderer({ dataString }: DirRendererProps) {
  let parsedData: any;
  try {
    parsedData = JSON.parse(dataString);
  } catch (error) {
    return <div className="text-red-600">Invalid data for dir</div>;
  }

  const renderObject = (obj: any, level: number = 0) => {
    if (obj === null || typeof obj !== "object") {
      return <span>{String(obj)}</span>;
    }

    return (
      <div style={{ paddingLeft: `${level * 12}px` }}>
        {Object.entries(obj).map(([key, value]) => (
          <details key={key} open={false}>
            <summary className="cursor-pointer text-gray-800">{key}</summary>
            {typeof value === "object" && value !== null
              ? renderObject(value, level + 1)
              : <span className="text-gray-600">{String(value)}</span>}
          </details>
        ))}
      </div>
    );
  };

  return <div className="text-sm">{renderObject(parsedData)}</div>;
}