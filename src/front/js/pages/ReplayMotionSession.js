// src/pages/ReplayMotionSession.js
import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, TimeScale, LineElement, PointElement, LinearScale } from "chart.js";
import "chartjs-adapter-date-fns";

Chart.register(TimeScale, LineElement, PointElement, LinearScale);

const ReplayMotionSession = ({ jsonUrl, audioUrl }) => {
  const [frames, setFrames] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audio] = useState(new Audio(audioUrl));
  const requestRef = useRef();
  const startTimeRef = useRef(null);

  useEffect(() => {
    fetch(jsonUrl)
      .then((res) => res.json())
      .then(setFrames)
      .catch(console.error);
  }, [jsonUrl]);

  const animate = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = (timestamp - startTimeRef.current) / 1000;
    setCurrentTime(elapsed);

    // Call your animation logic here
    const frame = frames.find((f) => Math.abs(f.time - elapsed) < 0.05);
    if (frame) console.log("🦴 Pose Frame:", frame);

    if (elapsed < frames[frames.length - 1]?.time) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
      audio.pause();
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    startTimeRef.current = null;
    audio.currentTime = 0;
    audio.play();
    requestRef.current = requestAnimationFrame(animate);
  };

  const handlePause = () => {
    setIsPlaying(false);
    audio.pause();
    cancelAnimationFrame(requestRef.current);
  };

  const beatTimes = [0.5, 1.2, 2.0, 3.4]; // Optional: from DB

  return (
    <div>
      <h2>Replay Session</h2>
      <div>
        <button onClick={isPlaying ? handlePause : handlePlay}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <p>⏱ {currentTime.toFixed(2)}s</p>
      </div>

      <Line
        data={{
          labels: frames.map((f) => new Date(f.time * 1000)),
          datasets: [
            {
              label: "Pose Frames",
              data: frames.map((f) => ({ x: f.time * 1000, y: 0 })),
              borderColor: "#888",
              pointRadius: 3,
            },
            {
              label: "Beats",
              data: beatTimes.map((t) => ({ x: t * 1000, y: 0 })),
              backgroundColor: "red",
              pointRadius: 5,
              showLine: false,
            },
          ],
        }}
        options={{
          scales: {
            x: {
              type: "time",
              time: { unit: "second" },
              title: { display: true, text: "Time" },
            },
            y: {
              display: false,
            },
          },
        }}
      />
    </div>
  );
};

export default ReplayMotionSession;
