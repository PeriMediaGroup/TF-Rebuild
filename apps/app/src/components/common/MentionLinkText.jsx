// src/components/common/MentionLinkText.jsx
import React from "react";
import { Link } from "react-router-dom";
import useValidUsernames from "./useValidUsernames";

const urlRegex      = /\b((https?:\/\/|www\.)[\w-]+(\.[\w-]+)+([/?#][^\s]*)?)/gi;
const mentionRegex  = /@[\w.-]+/gi;
const hashtagRegex  = /#[\w-]+/gi;

const MentionLinkText = ({ text }) => {
  const validUsernames = useValidUsernames();
  if (!text) return null;

  const combinedRegex = new RegExp(
    `${urlRegex.source}|${mentionRegex.source}|${hashtagRegex.source}|\\n`,
    "gi"
  );

  const parts = [];
  let lastIndex = 0;

  for (const match of text.matchAll(combinedRegex)) {
    const index = match.index;
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    parts.push(match[0]);
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return (
    <>
      {parts.map((part, i) => {
        if (part === "\n") return <br key={i} />;

        if (urlRegex.test(part)) {
          const href = part.startsWith("http") ? part : `https://${part}`;
          return (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="mention-text__link">
              {part}
            </a>
          );
        }

        if (mentionRegex.test(part)) {
          const username = part.slice(1).toLowerCase();
          if (validUsernames[username]) {
            return (
              <Link key={i} to={`/user/${encodeURIComponent(username)}`} className="mention-text__link mention-text__mention">
                {part}
              </Link>
            );
          }
        }

        if (hashtagRegex.test(part)) {
          const tag = part.slice(1);
          return (
            <Link key={i} to={`/tags/${encodeURIComponent(tag)}`} className="mention-text__link mention-text__hashtag">
              {part}
            </Link>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
};


export default MentionLinkText;
