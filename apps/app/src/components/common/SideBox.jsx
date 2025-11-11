import "../../styles/sidebox.scss";

const SideBox = ({ title, children }) => {
  return (
    <div className="side-box">
      {title && <h3 className="side-box__title">{title}</h3>}
      <div className="side-box__content">{children}</div>
    </div>
  );
};

export default SideBox;