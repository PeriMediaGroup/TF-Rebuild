// /apps/web/src/components/Modal.jsx
import "./modal.scss";

export default function Modal({ title, children, onClose }) {
  return (
    <div className="tf-modal">
      <div className="tf-modal__overlay" onClick={onClose}></div>
      <div className="tf-modal__content">
        <header className="tf-modal__header">
          <h3>{title}</h3>
          <button className="tf-modal__close" onClick={onClose}>
            ✕
          </button>
        </header>
        <div className="tf-modal__body">{children}</div>
      </div>
    </div>
  );
}
