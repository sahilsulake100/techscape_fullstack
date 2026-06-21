import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/AuthContext";
import { getTeamById } from "../../lib/team-service";
import { getUserProfile } from "../../lib/profile-service";
import Loader from "../../components/common/Loader";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  ClipboardList,
  FolderKanban,
  Send,
  Plus,
  ArrowLeft,
  Users,
  CheckCircle2,
  ListTodo,
  FileText,
  Clock
} from "lucide-react";

export default function TeamCollaboration() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("kanban"); // "kanban", "chat", "workspace"

  // Kanban Tasks state
  const [tasks, setTasks] = useState([
    { id: "1", title: "Setup Project Repository & Boilerplate", status: "done", assignee: "Leader" },
    { id: "2", title: "Design Landing Page UI Wireframe", status: "progress", assignee: "Designer" },
    { id: "3", title: "Create Authentication REST APIs", status: "todo", assignee: "Backend Dev" },
  ]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");

  // Chat state
  const [messages, setMessages] = useState([
    { id: "1", sender: "System", text: "Welcome to the Team Collaboration Hub! 🚀", timestamp: "10:00 AM", isSystem: true },
    { id: "2", sender: "Sahil", text: "Hey team! I have initialized the repository. Please review the folder structure.", timestamp: "10:15 AM" },
    { id: "3", sender: "Aniket", text: "Looks clean! I'll start with the UI design tomorrow morning.", timestamp: "10:20 AM" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    async function loadTeamData() {
      setLoading(true);
      try {
        const teamData = await getTeamById(id);
        if (teamData) {
          setTeam(teamData);
          
          // Load members
          const memberProfiles = await Promise.all(
            teamData.members.map(uid => getUserProfile(uid))
          );
          setMembers(memberProfiles.filter(Boolean));
        }
      } catch (err) {
        console.error("Error loading team collaboration details:", err);
        toast.error("Failed to load team data");
      } finally {
        setLoading(false);
      }
    }

    loadTeamData();
  }, [id]);

  // Handle adding a new task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const task = {
      id: Date.now().toString(),
      title: newTaskText.trim(),
      status: "todo",
      assignee: newTaskAssignee || "Unassigned"
    };

    setTasks([...tasks, task]);
    setNewTaskText("");
    setNewTaskAssignee("");
    toast.success("Task added to board!");
  };

  // Move task status
  const moveTask = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    toast.info("Task status updated");
  };

  // Send a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const msg = {
      id: Date.now().toString(),
      sender: user.fullName || user.username || "Me",
      text: newMessage.trim(),
      timestamp: time
    };

    setMessages([...messages, msg]);
    setNewMessage("");
  };

  if (loading) return <Loader />;

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Team not found.</p>
        <Button className="mt-4" onClick={() => navigate("/teams")}>Back to Teams</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] bg-[radial-gradient(at_top_left,_#e2e8f0_0%,_transparent_50%),_radial-gradient(at_top_right,_#c7d2fe_0%,_transparent_50%)] py-12 px-4">
      <div className="container max-w-6xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 py-1.5 px-3 rounded-full text-xs font-bold capitalize flex items-center gap-1.5 shadow-sm">
            <Users className="w-4 h-4" />
            {members.length} Members
          </Badge>
        </div>

        {/* Team Collaboration Main Card */}
        <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-xl p-6 md:p-10 space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-800">{team.name} Collaboration</h1>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">
              Assign tasks, share notes, and message team members in real time.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200/50 pb-px gap-2">
            <button
              onClick={() => setActiveTab("kanban")}
              className={`flex items-center gap-2 py-4 px-6 border-b-2 font-bold text-sm transition-all rounded-t-xl ${
                activeTab === "kanban"
                  ? "border-indigo-600 text-indigo-600 bg-white/40"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FolderKanban className="w-4.5 h-4.5" />
              Kanban Board
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 py-4 px-6 border-b-2 font-bold text-sm transition-all rounded-t-xl ${
                activeTab === "chat"
                  ? "border-indigo-600 text-indigo-600 bg-white/40"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-4.5 h-4.5" />
              Team Chat Room
            </button>
            <button
              onClick={() => setActiveTab("workspace")}
              className={`flex items-center gap-2 py-4 px-6 border-b-2 font-bold text-sm transition-all rounded-t-xl ${
                activeTab === "workspace"
                  ? "border-indigo-600 text-indigo-600 bg-white/40"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ClipboardList className="w-4.5 h-4.5" />
              Shared Notes
            </button>
          </div>

          {/* Tab Content Rendering */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              
              {/* KANBAN BOARD */}
              {activeTab === "kanban" && (
                <motion.div
                  key="kanban"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Task Input Form */}
                  <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-white/30 border border-white/50">
                    <Input
                      placeholder="What needs to be done?"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      className="flex-grow rounded-xl bg-white/70"
                      required
                    />
                    <select
                      className="border rounded-xl px-4 py-2 bg-white/70 font-semibold text-sm outline-none border-slate-200"
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                    >
                      <option value="">Assign To...</option>
                      {members.map(m => (
                        <option key={m.id} value={m.fullName}>{m.fullName}</option>
                      ))}
                    </select>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 gap-2 py-3 rounded-xl">
                      <Plus className="w-5 h-5" /> Add Task
                    </Button>
                  </form>

                  {/* Kanban Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* TO DO COLUMN */}
                    <div className="space-y-4 bg-slate-100/40 p-5 rounded-2xl border border-slate-200/50">
                      <h3 className="text-sm uppercase tracking-widest font-black text-slate-500 flex items-center gap-2">
                        <ListTodo className="w-4.5 h-4.5 text-indigo-500" />
                        To Do
                      </h3>
                      <div className="space-y-3">
                        {tasks.filter(t => t.status === "todo").map(t => (
                          <Card key={t.id} className="p-4 bg-white shadow-sm border border-slate-200 hover:shadow-md transition">
                            <h4 className="font-bold text-slate-800 mb-2">{t.title}</h4>
                            <div className="flex items-center justify-between pt-2">
                              <Badge className="bg-slate-50 text-slate-600 hover:bg-slate-100 text-[10px] font-bold">
                                {t.assignee}
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() => moveTask(t.id, "progress")}
                                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs px-2.5 py-1"
                              >
                                Start Work
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* IN PROGRESS COLUMN */}
                    <div className="space-y-4 bg-indigo-50/20 p-5 rounded-2xl border border-indigo-100/50">
                      <h3 className="text-sm uppercase tracking-widest font-black text-indigo-600 flex items-center gap-2">
                        <Clock className="w-4.5 h-4.5 text-indigo-500" />
                        In Progress
                      </h3>
                      <div className="space-y-3">
                        {tasks.filter(t => t.status === "progress").map(t => (
                          <Card key={t.id} className="p-4 bg-white shadow-sm border border-indigo-100 hover:shadow-md transition">
                            <h4 className="font-bold text-slate-800 mb-2">{t.title}</h4>
                            <div className="flex items-center justify-between pt-2">
                              <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[10px] font-bold">
                                {t.assignee}
                              </Badge>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => moveTask(t.id, "todo")}
                                  className="text-xs px-2.5 py-1"
                                >
                                  Reset
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => moveTask(t.id, "done")}
                                  className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs px-2.5 py-1"
                                >
                                  Complete
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* DONE COLUMN */}
                    <div className="space-y-4 bg-emerald-50/10 p-5 rounded-2xl border border-emerald-100/50">
                      <h3 className="text-sm uppercase tracking-widest font-black text-emerald-600 flex items-center gap-2">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                        Done
                      </h3>
                      <div className="space-y-3">
                        {tasks.filter(t => t.status === "done").map(t => (
                          <Card key={t.id} className="p-4 bg-white/70 shadow-sm border border-emerald-50 opacity-80">
                            <h4 className="font-bold text-slate-700 line-through mb-2">{t.title}</h4>
                            <div className="flex items-center justify-between pt-2">
                              <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[10px] font-bold">
                                {t.assignee}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => moveTask(t.id, "progress")}
                                className="text-xs px-2.5 py-1"
                              >
                                Reopen
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* TEAM CHAT ROOM */}
              {activeTab === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Messages container */}
                  <div className="h-[400px] overflow-y-auto bg-slate-100/40 p-6 rounded-3xl border border-slate-200/50 space-y-4 flex flex-col justify-end">
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${
                          msg.isSystem
                            ? "mx-auto text-center"
                            : msg.sender === (user?.fullName || user?.username)
                            ? "ml-auto items-end"
                            : "mr-auto items-start"
                        }`}
                      >
                        {!msg.isSystem && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                            {msg.sender} · {msg.timestamp}
                          </span>
                        )}
                        <div
                          className={`p-4 rounded-2xl text-sm leading-relaxed ${
                            msg.isSystem
                              ? "bg-slate-200 text-slate-600 rounded-full py-2 px-4 shadow-sm"
                              : msg.sender === (user?.fullName || user?.username)
                              ? "bg-indigo-600 text-white rounded-br-none shadow-md"
                              : "bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Send Form */}
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="rounded-xl flex-grow bg-white/70"
                      required
                    />
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 py-3 flex items-center justify-center">
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* SHARED NOTES & FILES */}
              {activeTab === "workspace" && (
                <motion.div
                  key="workspace"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <Card className="p-6 bg-white/50 border-slate-200/60 shadow-sm space-y-4">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      Team Shared Notes
                    </h3>
                    <textarea
                      className="w-full h-[250px] p-4 rounded-xl border border-slate-200 bg-white/70 outline-none font-medium text-sm leading-relaxed text-slate-700 resize-none shadow-inner"
                      placeholder="Compile references, wireframe links, or deployment details here..."
                      defaultValue={`### Project Goal
Build a Hackathon aggregator and team formation web app that helps developers collaborate.

### Technical Stack
- Frontend: React + TailwindCSS + Vite
- Backend: Node.js + Express
- Database: MongoDB

### Reference Links
- UI Colors: Indigo, Fuchsia, Neon Green, Dark Slate
- Deployment: Staging server setup pending`}
                    />
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl py-3 shadow-md">
                      Save Notes
                    </Button>
                  </Card>

                  <Card className="p-6 bg-white/50 border-slate-200/60 shadow-sm space-y-4">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-500" />
                      Member Directories
                    </h3>
                    <div className="space-y-3">
                      {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3.5 bg-white/70 rounded-xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <img src={m.imageUrl} alt={m.fullName} className="w-10 h-10 rounded-xl object-cover bg-slate-50" />
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{m.fullName}</p>
                              <p className="text-xs text-indigo-600 font-semibold uppercase">{m.role}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold text-slate-500">
                            Active
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
