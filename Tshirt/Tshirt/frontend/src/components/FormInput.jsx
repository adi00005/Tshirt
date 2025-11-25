import React from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  showPasswordToggle = false,
  onTogglePassword,
  ...props
}) => {
  const inputId = `input-${name}`;
  
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="input-group">
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          placeholder={placeholder}
          aria-describedby={`${inputId}-feedback`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onTogglePassword}
            tabIndex="-1"
          >
            {type === 'password' ? <FiEye /> : <FiEyeOff />}
          </button>
        )}
        {error && (
          <div id={`${inputId}-feedback`} className="invalid-feedback">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormInput;
