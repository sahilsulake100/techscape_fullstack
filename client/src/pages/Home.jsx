import React from "react";
import { useNavigate } from "react-router-dom";

// // Firebase
// import {
//   collection,
//   query,
//   where,
//   orderBy,
//   limit,
//   getDocs,
// } from "firebase/firestore";
// import { db } from "../firebase/firebase";

// UI
import Loader from "../components/common/Loader.jsx";
import EventCard from "../components/events/EventCard.jsx";
import { Button } from "../components/ui/Button.jsx";

// Icons
import {
  UsersIcon,
  CalendarDaysIcon,
  RocketLaunchIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

// React Query
import { useQuery } from "@tanstack/react-query";

// 🔥 Framer Motion
import { motion } from "framer-motion";

/* ---------------- ANIMATION VARIANTS ---------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const Home = () => {
  const navigate = useNavigate();

  const { data: featuredEvents, isLoading } = useQuery({
    queryKey: ["featured-events"],
    queryFn: async () => {
      const now = new Date();
      const eventsRef = collection(db, "events");

      const q = query(
        eventsRef,
        where("start_date_timestamp", ">=", now),
        orderBy("start_date_timestamp", "asc"),
        limit(3)
      );

      const snap = await getDocs(q);
      return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
  });

  return (
    <div className="min-h-screen">

      {/* ================= HERO ================= */}
      <section className="relative py-24 md:py-40 overflow-hidden bg-gradient-to-br from-background via-blue-50 to-purple-50">
        <motion.div
          className="container mx-auto px-4 relative z-10"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <div className="max-w-5xl mx-auto text-center space-y-10">

            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary text-black text-sm font-semibold shadow-neon"
            >
              <RocketLaunchIcon className="w-5 h-5" />
              <span>Welcome to the Future of Tech Events</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-6xl md:text-8xl font-extrabold leading-tight"
            >
              Discover{" "}
              <span className="gradient-text-vibrant">Hackathons, Contests</span>{" "}
              & <span className="gradient-text">Tech Events</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto"
            >
              Join the most exciting tech events, connect with brilliant developers,
              and build something extraordinary.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={() => navigate("/events")}
                  className="text-lg px-8 py-6 bg-primary text-white"
                >
                  <CalendarDaysIcon className="mr-2 w-6 h-6" />
                  Explore Events
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/teams")}
                  className="text-lg px-8 py-6 border-2"
                >
                  <UsersIcon className="mr-2 w-6 h-6" />
                  Find Teams
                </Button>
              </motion.div>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* ================= FEATURED EVENTS ================= */}
      <section className="py-24 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <motion.div
          className="container mx-auto px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-vibrant text-black text-sm font-semibold mb-4">
              ⚡ Upcoming Events
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold">
              <span className="gradient-text-vibrant">Featured</span> Events
            </h2>
          </motion.div>

          {isLoading ? (
            <Loader />
          ) : featuredEvents?.length > 0 ? (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={stagger}
            >
              {featuredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  variants={scaleIn}
                  whileHover={{ y: -8 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} className="text-center py-12">
              <RocketLaunchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-4">
                No events available yet
              </p>
              <Button onClick={() => navigate("/dashboard/create-event")}>
                Post Event
              </Button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-32 bg-gradient-to-r from-electric-blue via-neon-violet to-gradient-end relative overflow-hidden">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-black text-sm font-semibold mb-4">
            <CheckIcon className="w-5 h-5" />
            <span>Join 10,000+ Developers</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold text-black">
            Ready to Join the Community?
          </h2>

          <p className="text-xl md:text-2xl text-black/90 max-w-2xl mx-auto">
            Create your account and start discovering amazing tech events.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => navigate("/sign-up")}
                className="bg-white text-electric-blue px-10 py-6 shadow-xl"
              >
                Get Started Free
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/events")}
                className="bg-white text-electric-blue px-10 py-6 shadow-xl"
              >
                Explore Events
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default Home;
