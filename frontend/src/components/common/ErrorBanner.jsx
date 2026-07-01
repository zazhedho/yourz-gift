const ErrorBanner = ({ message }) => (
  message ? <div className="alert alert--error" role="alert">{message}</div> : null
)

export default ErrorBanner
