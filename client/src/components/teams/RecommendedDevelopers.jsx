import React, { useEffect, useState } from "react";
import { getAiRecommendations } from "../../lib/team-service";
import { Card } from "../ui/card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/badge";
import Loader from "../common/Loader";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Sparkles, UserPlus, CheckCircle, BrainCircuit, Code } from "lucide-react";

export default function RecommendedDevelopers({ teamId, onInvite, currentMembers = [] }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitingIds, setInvitingIds] = useState(new Set());

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true);
      try {
        const data = await getAiRecommendations(teamId);
        // Filter out developers who are already members
        const filtered = data.filter(rec => !currentMembers.includes(rec.userId));
        setRecommendations(filtered);
      } catch (err) {
        console.error("AI recommendation load error:", err);
        toast.error("Failed to load AI teammate recommendations");
      } finally {
        setLoading(false);
      }
    }

    if (teamId) {
      loadRecommendations();
    }
  }, [teamId, currentMembers]);

  const handleInviteClick = async (userId) => {
    setInvitingIds(prev => {
      const next = new Set(prev);
      next.add(userId);
      return next;
    });

    try {
      await onInvite(userId);
      // Remove invited user from recommendations
      setRecommendations(prev => prev.filter(r => r.userId !== userId));
    } catch (err) {
      console.error(err);
    } finally {
      setInvitingIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  if (loading) return <Loader />;

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 bg-white/30 backdrop-blur border rounded-2xl p-6 border-white/60 shadow-sm">
        <BrainCircuit className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <p className="text-slate-500 font-semibold">No recommendations found matching your requirements.</p>
        <p className="text-xs text-slate-400 mt-1">Try updating your team's description or required skills to find matches.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex items-center gap-2.5 pb-2">
        <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-100 flex items-center justify-center">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            AI Teammate Recommendations
            <span className="flex items-center gap-1 text-[10px] uppercase bg-indigo-100 text-indigo-700 font-black px-2.5 py-1 rounded-full shadow-sm">
              <Sparkles className="w-3 h-3 text-indigo-600 fill-indigo-600" />
              AI Powered
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Smart matching based on skills, roles, projects, and complexity
          </p>
        </div>
      </div>

      {/* Grid of recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.slice(0, 4).map((rec, index) => {
          
          // Determine match score color
          let scoreBadgeClass = "bg-rose-50 text-rose-700 border-rose-200";
          if (rec.matchScore >= 80) {
            scoreBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
          } else if (rec.matchScore >= 50) {
            scoreBadgeClass = "bg-amber-50 text-amber-700 border-amber-200";
          }

          const isInviting = invitingIds.has(rec.userId);

          return (
            <motion.div
              key={rec.userId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 bg-white/60 hover:bg-white/95 border-white/60 hover:shadow-lg hover:border-indigo-100 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
                
                {/* Background match highlight bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 opacity-50" />

                <div className="space-y-4">
                  
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={rec.avatarUrl}
                        alt={rec.fullName}
                        className="w-12 h-12 rounded-xl object-cover shadow-sm bg-slate-50 border border-slate-100"
                      />
                      <div>
                        <h3 className="font-black text-slate-800 text-base group-hover:text-indigo-600 transition-colors">
                          {rec.fullName}
                        </h3>
                        <p className="text-xs text-slate-400 font-bold">@{rec.username}</p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className={`border rounded-xl px-2.5 py-1.5 text-center font-black ${scoreBadgeClass} shadow-sm flex flex-col min-w-[54px]`}>
                      <span className="text-lg leading-none">{rec.matchScore}%</span>
                      <span className="text-[7px] uppercase font-black tracking-widest mt-0.5">Match</span>
                    </div>
                  </div>

                  {/* Primary Role Badge */}
                  <div>
                    <Badge variant="outline" className="capitalize text-xs font-bold bg-indigo-50/50 text-indigo-700 border-indigo-100">
                      {rec.role || "Developer"}
                    </Badge>
                  </div>

                  {/* AI Explanation reasoning */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/30 border border-indigo-100/30 text-slate-600 text-xs leading-relaxed font-semibold">
                    <div className="flex gap-1.5 items-start">
                      <BrainCircuit className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{rec.recommendationReason}</span>
                    </div>
                  </div>

                  {/* Matched skills */}
                  {rec.matchedSkills && rec.matchedSkills.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-slate-400" />
                        Matching Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.matchedSkills.map((skill, sIdx) => (
                          <Badge key={sIdx} className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Invite Button */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <Button
                    onClick={() => handleInviteClick(rec.userId)}
                    disabled={isInviting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm text-sm"
                  >
                    {isInviting ? (
                      <>
                        <Loader className="w-4 h-4 text-white" />
                        Inviting...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4.5 h-4.5" />
                        Invite to Team
                      </>
                    )}
                  </Button>
                </div>

              </Card>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
