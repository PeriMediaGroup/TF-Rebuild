// components/posts/edit/index.jsx (Updated to match CreatePost features)
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getPostById, updatePost } from "../postApi";
import { fetchPoll, updatePoll } from "../../../utils/pollApi";
import supabase from "../../../utils/supabaseClient";
import { parseMentions } from "../../../utils/parseMentions";
import { insertMentionAtCursor } from "../../../utils/mentionUtils";
import useMentionAutocomplete from "../../../hooks/useMentionAutocomplete";

import PostTitleInput from "../create/PostTitleInput";
import PostDescriptionInput from "../create/PostDescriptionInput";
import MediaPreview from "../create/MediaPreview";
import PostToolbar from "../create/PostToolbar";
import EmojiGifPicker from "../create/EmojiGifPicker";
import PollBuilder from "../create/PollBuilder";
import VisibilitySelector from "../create/VisibilitySelector";
import StickyToggle from "../create/StickyToggle";
import imageCompression from "browser-image-compression";
import "../../../styles/posts.scss";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [isSticky, setIsSticky] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedGif, setSelectedGif] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showGiphy, setShowGiphy] = useState(false);
  const [addPoll, setAddPoll] = useState(false);
  const [pollData, setPollData] = useState(null);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef();
  const descInputRef = useRef();
  const cameraInputRef = useRef();
  const fileInputRef = useRef();

  const { results: titleMatches, trigger: titleTrigger, loading: titleLoading } = useMentionAutocomplete(title);
  const { results: descMatches, trigger: descTrigger, loading: descLoading } = useMentionAutocomplete(description);

  useEffect(() => {
    const loadPost = async () => {
      const data = await getPostById(id);
      if (data) {
        setPost(data);
        setTitle(data.title);
        setDescription(data.description);
        setVisibility(data.visibility);
        setIsSticky(data.sticky || false);
        setSelectedGif(data.gif_url || null);

        if (data.poll_id) {
          const poll = await fetchPoll(data.poll_id);
          if (poll) {
            setPollData(poll);
            setPollQuestion(poll.question || "");
            setPollOptions(poll.options || [""]);
            setAddPoll(true);
          }
        }
      }
    };
    loadPost();
  }, [id]);

  const compressImage = async (file) => {
    try {
      return await imageCompression(file, { maxSizeMB: 5, maxWidthOrHeight: 1080, useWebWorker: true });
    } catch {
      return file;
    }
  };

  const handleImageSelect = async (file) => {
    if (!file) return;
    const compressed = await compressImage(file);
    setMediaFiles((prev) => [...prev, compressed]);
  };

  const handleEmojiClick = (emojiObject) => setDescription((prev) => prev + emojiObject.emoji);
  const handleGifSelect = (url) => setSelectedGif(url);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const hasValidInput =
      title.trim() || description.trim() || mediaFiles.length > 0 || selectedGif || post?.image_url;

    if (!hasValidInput) {
      toast.error("Please include at least a title, description, gif or image.");
      return;
    }

    setIsSubmitting(true);

    let updates = { title, description, visibility, sticky: isSticky, gif_url: selectedGif };

    if (mediaFiles.length > 0) {
      const file = mediaFiles[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${post.user_id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
        updates.image_url = data.publicUrl;
      }
    }

    const success = await updatePost(id, updates);

    if (success && pollData && addPoll) {
      if (!pollQuestion.trim() || pollOptions.some((opt) => !opt.trim())) {
        toast.error("Poll question and all options must be filled.");
        setIsSubmitting(false);
        return;
      }

      await updatePoll(pollData.id, { question: pollQuestion, options: pollOptions });
    }

    if (success) {
      toast.success("Post updated.");
      navigate("/");
    } else {
      toast.error("Update failed.");
    }
    setIsSubmitting(false);
  };

  if (!post) return <p>Loading post...</p>;

  return (
    <form className="create-post-form" onSubmit={handleSubmit}>
      <PostTitleInput
        title={title}
        setTitle={setTitle}
        trigger={titleTrigger}
        matches={titleMatches}
        loading={titleLoading}
        titleInputRef={titleInputRef}
        onMentionSelect={(username) => insertMentionAtCursor(titleInputRef, title, setTitle, username)}
      />

      <MediaPreview
        mediaFiles={mediaFiles}
        gifUrl={selectedGif}
        description={description}
        videoUrl={post.video_url}
      />

      <PostDescriptionInput
        description={description}
        setDescription={setDescription}
        trigger={descTrigger}
        matches={descMatches}
        loading={descLoading}
        descInputRef={descInputRef}
        onMentionSelect={(username) => insertMentionAtCursor(descInputRef, description, setDescription, username)}
      />

      <PostToolbar
        onCameraClick={() => cameraInputRef.current?.click()}
        onUploadClick={() => fileInputRef.current?.click()}
        onEmojiClick={() => setShowPicker(!showPicker)}
        onGifClick={() => setShowGiphy(!showGiphy)}
        onPollToggle={() => setAddPoll((prev) => !prev)}
        isPollActive={addPoll}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => handleImageSelect(e.target.files[0])}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => Array.from(e.target.files).forEach(handleImageSelect)}
      />

      <EmojiGifPicker
        showPicker={showPicker}
        setShowPicker={setShowPicker}
        showGiphy={showGiphy}
        setShowGiphy={setShowGiphy}
        onEmojiClick={handleEmojiClick}
        onGifSelect={handleGifSelect}
      />

      {addPoll && (
        <PollBuilder
          pollQuestion={pollQuestion}
          setPollQuestion={setPollQuestion}
          pollOptions={pollOptions}
          setPollOptions={setPollOptions}
        />
      )}

      <VisibilitySelector visibility={visibility} setVisibility={setVisibility} />
      <StickyToggle isCEO={true} isSticky={isSticky} setIsSticky={setIsSticky} />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Post"}
      </button>
    </form>
  );
};

export default EditPost;
