// src/components/messages/groupMessagesByDay.js
import dayjs from "dayjs";

export const groupMessagesByDay = (messages) => {
  const groups = {};

  messages.forEach((msg) => {
    const day = dayjs(msg.created_at).format("dddd, MMMM D, YYYY");
    if (!groups[day]) groups[day] = [];
    groups[day].push(msg);
  });

  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages,
  }));
};
