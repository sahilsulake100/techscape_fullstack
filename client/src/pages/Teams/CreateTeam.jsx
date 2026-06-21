import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/AuthContext";
import { createTeam } from "../../lib/team-service";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

const CreateTeam = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    skills: "",
    max_members: 5,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Login required");

    try {
      await createTeam({
        name: form.name,
        description: form.description,
        skills_needed: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        max_members: Number(form.max_members),
      });

      toast.success("Team created");
      navigate("/teams");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create team");
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Create Team</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Team name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Textarea
            placeholder="Team description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <Input
            placeholder="Skills needed (React, Node, AI)"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max members"
            value={form.max_members}
            onChange={(e) =>
              setForm({ ...form, max_members: e.target.value })
            }
          />
          <Button type="submit">Create Team</Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateTeam;
