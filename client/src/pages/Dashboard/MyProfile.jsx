import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/AuthContext";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";
import Loader from "../../components/common/Loader";

import { getUserProfile } from "../../lib/profile-service";
import { ArrowLeft, Edit } from "lucide-react";

export default function MyProfile() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const data = await getUserProfile(user.id);
      setProfile(data);
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  if (loading) return <Loader />;

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Profile not found.</p>
        <Button className="mt-4" onClick={() => navigate("/dashboard/profile")}>
          Create Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard")}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <Card className="p-8 space-y-6 border-border/50">
        {/* Header */}
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Photo
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold">{profile.full_name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
            <p className="mt-1 text-sm">
              {profile.role?.toUpperCase()} · {profile.location || "Location"}
            </p>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div>
            <h3 className="font-semibold mb-1">Bio</h3>
            <p className="text-muted-foreground">{profile.bio}</p>
          </div>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <Badge key={i} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {profile.projects?.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Projects</h3>
            <ul className="list-disc list-inside text-muted-foreground">
              {profile.projects.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button onClick={() => navigate("/dashboard/profile")}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            Return to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
