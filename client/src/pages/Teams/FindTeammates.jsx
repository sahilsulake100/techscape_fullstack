import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/AuthContext";

import { fetchCandidatesByRole } from "../../lib/profile-service";
import {
  sendConnectionRequest,
  getConnectionStatus,
} from "../../lib/connection-service";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";
import Loader from "../../components/common/Loader";

const ROLES = [
  { label: "Frontend", value: "frontend" },
  { label: "Backend", value: "backend" },
  { label: "Full Stack", value: "fullstack" },
  { label: "UI/UX", value: "designer" },
  { label: "ML / AI", value: "ml" },
  { label: "IoT", value: "iot" },
];

export default function FindTeammates() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("frontend");
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    loadProfiles();
  }, [selectedRole]);

  async function loadProfiles() {
    if (!user) return;
    setLoading(true);

    const data = await fetchCandidatesByRole(selectedRole, user.id);

    const statusObj = {};
    for (let p of data) {
      statusObj[p.id] = await getConnectionStatus(user.id, p.id);
    }

    setProfiles(data);
    setStatusMap(statusObj);
    setLoading(false);
  }

  async function handleConnect(targetId) {
    await sendConnectionRequest(user.id, targetId);
    setStatusMap((prev) => ({ ...prev, [targetId]: "pending" }));
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">Find Teammates</h1>
      <p className="text-muted-foreground">
        Discover developers by role and connect instantly.
      </p>

      {/* Role Filter */}
      <div className="flex flex-wrap gap-2">
        {ROLES.map((role) => (
          <Button
            key={role.value}
            variant={selectedRole === role.value ? "default" : "outline"}
            onClick={() => setSelectedRole(role.value)}
          >
            {role.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : profiles.length === 0 ? (
        <p className="text-muted-foreground">
          No teammates found for this role.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((p) => (
            <Card key={p.id} className="p-5 space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{p.full_name}</h3>
                <p className="text-sm text-muted-foreground">
                  @{p.username}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {p.skills?.slice(0, 4).map((skill, i) => (
                  <Badge key={i} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/public-profile/${p.username}`)
                  }
                >
                  View Profile
                </Button>

                {statusMap[p.id] === "none" && (
                  <Button onClick={() => handleConnect(p.id)}>
                    Connect
                  </Button>
                )}

                {statusMap[p.id] === "pending" && (
                  <Button disabled variant="secondary">
                    Request Sent
                  </Button>
                )}

                {statusMap[p.id] === "accepted" && (
                  <Button disabled variant="secondary">
                    Connected
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
