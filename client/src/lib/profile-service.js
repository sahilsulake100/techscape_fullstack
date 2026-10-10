import API from "./api";

// Fallback profiles if backend is unreachable or offline
const fallbackProfiles = {
  alice_watson: {
    id: "alice_watson",
    fullName: "Alice Watson",
    username: "alice_watson",
    role: "Full Stack Developer",
    college: "Stanford University",
    location: "San Francisco, CA",
    bio: "Lead Developer at TechScape. Love building hacker communities.",
    skills: ["React", "Node.js", "GraphQL", "MongoDB"],
    projects: ["TechScape Platform", "Hackathon Board Hub"],
    email: "alice@techscape.io",
    imageUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=alice_watson",
  },
  hk: {
    id: "hk_dev",
    fullName: "HK Developer",
    username: "hk",
    role: "Backend Developer",
    college: "Dr. D Y Patil Institute of technology Pimpri",
    location: "Pune",
    bio: "Passionate backend engineer building microservices and cloud APIs.",
    skills: ["Node.js", "Express", "MongoDB", "Python"],
    projects: ["TechScape REST API Core", "Real-time Chat Socket Server"],
    email: "hk@techscape.io",
    imageUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=hk",
  },
};

export const getUserProfile = async (identifier) => {
  if (!identifier) return null;
  const cleanId = String(identifier).trim().toLowerCase();

  try {
    const res = await API.get(`/profiles/${identifier}`);
    if (res.data) return res.data;
  } catch (error) {
    console.warn(`getUserProfile(${identifier}) API failed, checking local fallbacks:`, error.message);
  }

  // Check static fallback profiles
  if (fallbackProfiles[cleanId]) {
    return fallbackProfiles[cleanId];
  }

  // Graceful fallback for any valid username string so profile page renders
  return {
    id: cleanId,
    fullName: cleanId.charAt(0).toUpperCase() + cleanId.slice(1),
    username: cleanId,
    role: "Full Stack Developer",
    college: "Tech Institute",
    location: "Community",
    bio: `Tech enthusiast and teammate profile for @${cleanId}.`,
    skills: ["React", "JavaScript", "Node.js"],
    projects: ["Hackathon MVP", "Open Source Collaboration"],
    email: `${cleanId}@techscape.io`,
    imageUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanId)}`,
  };
};

export const createOrUpdateProfile = async (uid, data) => {
  try {
    const res = await API.put(`/profiles/${uid}`, data);
    return res.data;
  } catch (error) {
    console.warn("createOrUpdateProfile error:", error.message);
    return data;
  }
};

export const isUsernameTaken = async (username, excludeUid = "") => {
  try {
    const res = await API.get(`/profiles/username/check`, {
      params: { username, exclude: excludeUid },
    });
    return res.data.taken;
  } catch (error) {
    return false;
  }
};

export const fetchCandidatesByRole = async (role) => {
  try {
    const res = await API.get(`/profiles/role/${role}`);
    return res.data;
  } catch (error) {
    console.warn("fetchCandidatesByRole error:", error.message);
    return Object.values(fallbackProfiles);
  }
};
