// utils/mentionUtils.js
export function insertMentionAtCursor(inputRef, text, setText, username) {
  const el = inputRef.current;
  if (!el || typeof el.setSelectionRange !== "function") return;

  const cursor = el.selectionStart;
  const before = text.slice(0, cursor);
  const after = text.slice(cursor);
  const atIndex = before.lastIndexOf("@");
  if (atIndex === -1) return;

  const updated = `${before.slice(0, atIndex)}@${username} ${after}`;
  setText(updated);

  setTimeout(() => {
    el.focus();
    el.setSelectionRange(atIndex + username.length + 2, atIndex + username.length + 2);
  }, 0);
}