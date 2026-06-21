import API from "./api";

export const fetchTeams = async () => {
  const res = await API.get("/teams");
  return res.data;
};

export const getTeamById = async (id) => {
  const res = await API.get(`/teams/${id}`);
  return res.data;
};

export const createTeam = async (data) => {
  const res = await API.post("/teams", data);
  return res.data;
};

export const addMemberToTeam = async (teamId, memberId) => {
  const res = await API.post(`/teams/${teamId}/members`, { memberId });
  return res.data;
};

export const fetchUserTeams = async (uid) => {
  const res = await API.get(`/teams/user/${uid}`);
  return res.data;
};

export const getAiRecommendations = async (teamId) => {
  const res = await API.get(`/ai/recommend-teammates/${teamId}`);
  return res.data;
};
