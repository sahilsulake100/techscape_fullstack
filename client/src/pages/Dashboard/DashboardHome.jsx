import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/Button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

import Loader from "../../components/common/Loader";
import EventCard from "../../components/events/EventCard";

import { Calendar, Bookmark, Users, Plus } from "lucide-react";

import { getUserProfile } from "../../lib/profile-service";
import { fetchEventsByOrganizer, getUserWatchlist } from "../../lib/event-service";
import { useUser } from "../../contexts/AuthContext";
import { toast } from "sonner";

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [watchlistedEvents, setWatchlistedEvents] = useState([]);

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);

      try {
        const uid = user.id;

        const [p, eventsData, watchlistData] = await Promise.all([
          getUserProfile(uid),
          fetchEventsByOrganizer(uid),
          getUserWatchlist(uid),
        ]);

        setProfile(p);
        setMyEvents(Array.isArray(eventsData) ? eventsData : []);
        setWatchlistedEvents(
          Array.isArray(watchlistData) ? watchlistData : []
        );
      } catch (err) {
        console.error("DashboardHome error:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  /* ---------------- UI ---------------- */

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {profile?.full_name || user.firstName}!
            </h1>
            <p className="text-muted-foreground">
              Stay updated and manage your tech journey.
            </p>
          </div>

          {!profile ? (
            <Button onClick={() => navigate("/dashboard/profile")}>
              Create Profile
            </Button>
          ) : (
            <Button
              onClick={() =>
                navigate(`/public-profile/${profile.username}`)
              }
            >
              View Profile
            </Button>
          )}
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 border-border/50">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-primary">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myEvents.length}</p>
                <p className="text-sm text-muted-foreground">
                  Events Posted
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-primary">
                <Bookmark className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {watchlistedEvents.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Watchlisted Events
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-primary">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">
                  Teams Joined
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* TABS */}
      <Tabs defaultValue="my-events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        {/* My Events */}
        <TabsContent value="my-events" className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Events</h2>

            <Button onClick={() => navigate("/dashboard/create-event")}>
              <Plus className="w-4 h-4 mr-2" /> Post Event
            </Button>
          </div>

          {myEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-border/50">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-4">
                You haven’t posted any events yet.
              </p>
              <Button
                onClick={() => navigate("/dashboard/create-event")}
              >
                Post Your First Event
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Watchlist */}
        <TabsContent value="watchlist" className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">
            Watchlisted Events
          </h2>

          {watchlistedEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {watchlistedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isWatchlisted
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-border/50">
              <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-4">
                Your watchlist is empty.
              </p>
              <Button onClick={() => navigate("/events")}>
                Explore Events
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
