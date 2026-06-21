import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import Home from "./pages/Home";
import EventsList from "./pages/Events/EventsList";
import EventDetails from "./pages/Events/EventDetails";
import CreateEvent from "./pages/Events/CreateEvent";

import TeamsList from "./pages/Teams/TeamsList";
import TeamDetails from "./pages/Teams/TeamDetails";
import CreateTeam from "./pages/Teams/CreateTeam";
import TeamCollaboration from "./pages/Teams/TeamCollaboration";
import MyTeams from "./pages/Teams/MyTeams";
import FindTeammates from "./pages/Teams/FindTeammates";

import DashboardHome from "./pages/Dashboard/DashboardHome";
import ProfileSettings from "./pages/Dashboard/ProfileSettings";
import MyWatchlist from "./pages/Dashboard/MyWatchlist";
import MyProfile from "./pages/Dashboard/MyProfile";
import MyConnections from "./pages/Dashboard/MyConnections";

import SignInPage from "./pages/Auth/SignInPage";
import SignUpPage from "./pages/Auth/SignUpPage";
import PublicProfile from "./pages/PublicProfile";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Public Profile */}
        <Route path="/public-profile/:username" element={<PublicProfile />} />

        {/* Auth */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Main Website */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />

          {/* Events */}
          <Route path="events" element={<EventsList />} />
          <Route path="events/:id" element={<EventDetails />} />

          {/* Teams HUB */}
          <Route path="teams" element={<TeamsList />} />
          <Route path="teams/find-teammates" element={<FindTeammates />} />
          <Route path="teams/create" element={<CreateTeam />} />
          <Route path="teams/my-teams" element={<MyTeams />} />
          <Route path="teams/:id" element={<TeamDetails />} />
          <Route
            path="teams/:id/collaboration"
            element={<TeamCollaboration />}
          />
        </Route>

        {/* Dashboard (Protected) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="watchlist" element={<MyWatchlist />} />
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="connections" element={<MyConnections />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}
