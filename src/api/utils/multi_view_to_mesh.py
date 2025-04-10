import os
import uuid
import subprocess

def generate_mesh_from_views(front_path, left_path, right_path, output_dir="static/exports"):
    output_file = f"multi_{uuid.uuid4().hex}.glb"
    output_path = os.path.join(output_dir, output_file)

    # You can modify this to use your custom model or TripoSR here
    # Example using a placeholder local command (replace with real logic)
    command = [
        "python", "run_triposr.py",  # <-- Replace this with your actual mesh generator
        "--front", front_path,
        "--left", left_path,
        "--right", right_path,
        "--output", output_path
    ]

    print("Running command:", " ".join(command))
    subprocess.run(command, check=True)

    return output_path
