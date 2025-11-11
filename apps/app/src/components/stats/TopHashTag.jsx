import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../../utils/supabaseClient";

const TopHashTag = () => {
  const [hashtags, setHashtags] = useState([]);

  useEffect(() => {
    const fetchTopHashtags = async () => {
      const { data, error } = await supabase
        .from("hashtags_view")
        .select("tag, count")
        .order("count", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Failed to fetch hashtags:", error.message);
      } else {
        setHashtags(data);
      }
    };

    fetchTopHashtags();
  }, []);

  return (
    <>
      {hashtags.length > 0 ? (
        <ul className="top-hashtags__list">
          {hashtags.map((tag, index) => (
            <li key={index} className="top-hashtags__item">
              <Link
                to={`/tags/${encodeURIComponent(tag.tag)}`}
                className="top-hashtags__link"
              >
                #{tag.tag}{" "}
                <span className="top-hashtags__count">({tag.count})</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <small>No hashtags have been used...</small>
          <img
            src="/images/hashtags.jpg"
            alt="Seriously... Are we not doing hashtags anymore?"
            className="top-hashtags__empty-img"
          />
        </>
      )}
    </>
  );
};

export default TopHashTag;
