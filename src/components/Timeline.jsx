// Renders an ordered list of planning milestones with due dates and overdue badges.
function formatDate(isoDate) {
  return new Date(isoDate + 'T00:00:00Z').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default function Timeline({ items }) {
  return (
    <ol className="timeline">
      {items.map((item) => (
        <li key={item.task} className="timeline__item">
          <span className="timeline__task">{item.task}</span>
          <span className="timeline__due">Due: {formatDate(item.dueDate)}</span>
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
