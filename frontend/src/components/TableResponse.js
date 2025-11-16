import React from "react";

/**
 * Expects prop: structured = { headers: ['col1','col2'], rows: [ ['a','b'], ['c','d'] ] }
 */
export default function TableResponse({ structured }) {
  if (!structured || (!structured.headers && !structured.rows)) return null;

  const headers = structured.headers || [];
  const rows = structured.rows || [];

  return (
    <div className="mt-2 overflow-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-600 dark:text-gray-300"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr
              key={ri}
              className={ri % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"}
            >
              {r.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
