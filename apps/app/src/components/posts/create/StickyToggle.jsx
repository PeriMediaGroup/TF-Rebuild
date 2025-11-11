// components/posts/create/StickyToggle.jsx

const StickyToggle = ({ isCEO, isSticky, setIsSticky }) => {
  if (!isCEO) return null;

  return (
    <label className="create-post__sticky">
      <input
        type="checkbox"
        checked={isSticky}
        onChange={(e) => setIsSticky(e.target.checked)}
      />
      Pin to Top
    </label>
  );
};

export default StickyToggle;