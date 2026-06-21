// src/pages/Dashboard/MyConnections.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/AuthContext";

import {
  getPendingRequests,
  updateConnectionStatus,
} from "../../lib/connection-service";
import { getUserProfile } from "../../lib/profile-service";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/Button";
import Loader from "../../components/common/Loader";
import { toast } from "sonner";

export default function MyConnections() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadRequests();
  }, [user]);

  async function loadRequests() {
    setLoading(true);

    try {
      const pending = await getPendingRequests(user.id);

      const enriched = await Promise.all(
        pending.map(async (req) => {
          const profile = await getUserProfile(req.from_user);
          return { ...req, profile };
        })
      );

      setRequests(enriched);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(reqId) {
    try {
      await updateConnectionStatus(reqId, "accepted");
      toast.success("Connection accepted");
      loadRequests();
    } catch {
      toast.error("Failed to accept request");
    }
  }

  async function handleReject(reqId) {
    try {
      await updateConnectionStatus(reqId, "rejected");
      toast.info("Request rejected");
      loadRequests();
    } catch {
      toast.error("Failed to reject request");
    }
  }

  /* ---------------- UI ---------------- */

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">Connection Requests</h1>

      {requests.length === 0 ? (
        <p className="text-muted-foreground">No pending requests.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <Card key={req.id} className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">
                {req.profile?.full_name || "Unknown User"}
              </h3>
              <p className="text-sm text-muted-foreground">
                @{req.profile?.username || "unknown"}
              </p>

              <div className="flex gap-2">
                <Button onClick={() => handleAccept(req.id)}>
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(req.id)}
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => navigate("/dashboard")}
      >
        Back to Dashboard
      </Button>
    </div>
  );
}
