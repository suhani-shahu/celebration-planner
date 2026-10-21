// Renders a budget allocation as an accessible table with category, share and amount columns.
import { formatINR } from '../utils/formatCurrency'

export default function BudgetTable({ rows, total }) {
  return (
    <div className="budget-table-wrapper">
      <table className="budget-table">
        <caption className="budget-table__caption">Budget breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Share (%)</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.category}>
              <th scope="row">
                {row.category.charAt(0).toUpperCase() + row.category.slice(1)}
              </th>
              <td>{row.percent}%</td>
              <td>{formatINR(row.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="budget-table__total">
            <th scope="row">Total</th>
            <td>100%</td>
            <td>{formatINR(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
