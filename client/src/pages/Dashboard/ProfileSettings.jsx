// src/pages/Dashboard/ProfileSettings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";

import Loader from "../../components/common/Loader";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { useUser } from "../../contexts/AuthContext";
import {
  createOrUpdateProfile,
  getUserProfile,
  isUsernameTaken,
} from "../../lib/profile-service";

const ROLE_OPTIONS = [
  { value: "frontend", label: "Frontend Developer" },
  { value: "backend", label: "Backend Developer" },
  { value: "fullstack", label: "Full Stack Developer" },
  { value: "designer", label: "UI / UX Designer" },
  { value: "ml", label: "ML / AI Engineer" },
  { value: "iot", label: "IoT / Hardware Engineer" },
];

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    role: "frontend", // ✅ NEW
    college: "",
    location: "",
    bio: "",
    skills: "",
    projects: "",
    linkedin: "",
    instagram: "",
    email: "",
  });

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const profile = await getUserProfile(user.id);

        if (profile) {
          setForm({
            full_name: profile.full_name || user.fullName || "",
            username: profile.username || "",
            role: profile.role || "frontend", // ✅ LOAD ROLE
            college: profile.college || "",
            location: profile.location || "",
            bio: profile.bio || "",
            skills: (profile.skills || []).join(", "),
            projects: (profile.projects || []).join("\n"),
            linkedin: profile.linkedin || "",
            instagram: profile.instagram || "",
            email:
              profile.email ||
              user.primaryEmailAddress?.emailAddress ||
              "",
          });
        } else {
          setForm((f) => ({
            ...f,
            full_name: user.fullName || "",
            email:
              user.primaryEmailAddress?.emailAddress ||
              user.emailAddresses?.[0]?.emailAddress ||
              "",
          }));
        }
      } catch (err) {
        toast.error("Failed to load profile");
      }

      setLoading(false);
    };

    load();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    setSaving(true);

    try {
      const username = form.username.trim();

      if (username) {
        const taken = await isUsernameTaken(username, user.id);
        if (taken) {
          toast.error("Username is already taken.");
          setSaving(false);
          return;
        }
      }

      const profilePayload = {
        id: user.id,
        full_name: form.full_name.trim(),
        username: username || null,
        role: form.role, // ✅ SAVE ROLE
        college: form.college.trim() || null,
        location: form.location.trim() || null,
        bio: form.bio.trim() || null,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        projects: form.projects
          .split(/\r?\n|,/)
          .map((p) => p.trim())
          .filter(Boolean),
        linkedin: form.linkedin.trim() || null,
        instagram: form.instagram.trim() || null,
        email: form.email,
        avatar_url: user.imageUrl,
      };

      await createOrUpdateProfile(user.id, profilePayload);

      toast.success("Profile saved!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to save profile");
    }

    setSaving(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <Card className="p-8 border-border/50">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Profile Photo */}
          <div className="flex items-center gap-6">
            <img
              src={user.imageUrl}
              alt="profile"
              className="w-28 h-28 rounded-full object-cover shadow"
            />
            <p className="text-sm text-muted-foreground">
              Profile photo is managed by Clerk.
            </p>
          </div>

          {/* Name & Username */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Username</Label>
              <Input
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value.toLowerCase().replace(/\s+/g, ""),
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                Public URL: /public-profile/{form.username || "username"}
              </p>
            </div>
          </div>

          {/* ✅ ROLE FIELD */}
          <div>
            <Label>Primary Role</Label>
            <select
              className="w-full border rounded-md p-2 bg-background"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* College & Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>College</Label>
              <Input
                value={form.college}
                onChange={(e) =>
                  setForm({ ...form, college: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label>Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) =>
                setForm({ ...form, bio: e.target.value })
              }
            />
          </div>

          {/* Skills */}
          <div>
            <Label>Skills</Label>
            <Input
              value={form.skills}
              onChange={(e) =>
                setForm({ ...form, skills: e.target.value })
              }
            />
          </div>

          {/* Projects */}
          <div>
            <Label>Projects</Label>
            <Textarea
              value={form.projects}
              onChange={(e) =>
                setForm({ ...form, projects: e.target.value })
              }
            />
          </div>

          {/* Social */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>LinkedIn</Label>
              <Input
                value={form.linkedin}
                onChange={(e) =>
                  setForm({ ...form, linkedin: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input
                value={form.instagram}
                onChange={(e) =>
                  setForm({ ...form, instagram: e.target.value })
                }
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            <Save className="mr-2 w-4 h-4" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfileSettings;
