import API from "./api";

export const sendConnectionRequest = async (from_user, to_user) => {
  const res = await API.post("/connections", { from_user, to_user });
  return res.data;
};

export const getConnectionStatus = async (from, to) => {
  const res = await API.get("/connections/status", {
    params: { from, to }
  });
  return res.data.status; // Returns "none", "pending", "accepted", "rejected"
};

export const getPendingRequests = async (uid) => {
  const res = await API.get(`/connections/pending/${uid}`);
  return res.data;
};

export const updateConnectionStatus = async (id, status) => {
  const res = await API.put(`/connections/${id}`, { status });
  return res.data;
};

export const getAcceptedConnections = async (uid) => {
  const res = await API.get(`/connections/accepted/${uid}`);
  return res.data; // Array of user IDs
};
