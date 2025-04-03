// src/components/ClothingStyleMatcher.js
import React, { useState, useEffect } from "react";
import ClothingDetector from "./ClothingDetector";
import outfitLibrary from "../data/outfitLibrary.json"; // Your local clothing data

const ClothingStyleMatcher = () => {
  const [detectedStyle, setDetectedStyle] = useState("");
  const [matchedOutfits, setMatchedOutfits] = useState([]);

  useEffect(() => {
    if (detectedStyle.trim()) {
      const matches = outfitLibrary.filter((item) => {
        return detectedStyle.toLowerCase().includes(item.keywords);
      });
      setMatchedOutfits(matches);
    }
  }, [detectedStyle]);

  return (
    <div className="container mt-4">
      <ClothingDetector onDetect={(caption) => setDetectedStyle(caption)} />

      <h5 className="mt-4">🎯 Matching 3D Outfits:</h5>
      <div className="row">
        {matchedOutfits.map((outfit, index) => (
          <div className="col-md-4 mb-3" key={index}>
            <div className="card">
              <img
                src={outfit.thumbnail}
                className="card-img-top"
                alt={outfit.name}
              />
              <div className="card-body">
                <h6>{outfit.name}</h6>
                <a
                  href={outfit.download_url}
                  className="btn btn-sm btn-success"
                  download
                >
                  Download Model
                </a>
              </div>
            </div>
          </div>
        ))}
        {matchedOutfits.length === 0 && <p>No matches found yet</p>}
      </div>
    </div>
  );
};

export default ClothingStyleMatcher;
