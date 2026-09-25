"use client";

import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $username: String, $bio: String, $coverImage: String, $image: String) {
    updateProfile(name: $name, username: $username, bio: $bio, coverImage: $coverImage, image: $image) {
      id
      name
      username
      bio
      coverImage
      image
    }
  }
`;

export default function EditProfileModal({ 
  isOpen, 
  onClose, 
  user 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  user: { name?: string | null, username?: string | null, bio?: string | null, image?: string | null, coverImage?: string | null };
}) {
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateProfile] = useMutation<any>(UPDATE_PROFILE);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let coverImageUrl = user?.coverImage;
      let profileImageUrl = user?.image;

      if (coverImageFile) {
        coverImageUrl = await handleFileUpload(coverImageFile);
      }
      if (profileImageFile) {
        profileImageUrl = await handleFileUpload(profileImageFile);
      }

      await updateProfile({
        variables: {
          name,
          username,
          bio,
          coverImage: coverImageUrl,
          image: profileImageUrl,
        }
      });
      onClose();
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to update profile: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit profile</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label>Cover Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="form-group">
            <label>Profile Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
            />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bio"
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
