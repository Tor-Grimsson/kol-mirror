const DataTable = ({ caption, columns, rows, className = '' }) => (
  <div className={`overflow-x-auto border border-auto rounded ${className}`.trim()}>
    <table className="min-w-full text-left text-auto">
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      <thead className="bg-container-primary text-auto border-b border-auto">
        <tr>
          {columns.map((column, idx) => (
            <th
              key={column.accessor}
              scope="col"
              className={`${column.headerClassName ?? 'dt-cell-title'} ${idx < columns.length - 1 ? 'border-r border-auto' : ''}`.trim()}
              style={column.style}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={row.token ?? rowIndex} className="align-top border-b border-auto last:border-none text-auto">
            {columns.map((column, idx) => (
              <td key={column.accessor} className={`${column.className ?? 'dt-cell-text'} ${idx < columns.length - 1 ? 'border-r border-auto' : ''}`.trim()} style={column.style}>
                {column.render ? column.render(row) : row[column.accessor] ?? '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default DataTable
