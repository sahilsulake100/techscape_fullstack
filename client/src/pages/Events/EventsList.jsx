import { useState, useEffect } from "react";
import { fetchEvents, getUserWatchlist, addToWatchlist, removeFromWatchlist } from "../../lib/event-service";
import { useUser } from "../../contexts/AuthContext";

import EventCard from "../../components/events/EventCard";
import Loader from "../../components/common/Loader";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";

import { Search, Filter } from "lucide-react";
import { toast } from "sonner";

export default function EventsList() {
  const { user } = useUser();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(null);

  const eventTypes = [
    "hackathon",
    "coding_contest",
    "workshop",
    "conference",
    "meetup",
  ];

  // ---------------------------------------------------
  // LOAD EVENTS + WATCHLIST (SAFE)
  // ---------------------------------------------------
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        // ✅ EVENTS (public read)
        const allEvents = await fetchEvents();
        if (!mounted) return;

        setEvents(allEvents);
        setFilteredEvents(allEvents);

        // ✅ WATCHLIST (only if logged in)
        if (user) {
          try {
            const w = await getUserWatchlist(user.id);
            if (mounted) setWatchlist(w.map((item) => item.id));
          } catch (err) {
            console.warn("Watchlist load skipped:", err.message);
            // 👆 do NOT block page
          }
        }
      } catch (err) {
        console.error("EventsList load error:", err);
        toast.error("Failed to load events");
      } finally {
        if (mounted) setLoading(false); // ✅ ALWAYS STOP LOADER
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [user]);

  // ---------------------------------------------------
  // SEARCH & FILTER
  // ---------------------------------------------------
  useEffect(() => {
    let filtered = [...events];

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(
        (event) => event.event_type === selectedType
      );
    }

    setFilteredEvents(filtered);
  }, [searchQuery, selectedType, events]);

  // ---------------------------------------------------
  // WATCHLIST HANDLER
  // ---------------------------------------------------
  const toggleWatchlist = async (event) => {
    if (!user) {
      toast.error("Please sign in to save events");
      return;
    }

    const isSaved = watchlist.includes(event.id);

    try {
      if (isSaved) {
        await removeFromWatchlist(user.id, event.id);
        setWatchlist((prev) => prev.filter((id) => id !== event.id));
        toast.success("Removed from watchlist");
      } else {
        await addToWatchlist(user.id, event);
        setWatchlist((prev) => [...prev, event.id]);
        toast.success("Added to watchlist");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update watchlist");
    }
  };

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------
  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Explore <span className="gradient-text">Tech Events</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover events happening around you or in the tech community.
        </p>
      </div>

      {/* SEARCH */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={!selectedType ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedType(null)}
          >
            All Events
          </Badge>

          {eventTypes.map((type) => (
            <Badge
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedType(type)}
            >
              {type.replace("_", " ")}
            </Badge>
          ))}
        </div>
      </div>

      {/* EVENTS */}
      {filteredEvents.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isWatchlisted={watchlist.includes(event.id)}
              onWatchlistToggle={() => toggleWatchlist(event)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No events found.
          </p>
        </div>
      )}
    </div>
  );
}
