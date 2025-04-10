import os
import torch
import open3d as o3d
from rembg import remove
from PIL import Image
import numpy as np

# Set device for MiDaS (use GPU if available, otherwise use CPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load the MiDaS model from the official GitHub repository
# Using MiDaS instead of MiDaS_large (which doesn't exist in the hubconf)
midas = torch.hub.load("intel-isl/MiDaS", "MiDaS")
midas.to(device)
midas.eval()  # Set the model to evaluation mode

# Load MiDaS transform
midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms")
transform = midas_transforms.default_transform  # Use default_transform for MiDaS

def estimate_depth(image_path):
    """Estimate depth from selfie using MiDaS."""
    # Open and process the image
    img = Image.open(image_path).convert("RGB")
    img_np = np.array(img)

    # Apply MiDaS transform to the image
    transformed = transform(img_np)
    input_tensor = transformed.to(device)

    # Predict depth using MiDaS model
    with torch.no_grad():
        prediction = midas(input_tensor)
        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1),
            size=img_np.shape[:2],  # Resize to original image size
            mode="bilinear",
            align_corners=False,
        ).squeeze()

    # Return the depth map
    depth_map = prediction.cpu().numpy()
    return img_np, depth_map

def selfie_to_avatar(input_path, output_path="static/exports"):
    """Process selfie to generate a 3D avatar from depth map."""
    # Remove background using rembg
    with open(input_path, "rb") as f:
        input_bytes = f.read()
    no_bg = remove(input_bytes)

    # Save the background-removed image temporarily
    temp_no_bg_path = input_path.replace(".jpg", "_nobg.png").replace(".jpeg", "_nobg.png").replace(".png", "_nobg.png")
    with open(temp_no_bg_path, "wb") as f:
        f.write(no_bg)

    # Generate depth map and point cloud
    img, depth_map = estimate_depth(temp_no_bg_path)

    # Prepare to create a 3D point cloud from depth map
    h, w = depth_map.shape
    fx = fy = max(h, w)  # Better focal length approximation
    cx = w / 2
    cy = h / 2

    points, colors = [], []
    for y in range(0, h, 2):  # Sample step for performance
        for x in range(0, w, 2):
            z = depth_map[y, x]
            if np.isnan(z) or z <= 0:
                continue
            X = (x - cx) * z / fx
            Y = (y - cy) * z / fy
            points.append((X, Y, z))
            colors.append(img[y, x] / 255.0)  # Normalize colors to [0, 1]

    # Create Open3D point cloud
    pc = o3d.geometry.PointCloud()
    pc.points = o3d.utility.Vector3dVector(np.array(points))
    pc.colors = o3d.utility.Vector3dVector(np.array(colors))
    pc.estimate_normals()

    # Create mesh from point cloud using Poisson surface reconstruction
    mesh, _ = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(pc, depth=8)
    mesh.compute_vertex_normals()

    # Save the generated mesh to a file
    os.makedirs(output_path, exist_ok=True)
    export_file = os.path.join(output_path, os.path.basename(input_path).split('.')[0] + ".ply")
    o3d.io.write_triangle_mesh(export_file, mesh)
    
    # Clean up temporary files
    try:
        os.remove(temp_no_bg_path)
    except:
        pass

    return export_file  # Return the path to the saved mesh

# Example usage
if __name__ == "__main__":
    input_image_path = "path/to/your/selfie.jpg"
    output_mesh_path = selfie_to_avatar(input_image_path)
    print(f"3D avatar mesh saved to: {output_mesh_path}")