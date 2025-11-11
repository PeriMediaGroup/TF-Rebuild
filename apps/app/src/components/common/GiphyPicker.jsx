// src/components/common/GiphyPicker.jsx
import { useState, useCallback } from "react";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { css } from "@emotion/react";

const gf = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY);

const GiphyPicker = ({ onGifSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const fetchGifs = useCallback(
    (offset) =>
      searchTerm
        ? gf.search(searchTerm, { offset, limit: 12 })
        : gf.trending({ offset, limit: 12 }),
    [searchTerm]
  );

  return (
    <div className="giphy-picker">
      <div className="giphy-picker__header">
        <input
          type="text"
          placeholder="Search GIFs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="giphy-picker__search"
        />
        <button onClick={onClose}>×</button>
      </div>
      <Grid
        key={searchTerm} // force refresh
        fetchGifs={fetchGifs}
        onGifClick={(gif, e) => {
          e.preventDefault();
          onGifSelect(gif);
        }}
        width={300}
        columns={3}
        gutter={6}
      />
    </div>
  );
};

export default GiphyPicker;
