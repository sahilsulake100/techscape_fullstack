import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/AuthContext";
import { createEvent } from "../../lib/event-service";

import {
  Calendar,
  Image,
  MapPin,
  Tag,
  Link as LinkIcon,
  Save,
  ArrowLeft,
  Video,
  Users,
  FileText,
  Layers,
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

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "hackathon",
    start_date: "",
    end_date: "",
    location: "",
    is_virtual: false,
    registration_url: "",
    max_participants: "",
    tags: "",
  });

  /* ===== IMAGE PREVIEW ===== */
  useEffect(() => {
    if (!file) return setPreviewUrl(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  /* ===== SUBMIT ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Login required");

    setLoading(true);

    try {
      let imageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60";
      
      if (formData.event_type === "workshop") {
        imageUrl = "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60";
      } else if (formData.event_type === "coding_contest") {
        imageUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60";
      } else if (formData.event_type === "meetup") {
        imageUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60";
      }

      await createEvent({
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        image_url: imageUrl,
      });

      toast.success("Event created!");
      navigate("/events");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create event");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] bg-[radial-gradient(at_top_left,_#e2e8f0_0%,_transparent_50%),_radial-gradient(at_top_right,_#c7d2fe_0%,_transparent_50%)] flex items-center justify-center px-4">

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-xl p-10"
      >

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Layers size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800">
              Create New Event
            </h1>
            <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
              Publish a tech event for the community
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

            <AnimatedInput icon={Layers} label="Event Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required />

            <AnimatedSelect
              label="Event Type"
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            >
              <option value="hackathon">Hackathon</option>
              <option value="coding_contest">Coding Contest</option>
              <option value="workshop">Workshop</option>
              <option value="conference">Conference</option>
              <option value="meetup">Meetup</option>
            </AnimatedSelect>

            <AnimatedInput icon={Calendar} type="date" label="Start Date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required />

            <AnimatedInput icon={Calendar} type="date" label="End Date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required />

            <AnimatedTextarea icon={FileText} label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required />

            <AnimatedInput icon={Tag} label="Tags (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />

            <AnimatedInput icon={MapPin} label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={formData.is_virtual} />

            <AnimatedInput icon={Users} label="Max Participants"
              value={formData.max_participants}
              onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })} />

            {/* IMAGE */}
            <motion.div variants={inputVariants} className="bg-white/60 border border-slate-200 rounded-2xl p-4 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">
                Event Image
              </label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
              {previewUrl && (
                <img src={previewUrl} className="mt-3 w-48 h-32 rounded-lg object-cover" />
              )}
            </motion.div>

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
              disabled={loading || uploadingImage}
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl flex items-center gap-3"
            >
              <Save size={18} />
              {loading || uploadingImage ? "Creating..." : "Create Event"}
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
    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">{label}</label>
    <div className="flex items-center gap-3 mt-1">
      <Icon size={16} className="text-slate-400" />
      <input {...props} className="w-full bg-transparent outline-none font-bold text-sm" />
    </div>
  </motion.div>
);

const AnimatedTextarea = ({ icon: Icon, label, ...props }) => (
  <motion.div variants={inputVariants} className="bg-white/60 border border-slate-200 rounded-2xl p-4 md:col-span-2">
    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">{label}</label>
    <div className="flex items-start gap-3 mt-1">
      <Icon size={16} className="text-slate-400 mt-1" />
      <textarea {...props} rows={3} className="w-full bg-transparent outline-none font-bold text-sm resize-none" />
    </div>
  </motion.div>
);

const AnimatedSelect = ({ label, children, ...props }) => (
  <motion.div variants={inputVariants} className="bg-white/60 border border-slate-200 rounded-2xl p-4">
    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">{label}</label>
    <select {...props} className="w-full bg-transparent outline-none font-bold text-sm mt-2">
      {children}
    </select>
  </motion.div>
);

export default CreateEvent;
