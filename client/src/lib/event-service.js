import API from "./api";

export const fetchEvents = async () => {
  const res = await API.get("/events");
  return res.data;
};

export const fetchEventById = async (id) => {
  const res = await API.get(`/events/${id}`);
  return res.data;
};

export const fetchEventsByOrganizer = async (uid) => {
  const res = await API.get(`/events/organizer/${uid}`);
  return res.data;
};

export const createEvent = async (data) => {
  const res = await API.post("/events", data);
  return res.data;
};

export const getUserWatchlist = async (uid) => {
  const res = await API.get(`/events/watchlist/user/${uid}`);
  return res.data;
};

export const addToWatchlist = async (uid, event) => {
  const res = await API.post(`/events/${event.id || event}/watchlist`);
  return res.data;
};

export const removeFromWatchlist = async (uid, eventId) => {
  const res = await API.delete(`/events/${eventId}/watchlist`);
  return res.data;
};
