import API from "./api";

// Fallback mock team in case backend is offline or ID does not exist
const fallbackTeam = {
  id: "mock_team_fallback",
  name: "TechScape Hackathon Team",
  description: "Building creative web applications for modern developers.",
  skills_needed: ["React", "JavaScript", "Node.js"],
  max_members: 5,
  leader_name: "Sahil Sulake",
  members: ["alice_watson"],
};

export const fetchTeams = async () => {
  try {
    const res = await API.get("/teams");
    return res.data;
  } catch (error) {
    console.warn("fetchTeams error:", error.message);
    return [fallbackTeam];
  }
};

export const getTeamById = async (id) => {
  try {
    const res = await API.get(`/teams/${id}`);
    return res.data;
  } catch (error) {
    console.warn(`getTeamById(${id}) error:`, error.message);
    return { ...fallbackTeam, id, name: "TechScape Team" };
  }
};

export const createTeam = async (data) => {
  try {
    const res = await API.post("/teams", data);
    return res.data;
  } catch (error) {
    console.warn("createTeam error:", error.message);
    return { ...fallbackTeam, ...data, id: Date.now().toString() };
  }
};

export const addMemberToTeam = async (teamId, memberId) => {
  try {
    const res = await API.post(`/teams/${teamId}/members`, { memberId });
    return res.data;
  } catch (error) {
    console.warn("addMemberToTeam error:", error.message);
    return null;
  }
};

export const fetchUserTeams = async (uid) => {
  try {
    const res = await API.get(`/teams/user/${uid}`);
    return res.data;
  } catch (error) {
    console.warn("fetchUserTeams error:", error.message);
    return [fallbackTeam];
  }
};

export const getAiRecommendations = async (teamId) => {
  try {
    const res = await API.get(`/ai/recommend-teammates/${teamId}`);
    return res.data;
  } catch (error) {
    console.warn("getAiRecommendations error:", error.message);
    return [];
  }
};
