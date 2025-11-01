import SinglePostView from "@/components/post/SinglePostView";

export const dynamicParams = true;

export default function PostDetailPage({ params, searchParams }) {
  const { postId } = params;
  const initialCommentId = searchParams?.commentId ?? null;

  return (
    <SinglePostView postId={postId} initialCommentId={initialCommentId} />
  );
}
