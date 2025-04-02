import os
import imageio
import numpy as np

def generate_frame_images(frames, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    for i, frame in enumerate(frames):
        # Mock image generation from pose data (you can enhance this)
        img = np.full((256, 256, 3), 255, dtype=np.uint8)  # White frame
        imageio.imwrite(os.path.join(output_dir, f"frame_{i:04d}.png"), img)
