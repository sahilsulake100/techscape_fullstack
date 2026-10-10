import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/AuthContext";

import { getTeamById, addMemberToTeam } from "../../lib/team-service";
import { getAcceptedConnections } from "../../lib/connection-service";
import { getUserProfile } from "../../lib/profile-service";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";
import Loader from "../../components/common/Loader";
import { toast } from "sonner";
import RecommendedDevelopers from "../../components/teams/RecommendedDevelopers";
import { ArrowLeft, Users, ExternalLink } from "lucide-react";

export default function TeamDetails() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, [id, user]);

  async function loadTeam() {
    setLoading(true);

    try {
      const teamData = await getTeamById(id);
      if (!teamData) {
        setTeam(null);
        setLoading(false);
        return;
      }

      setTeam(teamData);

      // Load team members profiles safely
      const memberIds = Array.isArray(teamData.members)
        ? teamData.members
            .map((m) => (typeof m === "object" && m !== null ? m.id || m._id : m))
            .filter((m) => typeof m === "string" || typeof m === "number")
        : [];

      const memberProfiles = await Promise.all(
        memberIds.map((uid) => getUserProfile(uid).catch(() => null))
      );

      setMembers(memberProfiles.filter(Boolean));

      // Load accepted connections
      if (user) {
        try {
          const connectedUserIds = await getAcceptedConnections(user.id);
          setConnections(
            (connectedUserIds || []).filter((uid) => !memberIds.includes(uid))
          );
        } catch (connErr) {
          console.warn("Could not load connections:", connErr);
          setConnections([]);
        }
      }
    } catch (err) {
      console.error("Failed to load team:", err);
      toast.error("Failed to load team details");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(uid) {
    await addMemberToTeam(id, uid);
    toast.success("Member added to team");
    loadTeam();
  }

  if (loading) return <Loader />;

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Team Not Found</h2>
        <p className="text-muted-foreground">The team you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate("/teams")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Teams
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/teams")}
          className="gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Teams
        </Button>
      </div>

      {/* Team Info */}
      <Card className="p-6 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{team.name || "Untitled Team"}</h1>
            {team.description && (
              <p className="text-slate-600 mt-2">{team.description}</p>
            )}
            <p className="text-muted-foreground text-sm mt-1">
              Members: {team.members?.length || members.length || 0}
            </p>
          </div>

          <Button
            onClick={() => navigate(`/teams/${id}/collaboration`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
          >
            Open Collaboration Hub
          </Button>
        </div>
      </Card>

      {/* Team Members */}
      <div>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          Team Members
        </h2>
        <div className="flex flex-wrap gap-3">
          {members.length === 0 ? (
            <p className="text-muted-foreground text-sm">No member details available.</p>
          ) : (
            members.map((m) => (
              <Badge
                key={m.id || m._id || m.username}
                variant="secondary"
                onClick={() =>
                  navigate(`/public-profile/${m.username || m.id}`)
                }
                className="cursor-pointer hover:bg-indigo-100 hover:text-indigo-700 transition-colors py-2 px-3 text-sm flex items-center gap-2 border border-slate-200"
              >
                <span>{m.fullName || m.full_name || m.username || "Teammate"}</span>
                {m.username && (
                  <span className="text-xs text-muted-foreground">
                    (@{m.username})
                  </span>
                )}
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <RecommendedDevelopers
        teamId={id}
        onInvite={handleInvite}
        currentMembers={team.members || []}
      />

      {/* Invite Connected Users */}
      <div className="pt-6 border-t border-slate-200/50">
        <h2 className="text-xl font-bold text-slate-800 mb-3">Other Connections</h2>

        {connections.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No connected users available to invite.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {connections.map((uid) => (
              <InviteCard
                key={uid}
                userId={uid}
                onInvite={handleInvite}
                onViewProfile={(uname) => navigate(`/public-profile/${uname}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------
   Invite Card Component
---------------------------- */
function InviteCard({ userId, onInvite, onViewProfile }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getUserProfile(userId).then(setProfile);
  }, [userId]);

  if (!profile) return null;

  const displayName = profile.fullName || profile.full_name || "Developer";

  return (
    <Card className="p-4 flex justify-between items-center">
      <div
        className="cursor-pointer hover:opacity-80 transition"
        onClick={() => onViewProfile(profile.username || userId)}
      >
        <p className="font-semibold flex items-center gap-1.5">
          {displayName}
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </p>
        {profile.username && (
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        )}
      </div>

      <Button onClick={() => onInvite(userId)}>Invite</Button>
    </Card>
  );
}
