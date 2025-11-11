import DOMPurify from "dompurify";

export default function linkifyText(text) {
  const urlRegex = /(\bhttps?:\/\/[^\s]+)/g;
  const html = text.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  );
  return DOMPurify.sanitize(html);
}