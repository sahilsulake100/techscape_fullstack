import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/AuthContext";
import { getUserProfile } from "../lib/profile-service";
import { sendConnectionRequest, getConnectionStatus } from "../lib/connection-service";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Loader from "../components/common/Loader";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  MapPin,
  GraduationCap,
  Mail,
  Linkedin,
  Instagram,
  ArrowLeft,
  UserCheck,
  UserPlus,
  Clock,
  Briefcase,
  Code2
} from "lucide-react";

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("none"); // "none", "pending", "accepted", "rejected"
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const profileData = await getUserProfile(username);
        if (profileData) {
          setProfile(profileData);
          
          // Check connection status if user is logged in and not viewing own profile
          if (currentUser && currentUser.id !== profileData.id) {
            const status = await getConnectionStatus(currentUser.id, profileData.id);
            setConnectionStatus(status);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, currentUser]);

  const handleConnect = async () => {
    if (!currentUser) {
      toast.error("Please sign in to connect with developers");
      navigate("/sign-in");
      return;
    }

    setConnecting(true);
    try {
      await sendConnectionRequest(currentUser.id, profile.id);
      setConnectionStatus("pending");
      toast.success("Connection request sent!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send connection request");
    } finally {
      setConnecting(false);
    }
  };

  if (loading) return <Loader />;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9]">
        <Card className="p-8 text-center max-w-md bg-white/60 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Not Found</h2>
          <p className="text-slate-500 mb-6">The developer profile you are looking for does not exist.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === profile.id;

  return (
    <div className="min-h-screen bg-[#f1f5f9] bg-[radial-gradient(at_top_left,_#e2e8f0_0%,_transparent_50%),_radial-gradient(at_top_right,_#c7d2fe_0%,_transparent_50%)] py-12 px-4">
      <div className="container max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Back */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-xl p-8 md:p-12 space-y-8"
        >
          
          {/* Header Info */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 pb-8 border-b border-slate-200/50">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <img
                src={profile.imageUrl}
                alt={profile.fullName}
                className="w-28 h-28 rounded-[2rem] object-cover shadow-lg border-2 border-white bg-indigo-50"
              />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h1 className="text-3xl font-black text-slate-800">{profile.fullName}</h1>
                  <Badge variant="secondary" className="capitalize text-xs font-bold bg-indigo-50 text-indigo-700">
                    {profile.role}
                  </Badge>
                </div>
                <p className="text-slate-500 font-bold">@{profile.username}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-600 font-medium pt-1">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      {profile.location}
                    </span>
                  )}
                  {profile.college && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      {profile.college}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Connection Button */}
            {!isOwnProfile && (
              <div className="pt-2">
                {connectionStatus === "none" && (
                  <Button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Connect
                  </Button>
                )}
                {connectionStatus === "pending" && (
                  <Button
                    disabled
                    variant="secondary"
                    className="py-6 px-8 rounded-xl flex items-center gap-2 border border-slate-200"
                  >
                    <Clock className="w-5 h-5 text-amber-500" />
                    Request Sent
                  </Button>
                )}
                {connectionStatus === "accepted" && (
                  <Button
                    disabled
                    variant="secondary"
                    className="py-6 px-8 rounded-xl flex items-center gap-2 border border-slate-200 bg-emerald-50 text-emerald-700"
                  >
                    <UserCheck className="w-5 h-5 text-emerald-500" />
                    Connected
                  </Button>
                )}
              </div>
            )}
            {isOwnProfile && (
              <Button
                onClick={() => navigate("/dashboard/profile")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg"
              >
                Edit Profile
              </Button>
            )}
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-black text-slate-400">About Me</h3>
              <p className="text-slate-700 leading-relaxed text-lg bg-white/40 p-6 rounded-2xl border border-white/40">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Skills Section */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-black text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-4.5 h-4.5 text-indigo-600" />
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-800 hover:bg-indigo-50 font-bold"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {profile.projects && profile.projects.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-black text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-4.5 h-4.5 text-indigo-600" />
                Featured Projects
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {profile.projects.map((project, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-2xl bg-white/40 border border-white/50 hover:border-indigo-200 hover:shadow-md transition-all flex items-start gap-3"
                  >
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 mt-0.5">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-slate-700 font-bold text-base leading-relaxed">{project}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-3 pt-4 border-t border-slate-200/50">
            <h3 className="text-xs uppercase tracking-widest font-black text-slate-400">Social Connections</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/40 border border-white/50 text-slate-600 hover:text-indigo-600 hover:bg-white/80 transition-all font-semibold"
                >
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <span className="truncate">{profile.email}</span>
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://${profile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/40 border border-white/50 text-slate-600 hover:text-indigo-600 hover:bg-white/80 transition-all font-semibold"
                >
                  <Linkedin className="w-5 h-5 text-indigo-600" />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {profile.instagram && (
                <a
                  href={profile.instagram.startsWith("http") ? profile.instagram : `https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/40 border border-white/50 text-slate-600 hover:text-indigo-600 hover:bg-white/80 transition-all font-semibold"
                >
                  <Instagram className="w-5 h-5 text-indigo-600" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default PublicProfile;
