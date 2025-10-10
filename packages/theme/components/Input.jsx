import React from "react";
import "./input.scss";

export default function Input({ label, ...props }) {
  return (
    <label className="tf-input">
      {label && <span className="tf-input__label">{label}</span>}
      <input className="tf-input__field" {...props} />
    </label>
  );
}