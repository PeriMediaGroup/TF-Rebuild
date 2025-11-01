const MENTION_REGEX = /@([a-zA-Z0-9_]+)/g;

export const parseMentions = (text) => {
  if (!text) return [];
  const mentions = new Set();
  let match;

  while ((match = MENTION_REGEX.exec(text)) !== null) {
    const username = match[1]?.trim();
    if (username) mentions.add(username.toLowerCase());
  }

  return Array.from(mentions);
};

