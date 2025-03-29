import os
import requests

# 🔧 Mock version – use this while developing locally
def send_to_deep3d(filepath):
    """
    Mock function to simulate sending an image to Deep3D.
    """
    filename = os.path.basename(filepath)
    fake_avatar_url = f"https://mocked-deep3d.com/avatars/{filename.split('.')[0]}.glb"
    print(f"[Mock Deep3D] Returning fake URL: {fake_avatar_url}")
    return fake_avatar_url


# 🧪 Real version (template for production)
def send_to_real_deep3d(filepath):
    """
    Real function to send image to Deep3D API and get avatar URL.
    Update this once you have actual API access.
    """
    api_url = "https://api.deep3d.com/generate-avatar"  # replace with real URL
    api_key = os.getenv("DEEP3D_API_KEY")  # load from .env or environment

    with open(filepath, 'rb') as image_file:
        files = {'image': image_file}
        headers = {
            "Authorization": f"Bearer {api_key}",  # optional, depends on the API
        }

        try:
            response = requests.post(api_url, files=files, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get("avatar_url")  # depends on the API's response format

        except Exception as e:
            print(f"[Deep3D Error] {e}")
            return None
