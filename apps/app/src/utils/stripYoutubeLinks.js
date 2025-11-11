export const stripYoutubeLinks = (text) => {
  return text.replace(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/gi, "").trim();
};