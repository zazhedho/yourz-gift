import Button from './Button'

const RetryState = ({ message = 'Failed to load data', onRetry }) => (
  <div className="retry">
    <p>{message}</p>
    {onRetry ? <Button onClick={onRetry}>Retry</Button> : null}
  </div>
)

export default RetryState
