import { useState } from "react";
import supabase from "../../utils/supabaseClient";
import "../../styles/report.scss";

const REPORT_BUCKET =
  import.meta.env.VITE_SUPABASE_CSAE_BUCKET || "csae-report-files";

const initialFormState = {
  postUrl: "",
  username: "",
  description: "",
  reporterEmail: "",
};

const createReportFileName = (extension = "bin") =>
  `report-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

async function fetchIpAddress() {
  try {
    const response = await fetch("https://api64.ipify.org?format=json");
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.ip ?? null;
  } catch (error) {
    console.warn("Unable to resolve reporter IP address", error);
    return null;
  }
}

export default function ReportForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [form, setForm] = useState(initialFormState);
  const [files, setFiles] = useState([]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFile = (event) => {
    const selected = Array.from(event.target.files || []);
    setFiles(selected);
  };

  const resetForm = () => {
    setForm(initialFormState);
    setFiles([]);
  };

  const uploadAttachments = async () => {
    if (!files.length) return [];

    const uploadedPaths = [];

    for (const file of files) {
      const extension = file.name.split(".").pop();
      const safeExt = extension ? extension.toLowerCase() : "bin";
      const fileName = createReportFileName(safeExt);

      const { error: uploadError } = await supabase.storage
        .from(REPORT_BUCKET)
        .upload(fileName, file, { upsert: false });

      if (uploadError) {
        const message = uploadError.message || "";
        const normalized = message.toLowerCase();
        if (
          normalized.includes("bucket") ||
          normalized.includes("resource was not found") ||
          normalized.includes("not found")
        ) {
          const bucketError = new Error(
            `Supabase storage bucket "${REPORT_BUCKET}" is missing.`
          );
          bucketError.code = "BUCKET_NOT_FOUND";
          throw bucketError;
        }

        throw new Error(
          message || "We could not upload the attached evidence files."
        );
      }

      const { data } = supabase.storage
        .from(REPORT_BUCKET)
        .getPublicUrl(fileName);

      if (data?.publicUrl) {
        uploadedPaths.push(data.publicUrl);
      } else {
        uploadedPaths.push(fileName);
      }
    }

    return uploadedPaths;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    let uploadedPaths = [];

    try {
      uploadedPaths = await uploadAttachments();
    } catch (error) {
      console.error("Attachment upload failed", error);
      setMessageType("error");

      if (error.code === "BUCKET_NOT_FOUND") {
        setMessage(
          `We could not upload your attachments because storage bucket "${REPORT_BUCKET}" is missing. Please create the bucket in Supabase Storage or set VITE_SUPABASE_CSAE_BUCKET to an existing bucket.`
        );
        setLoading(false);
        return;
      }

      setMessage(
        "We could not upload the attachments. Please remove them and try again or email abuse@triggerfeed.com."
      );
      setLoading(false);
      return;
    }

    try {
      const ipAddress = await fetchIpAddress();
      const reporterUserAgent =
        typeof window !== "undefined" ? navigator.userAgent : null;

      const { error } = await supabase.from("csae_reports").insert({
        post_url: form.postUrl.trim(),
        victim_username: form.username.trim() || null,
        description: form.description.trim(),
        reporter_email: form.reporterEmail.trim() || null,
        storage_paths: uploadedPaths.length ? uploadedPaths : null,
        ip_address: ipAddress,
        user_agent: reporterUserAgent,
      });

      if (error) {
        throw new Error(error.message);
      }

      resetForm();
      setMessageType("success");
      setMessage(
        "Thanks — your report was submitted. We will review it immediately."
      );
    } catch (error) {
      console.error("Report submission failed", error);
      setMessageType("error");
      setMessage(
        "Sorry — we could not submit the report. Try again or email abuse@triggerfeed.com."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="report__title">
        Report suspected child sexual abuse & exploitation
      </h2>
      <p className="report__note">
        If someone is in immediate danger, contact local law enforcement first.
      </p>

      <form className="report__form" onSubmit={onSubmit}>
        <label className="report__label">
          Post URL <span className="report__required">(required)</span>
          <input
            type="url"
            name="postUrl"
            value={form.postUrl}
            onChange={onChange}
            required
            className="report__input"
            placeholder="https://triggerfeed.com/posts/123"
            autoComplete="off"
          />
        </label>

        <label className="report__label">
          Victim username (if known)
          <input
            name="username"
            value={form.username}
            onChange={onChange}
            className="report__input"
            placeholder="@username"
            autoComplete="off"
          />
        </label>

        <label className="report__label">
          Description{" "}
          <span className="report__required">(what makes this concerning)</span>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            className="report__textarea"
            required
            rows={6}
            placeholder="Share what you saw and why it may involve CSAE."
          />
        </label>

        <label className="report__label">
          Attach images/videos (optional)
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={onFile}
            className="report__file"
          />
        </label>

        {!!files.length && (
          <ul className="report__attachments">
            {files.map((file) => (
              <li key={file.name} className="report__attachment">
                {file.name}
              </li>
            ))}
          </ul>
        )}

        <label className="report__label">
          Your email (optional, for follow-up)
          <input
            type="email"
            name="reporterEmail"
            value={form.reporterEmail}
            onChange={onChange}
            className="report__input"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <button type="submit" disabled={loading} className="report__submit">
          {loading ? "Submitting…" : "Submit report"}
        </button>
      </form>

      {message && (
        <div className={`report__message report__message--${messageType}`}>
          {message}
        </div>
      )}
    </div>
  );
}
