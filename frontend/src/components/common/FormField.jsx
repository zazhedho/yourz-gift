import { cloneElement, isValidElement, useId } from 'react'

const FormField = ({ children, error, label }) => {
  const generatedId = useId()
  const childId = isValidElement(children) && children.props.id ? children.props.id : generatedId
  const control = isValidElement(children) ? cloneElement(children, { id: childId }) : children

  return (
    <div className="field">
      {label ? <label htmlFor={childId}>{label}</label> : null}
      {control}
      {error ? <span className="field__error">{error}</span> : null}
    </div>
  )
}

export default FormField
