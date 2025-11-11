import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../../auth/AuthContext";
import { fetchUserProfile } from "../../profiles/profileApi";
import { createPostWithImages } from "../postApi";
import useMentionAutocomplete from "../../../hooks/useMentionAutocomplete";
import { createPoll } from "../../../utils/pollApi";
import { parseMentions } from "../../../utils/parseMentions";
import { insertMentionAtCursor } from "../../../utils/mentionUtils";
import supabase from "../../../utils/supabaseClient";
import PostTitleInput from "./PostTitleInput";
import PostDescriptionInput from "./PostDescriptionInput";
import MediaPreview from "./MediaPreview";
import PollBuilder from "./PollBuilder";
import PostToolbar from "./PostToolbar";
import VisibilitySelector from "./VisibilitySelector";
import StickyToggle from "./StickyToggle";
import EmojiGifPicker from "./EmojiGifPicker";
import VideoUploader from "./VideoUploader";
import imageCompression from "browser-image-compression";
import { uploadVideo } from "../../../utils/cloudinaryHelpers";
import "../../../styles/post-create.scss";

const CreatePost = () => {
  const [videoOrientation, setVideoOrientation] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [addPoll, setAddPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isSticky, setIsSticky] = useState(false);
  const [sharedWith, setSharedWith] = useState([]);
  const [selectedGif, setSelectedGif] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showGiphy, setShowGiphy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const titleInputRef = useRef(null);
  const videoUploaderRef = useRef();
  const descInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const isCEO = profile?.role?.toLowerCase() === "ceo";
  const {
    results: titleMatches,
    trigger: titleTrigger,
    loading: titleLoading,
  } = useMentionAutocomplete(title);
  const {
    results: descMatches,
    trigger: descTrigger,
    loading: descLoading,
  } = useMentionAutocomplete(description);
  const handleEmojiClick = (emojiObject) =>
    setDescription((prev) => prev + emojiObject.emoji);
  const handleGifSelect = (url) => setSelectedGif(url);

  useEffect(() => {
    if (user) fetchUserProfile(user.id).then(setProfile);
  }, [user]);

  const compressImage = async (file) => {
    try {
      return await imageCompression(file, {
        maxSizeMB: 5,
        maxWidthOrHeight: 1080,
        useWebWorker: true,
      });
    } catch {
      return file;
    }
  };

  const handleDeleteImage = (id) => {
    setMediaFiles((prev) => prev.filter((m) => m.id !== id));
  };

  const MAX_MEDIA = 5;

  const handleImageSelect = async (file) => {
    if (!file) return;

    if (mediaFiles.length >= MAX_MEDIA) {
      toast.error(`You can only upload up to ${MAX_MEDIA} images. For now!`);
      return;
    }

    const compressed = await compressImage(file);
    const previewUrl = URL.createObjectURL(compressed);

    const withPreview = {
      file: compressed,
      previewUrl,
      id: crypto.randomUUID(), // unique id for removal
    };

    setMediaFiles((prev) => [...prev, withPreview]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (
      !title.trim() &&
      !description.trim() &&
      mediaFiles.length === 0 &&
      !selectedGif
    ) {
      toast.error(
        "Please include at least a title, description, gif or image."
      );
      return;
    }

    if (!profile?.username?.trim()) {
      toast.error("Please set up your profile before you post.");
      return navigate("/editprofile");
    }

    setIsSubmitting(true);

    let pollId = null;
    if (addPoll) {
      if (!pollQuestion.trim() || pollOptions.some((opt) => !opt.trim())) {
        toast.error("Poll question and all options must be filled.");
        setIsSubmitting(false);
        return;
      }
      const poll = await createPoll(pollQuestion, pollOptions, user.id);
      if (!poll) return toast.error("Failed to create poll.");
      pollId = poll.id;
    }

    let videoUrl = null;

    if (videoFile) {
      try {
        videoUrl = await uploadVideo(videoFile);
      } catch (err) {
        toast.error("Video upload failed.");
        console.error("Video upload error:", err);
        setIsSubmitting(false);
        return;
      }
    }

    const result = await createPostWithImages({
      userId: user.id,
      title,
      description,
      mediaFiles,
      videoUrl,
      gifUrl:
        selectedGif && selectedGif.includes("giphy")
          ? `https://res.cloudinary.com/triggerfeed/image/fetch/f_auto,q_auto/${encodeURIComponent(selectedGif)}`
          : selectedGif,
      visibility,
      sticky: isSticky,
      pollId,
      sharedWith:
        visibility === "private" && sharedWith.length === 0
          ? [user.id]
          : sharedWith,
      orientation: videoOrientation,
    });

    if (result.success && result.postId) {
      const mentions = parseMentions(`${title} ${description}`);
      if (mentions.length) {
        const { data: allProfiles, error } = await supabase
          .from("profiles")
          .select("id, username");
        if (!error) {
          const mentionedUsers = allProfiles.filter((p) =>
            mentions.includes(p.username.toLowerCase())
          );
          const notifications = mentionedUsers.map((u) => ({
            user_id: u.id,
            type: "mention",
            data: {
              post_id: result.postId,
              from_user_id: user.id,
              from_username: profile.username,
            },
          }));
          for (const u of mentionedUsers) {
            await fetch("/api/send-notification", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: u.id,
                title: "You were mentioned!",
                body: `@${profile.username} mentioned you in a post.`,
                url: `/posts/${result.postId}`,
              }),
            });
          }
          await supabase.from("notifications").insert(notifications);
        }
      }

      const hashtags = [
        ...new Set(
          (`${title} ${description}`.match(/#[\w-]+/g) || []).map((t) =>
            t.slice(1).toLowerCase()
          )
        ),
      ];
      if (hashtags.length > 0) {
        await supabase
          .from("hashtags")
          .insert(hashtags.map((tag) => ({ post_id: result.postId, tag })));
      }

      navigate("/");
    } else {
      console.error("Post failed:", result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="create-post-form">
      <h3>Create a post</h3>
      <PostTitleInput
        title={title}
        setTitle={setTitle}
        trigger={titleTrigger}
        matches={titleMatches}
        loading={titleLoading}
        titleInputRef={titleInputRef}
        onMentionSelect={(username) =>
          insertMentionAtCursor(titleInputRef, title, setTitle, username)
        }
      />

      <MediaPreview
        mediaFiles={mediaFiles}
        gifUrl={selectedGif}
        description={description}
        onDeleteImage={handleDeleteImage}
      />

      <PostDescriptionInput
        description={description}
        setDescription={setDescription}
        trigger={descTrigger}
        matches={descMatches}
        loading={descLoading}
        descInputRef={descInputRef}
        onMentionSelect={(username) =>
          insertMentionAtCursor(
            descInputRef,
            description,
            setDescription,
            username
          )
        }
      />

      <PostToolbar
        isCEO={isCEO}
        onCameraClick={() => cameraInputRef.current?.click()}
        onVideoClick={() => videoUploaderRef.current?.openFileDialog()}
        onUploadClick={() => fileInputRef.current?.click()}
        onEmojiClick={() => setShowPicker(!showPicker)}
        onGifClick={() => setShowGiphy(!showGiphy)}
        onPollToggle={() => setAddPoll((prev) => !prev)}
        isPollActive={addPoll}
      />

      {/* Hidden input triggers */}
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

      <VideoUploader
        ref={videoUploaderRef}
        videoFile={videoFile}
        setVideoFile={setVideoFile}
        videoPreview={videoPreview}
        setVideoPreview={setVideoPreview}
        setVideoOrientation={setVideoOrientation}
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

      <VisibilitySelector
        visibility={visibility}
        setVisibility={setVisibility}
      />
      <StickyToggle
        isCEO={isCEO}
        isSticky={isSticky}
        setIsSticky={setIsSticky}
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Posting..." : "Post"}
      </button>
    </form>
  );
};

export default CreatePost;
