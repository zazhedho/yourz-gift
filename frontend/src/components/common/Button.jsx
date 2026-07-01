const Button = ({
  children,
  className = '',
  isLoading = false,
  variant = 'primary',
  type = 'button',
  ...props
}) => (
  <button
    className={`button button--${variant} ${className}`}
    disabled={isLoading || props.disabled}
    type={type}
    {...props}
  >
    {isLoading ? 'Loading...' : children}
  </button>
)

export default Button
