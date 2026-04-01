import React from 'react';

interface JsonRendererProps {
  data: any;
  level?: number;
}

const formatKey = (key: string) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

export const JsonRenderer: React.FC<JsonRendererProps> = ({ data, level = 0 }) => {
  if (data === null || data === undefined) {
    return <span className="text-slate-400 italic">None</span>;
  }

  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return <span className="text-slate-700">{data.toString()}</span>;
  }

  if (Array.isArray(data)) {
    return (
      <ul className={`list-disc list-inside space-y-2 ${level > 0 ? 'ml-4 mt-2' : ''}`}>
        {data.map((item, index) => (
          <li key={index} className="text-slate-700">
            {typeof item === 'object' ? <div className="mt-2 block"><JsonRenderer data={item} level={level + 1} /></div> : item}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof data === 'object') {
    return (
      <div className={`space-y-4 w-full ${level > 0 ? 'ml-4 mt-3 border-l-2 border-slate-100 pl-4' : ''}`}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="break-words">
            <h4 className="font-bold text-slate-800 mb-1 capitalize text-sm">{formatKey(key)}:</h4>
            <div className="text-slate-600">
              <JsonRenderer data={value} level={level + 1} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};
