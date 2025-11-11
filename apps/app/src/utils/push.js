// push.js
export async function sendPush({ userId, title, body, url }) {
    return await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title, body, url }),
    });
}

export async function pushMention({ toUserId, fromUsername, postId, commentId }) {
    return sendPush({
        userId: toUserId,
        title: "You were mentioned!",
        body: `@${fromUsername} mentioned you in a comment.`,
        url: `/posts/${postId}?commentId=${commentId}`, // ✅ this is the fix
    });
}

export async function pushComment({ toUserId, fromUsername, postId }) {
    return sendPush({
        userId: toUserId,
        title: "New comment on your post",
        body: `@${fromUsername} commented on your post.`,
        url: `/posts/${postId}`,
    });
}

export async function pushFriendRequest({ toUserId, fromUsername }) {
    return sendPush({
        userId: toUserId,
        title: "New friend request",
        body: `@${fromUsername} sent you a friend request.`,
        url: `/profile`,
    });
}

export async function pushFriendAccepted({ toUserId, fromUsername }) {
    return sendPush({
        userId: toUserId,
        title: "Friend request accepted",
        body: `@${fromUsername} accepted your friend request.`,
        url: `/profile`,
    });
}

