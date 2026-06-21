import API from "./api";

export const getUserProfile = async (identifier) => {
  try {
    const res = await API.get(`/profiles/${identifier}`);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // Return null if profile doesn't exist yet
    }
    throw error;
  }
};

export const createOrUpdateProfile = async (uid, data) => {
  const res = await API.put(`/profiles/${uid}`, data);
  return res.data;
};

export const isUsernameTaken = async (username, excludeUid = "") => {
  const res = await API.get(`/profiles/username/check`, {
    params: { username, exclude: excludeUid }
  });
  return res.data.taken;
};

export const fetchCandidatesByRole = async (role) => {
  const res = await API.get(`/profiles/role/${role}`);
  return res.data;
};
