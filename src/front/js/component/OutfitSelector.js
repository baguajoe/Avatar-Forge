// src/components/OutfitSelector.js
import React from "react";

const OutfitSelector = ({ matchedOutfits, onSelect }) => {
  return (
    <div className="mt-4">
      <h5>🧵 Matched Outfits:</h5>
      <div className="d-flex flex-wrap gap-3">
        {matchedOutfits.map((item, idx) => (
          <div key={idx} className="text-center">
            <img
              src={`/assets/thumbnails/${item.file.replace(".glb", ".jpg")}`}
              alt={item.name}
              style={{ width: "100px", borderRadius: "8px", cursor: "pointer" }}
              onClick={() => onSelect(item)}
            />
            <p className="mt-1">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutfitSelector;
