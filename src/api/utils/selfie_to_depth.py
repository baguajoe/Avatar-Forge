import torch
import cv2
import numpy as np
from PIL import Image
import open3d as o3d
from rembg import remove
import os

# Load MiDaS model and transform
def load_midas():
    model_type = "DPT_Large"
    model = torch.hub.load("intel-isl/MiDaS", model_type)
    model.eval()
    transform = torch.hub.load("intel-isl/MiDaS", "transforms").dpt_transform
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    return model, transform, device

# Convert selfie to mesh
def selfie_to_avatar(input_path, output_path="static/exports"):
    # Load and remove background
    with open(input_path, "rb") as f:
        input_bytes = f.read()
    no_bg = remove(input_bytes)
    temp_no_bg_path = input_path.replace(".jpg", "_nobg.png")
    with open(temp_no_bg_path, "wb") as f:
        f.write(no_bg)

    input_image = Image.open(temp_no_bg_path)
    model, transform, device = load_midas()

    img_tensor = transform(input_image).to(device).unsqueeze(0)
    with torch.no_grad():
        pred = model(img_tensor)
        depth = torch.nn.functional.interpolate(
            pred.unsqueeze(1),
            size=input_image.size[::-1],
            mode="bicubic",
            align_corners=False
        ).squeeze().cpu().numpy()

    # Convert to point cloud
    h, w = depth.shape
    fx, fy = 1.0, 1.0
    cx, cy = w / 2, h / 2

    points, colors = [], []
    rgb = np.array(input_image)

    for v in range(h):
        for u in range(w):
            z = depth[v, u]
            x = (u - cx) * z / fx
            y = (v - cy) * z / fy
            points.append((x, y, z))
            colors.append(rgb[v, u] / 255.0)

    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(points)
    pcd.colors = o3d.utility.Vector3dVector(colors)

    os.makedirs(output_path, exist_ok=True)
    export_file = os.path.join(output_path, os.path.basename(input_path).replace(".jpg", ".ply"))
    o3d.io.write_point_cloud(export_file, pcd)

    return export_file
