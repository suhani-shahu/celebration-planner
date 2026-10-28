// Renders an ordered list of planning milestones with due dates and overdue badges.
import { formatDisplayDate } from '../utils/formatDate'

export default function Timeline({ items }) {
  return (
    <ol className="timeline">
      {items.map((item) => (
        <li key={item.task} className="timeline__item">
          <span className="timeline__task">{item.task}</span>
          <span className="timeline__due">
            Due: {formatDisplayDate(item.dueDate)}
          </span>
          {item.overdue && (
            <span className="timeline__badge timeline__badge--overdue">
              Overdue
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}
