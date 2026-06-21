import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/AuthContext";
import { fetchUserTeams } from "../../lib/team-service";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/Button";
import Loader from "../../components/common/Loader";

export default function MyTeams() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeams() {
      if (!user) return;
      try {
        const data = await fetchUserTeams(user.id);
        setTeams(data || []);
      } catch (err) {
        console.error("Failed to load user teams:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, [user]);

  <div>
  {loading && <Loader />}
  {!loading && teams.length === 0 && (
    <p className="text-center text-muted-foreground">
      No teams available
    </p>
  )}
</div>


  return (
    <div className="container mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">My Teams</h1>

      {teams.length === 0 ? (
        <p className="text-muted-foreground">
          You are not part of any team yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">{team.name}</h2>

              <p className="text-sm text-muted-foreground">
                Members: {team.members.length}
              </p>

              <Button
                onClick={() => navigate(`/teams/${team.id}/collaboration`)}
              >
                Open Collaboration
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
