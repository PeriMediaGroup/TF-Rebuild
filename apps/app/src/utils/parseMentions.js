// Extracts @mentions from a block of text
export function parseMentions(text) {
  if (!text || typeof text !== "string") return [];

  // Match @username patterns: letters, numbers, underscore, dash, dot
  const mentionPattern = /@([a-zA-Z0-9._-]+)/g;
  const mentions = [];
  let match;

  while ((match = mentionPattern.exec(text)) !== null) {
    const username = match[1].toLowerCase(); // normalize case
    if (!mentions.includes(username)) {
      mentions.push(username);
    }
  }

  return mentions;
}