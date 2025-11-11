import React, { forwardRef } from "react";

const TextInput = forwardRef(({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  className="",
  ...rest
}, ref) => {
  return (
    <div className="form-field">
      {label && (
        <label htmlFor={name} className="form-field__label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="form-field__input"
        {...rest}
      />
      {error && <div className="form-field__error">{error}</div>}
    </div>
  );
});

export default TextInput;
