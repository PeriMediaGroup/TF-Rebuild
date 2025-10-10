import "./button.scss";

export default function Button({ children, variant = "primary", ...props }) {
  return (
    <button className={`tf-btn tf-btn--${variant}`} {...props}>
      {children}
    </button>
  );
}
