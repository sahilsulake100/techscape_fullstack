import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

export default function TeamDetails() {
  const { id } = useParams();
  const { user } = useUser();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, [id, user]);

  async function loadTeam() {
    setLoading(true);

    const teamData = await getTeamById(id);
    if (!teamData) return;

    setTeam(teamData);

    // Load team members profiles
    const memberProfiles = await Promise.all(
  teamData.members
    .filter(m => typeof m === "string") // ✅ ensure uid
    .map(uid => getUserProfile(uid))
);

    setMembers(memberProfiles.filter(Boolean));

    // Load accepted connections
    if (user) {
      const connectedUserIds = await getAcceptedConnections(user.id);
      setConnections(
        connectedUserIds.filter(uid => !teamData.members.includes(uid))
      );
    }

    setLoading(false);
  }

  async function handleInvite(uid) {
    await addMemberToTeam(id, uid);
    toast.success("Member added to team");
    loadTeam();
  }

  if (loading) return <Loader />;
  if (!team) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Team not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">

      {/* Team Info */}
      <Card className="p-6 space-y-2">
        <h1 className="text-3xl font-bold">{team.name}</h1>
        <p className="text-muted-foreground">
          Members: {team.members.length}
        </p>
      </Card>

      {/* Team Members */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Team Members</h2>
        <div className="flex flex-wrap gap-3">
          {members.map(m => (
            <Badge key={m.id} variant="secondary">
              {m.full_name}
            </Badge>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <RecommendedDevelopers
        teamId={id}
        onInvite={handleInvite}
        currentMembers={team.members}
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
            {connections.map(uid => (
              <InviteCard
                key={uid}
                userId={uid}
                onInvite={handleInvite}
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
function InviteCard({ userId, onInvite }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getUserProfile(userId).then(setProfile);
  }, [userId]);

  if (!profile) return null;

  return (
    <Card className="p-4 flex justify-between items-center">
      <div>
        <p className="font-semibold">{profile.full_name}</p>
        <p className="text-sm text-muted-foreground">
          @{profile.username}
        </p>
      </div>

      <Button onClick={() => onInvite(userId)}>
        Invite
      </Button>
    </Card>
  );
}
