import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useStore } from "../store";

export const Upload = () => {
  const [thumbnail, setThumbnail] = useState("");
  const [url, setUrl] = useState("");
  const { authStore } = useStore();

  // TODO - ADD Upload to API service
  const upload = async (resourceType: any, file: any) => {
    if (!file) return;
    if (!authStore.currentUser) return;
    const formData = new FormData();
    formData.append("upload_preset", "vaus-video");
    formData.append("file", file);

    let toastId: any = null;

    const config = {
      onUploadProgress: (p: any) => {
        const progress = p.loaded / p.total;
        if (toastId === null) {
          toastId = toast("Upload in Progress", {
            progress,
          });
        } else {
          toast.update(toastId, {
            progress,
          });
        }
      },
    };

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_CLOUDINARY_ENDPOINT}/${resourceType}/upload`,
        formData,
        config
      );

      return data.secure_url;
    } catch (err) {
      console.log({ err });
    }

    toast.dismiss(toastId);
  };

  const saveVideo = async () => {
    if (!url) return;
    if (!authStore.currentUser) return;
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_VIDEO_API_BASE_URL}`,
        {
          title: "video",
          url: url,
        },
        { headers: { Authorization: `Bearer ${authStore.currentUser.token}` } }
      );

      console.log({ data });
    } catch (err) {
      console.log({ err });
    }
  };

  const handleVideoUpload = async (e: any) => {
    const file = e.target.files[0];

    if (file) {
      const data = await upload("video", file);
      setUrl(data);
      console.log({ data });
      const ext = data.split(".").pop();
      setThumbnail(data.replace(ext, "jpg"));
    }
  };
  return (
    <div>
      <input
        style={{ marginTop: 200 }}
        id="video-upload"
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
      />
      <div>
        {thumbnail && (
          <img src={thumbnail} height="340" width="500" alt="thumbnail" />
        )}
      </div>
      <button
        style={{ marginTop: 100 }}
        disabled={!url}
        onClick={() => saveVideo()}
      >
        SUBMIT
      </button>
    </div>
  );
};
