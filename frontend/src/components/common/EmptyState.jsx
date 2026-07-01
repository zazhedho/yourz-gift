const EmptyState = ({ action, message = 'No data yet', title = 'Empty' }) => (
  <div className="empty">
    <div>
      <h2>{title}</h2>
      <p className="muted">{message}</p>
    </div>
    {action}
  </div>
)

export default EmptyState
