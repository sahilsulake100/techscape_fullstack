import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../lib/auth-service";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { Code2, ArrowRight, Lock, Mail, User } from "lucide-react";
import { motion } from "framer-motion";

const SignUpPage = () => {
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data);
      toast.success("Account created successfully! Welcome to TechScape.");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Failed to create account";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] bg-[radial-gradient(at_top_left,_#e2e8f0_0%,_transparent_50%),_radial-gradient(at_top_right,_#c7d2fe_0%,_transparent_50%)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-white/60 backdrop-blur-2xl border-white/60 rounded-[2rem] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-vibrant shadow-md mx-auto mb-2">
              <Code2 className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-black text-slate-800">Create Account</h1>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">
              Join the TechScape developer network
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="pl-10 rounded-xl border-slate-200 bg-white/70"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-10 rounded-xl border-slate-200 bg-white/70"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pl-10 rounded-xl border-slate-200 bg-white/70"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-slate-200/50">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/sign-in" className="font-bold text-indigo-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
