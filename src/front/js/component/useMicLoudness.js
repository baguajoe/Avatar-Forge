import { useEffect, useState } from "react";

const useMicLoudness = () => {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    let dataArray = new Uint8Array(analyser.frequencyBinCount);

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const loop = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(avg / 256); // Normalize 0–1
        requestAnimationFrame(loop);
      };

      loop();
    });

    return () => audioContext.close();
  }, []);

  return volume;
};

export default useMicLoudness;
