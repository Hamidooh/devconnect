"use client";

import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

const CREATE_STORY = gql`
  mutation CreateStory($mediaUrl: String, $sharedPostId: ID) {
    createStory(mediaUrl: $mediaUrl, sharedPostId: $sharedPostId) {
      id
      mediaUrl
      createdAt
    }
  }
`;

export default function CreateStoryModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const [createStory, { loading }] = useMutation(CREATE_STORY, {
    onCompleted: () => {
      setSelectedFile(null);
      setPreview("");
      setUploading(false);
      onClose();
    },
    onError: (err) => {
      console.error("Mutation failed:", err);
      setUploading(false);
      alert("Failed to post story. Please try again.");
    },
    refetchQueries: ["GetStories"]
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const result = await res.json();
        await createStory({ variables: { mediaUrl: result.url } });
      } else {
        console.error("Upload failed");
        setUploading(false);
      }
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'hsl(var(--text-primary))' }}>Add Story</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'hsl(var(--accent-primary))', fontWeight: 'bold' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              Choose a Photo or Video
              <input 
                type="file" 
                accept="image/*,video/*" 
                hidden
                onChange={handleFileChange} 
              />
            </label>
          </div>
          {preview && (
            <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
            </div>
          )}
          <div className="modal-actions">
            <button 
              className="btn-primary" 
              onClick={handlePost}
              disabled={!selectedFile || uploading || loading}
            >
              {uploading || loading ? "Posting..." : "Post Story"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
