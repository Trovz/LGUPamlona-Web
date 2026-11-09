export default function DashboardTable({ headers, rows, emptyMessage }) {
  if (!rows.length) {
    return <div className="px-5 py-10 text-center text-sm text-muted">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                className="whitespace-nowrap border-b border-line bg-thead px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-muted"
                key={index}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ id, cells }) => (
            <tr className="border-b border-line last:border-0 hover:bg-row-hover" key={id}>
              {cells.map((cell, index) => (
                <td className="px-4 py-3 align-middle" key={index}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
