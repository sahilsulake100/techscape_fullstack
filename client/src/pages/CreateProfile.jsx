import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/AuthContext";
import { createOrUpdateProfile } from "../lib/profile-service";

import {
  User,
  AtSign,
  Briefcase,
  FileText,
  Code,
  Link as LinkIcon,
  Image,
  Save,
  ArrowLeft,
} from "lucide-react";

import { toast } from "sonner";

/* ================= ANIMATIONS ================= */

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const gridVariants = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const inputVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ================= COMPONENT ================= */

const CreateProfile = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    role: "frontend",
    bio: "",
    skills: "",
    portfolio_url: "",
    avatar_url: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      await createOrUpdateProfile(user.id, {
        full_name: formData.full_name,
        username: formData.username.toLowerCase(),
        role: formData.role,
        bio: formData.bio,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        email: user.primaryEmailAddress?.emailAddress || "",
      });

      toast.success("Profile created successfully!");
      navigate("/dashboard/my-profile");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] bg-[radial-gradient(at_top_left,_#e2e8f0_0%,_transparent_50%),_radial-gradient(at_top_right,_#c7d2fe_0%,_transparent_50%)] flex items-center justify-center px-4">

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-xl p-10"
      >

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800">
              Create Your Profile
            </h1>
            <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
              Tell the community about yourself
            </p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >

            <AnimatedInput
              icon={User}
              label="Full Name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              required
            />

            <AnimatedInput
              icon={AtSign}
              label="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />

            <AnimatedSelect
              label="Primary Role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="frontend">Frontend Developer</option>
              <option value="backend">Backend Developer</option>
              <option value="fullstack">Full Stack Developer</option>
              <option value="designer">UI / UX Designer</option>
              <option value="ml">ML / AI Engineer</option>
              <option value="iot">IoT / Hardware</option>
            </AnimatedSelect>

            <AnimatedInput
              icon={Code}
              label="Skills (comma separated)"
              value={formData.skills}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
            />

            <AnimatedTextarea
              icon={FileText}
              label="Bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
            />

            <AnimatedInput
              icon={LinkIcon}
              label="Portfolio URL"
              type="url"
              value={formData.portfolio_url}
              onChange={(e) =>
                setFormData({ ...formData, portfolio_url: e.target.value })
              }
            />

            <AnimatedInput
              icon={Image}
              label="Avatar Image URL"
              value={formData.avatar_url}
              onChange={(e) =>
                setFormData({ ...formData, avatar_url: e.target.value })
              }
            />

          </motion.div>

          {/* ACTIONS */}
          <div className="flex justify-between items-center mt-12">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 font-bold"
            >
              <ArrowLeft size={18} /> Back
            </motion.button>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              disabled={saving}
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl flex items-center gap-3"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Create Profile"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const AnimatedInput = ({ icon: Icon, label, ...props }) => (
  <motion.div variants={inputVariants} className="bg-white/60 border border-slate-200 rounded-2xl p-4">
    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">
      {label}
    </label>
    <div className="flex items-center gap-3 mt-1">
      <Icon size={16} className="text-slate-400" />
      <input {...props} className="w-full bg-transparent outline-none font-bold text-sm" />
    </div>
  </motion.div>
);

const AnimatedTextarea = ({ icon: Icon, label, ...props }) => (
  <motion.div variants={inputVariants} className="bg-white/60 border border-slate-200 rounded-2xl p-4 md:col-span-2">
    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">
      {label}
    </label>
    <div className="flex items-start gap-3 mt-1">
      <Icon size={16} className="text-slate-400 mt-1" />
      <textarea
        rows={3}
        {...props}
        className="w-full bg-transparent outline-none font-bold text-sm resize-none"
      />
    </div>
  </motion.div>
);

const AnimatedSelect = ({ label, children, ...props }) => (
  <motion.div variants={inputVariants} className="bg-white/60 border border-slate-200 rounded-2xl p-4">
    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">
      {label}
    </label>
    <select
      {...props}
      className="w-full bg-transparent outline-none font-bold text-sm mt-2"
    >
      {children}
    </select>
  </motion.div>
);

export default CreateProfile;
