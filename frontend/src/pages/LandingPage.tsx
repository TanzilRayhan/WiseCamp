import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  ArrowRight,
  Rocket,
  Sparkles,
  Shield,
  Users,
  Layers,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (state.isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Nav */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="font-semibold text-gray-900">WiseCamp</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a className="hover:text-gray-900" href="#">
            Features
          </a>
          <a className="hover:text-gray-900" href="#">
            Why WiseCamp
          </a>
          <a className="hover:text-gray-900" href="#">
            Get Started
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {state.isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200 via-white to-white" />
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
              <Sparkles className="h-3 w-3" /> New: Faster boards and beautiful
              UI
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
              Organize work beautifully
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-xl">
              WiseCamp brings projects, boards, and teams together with a clean,
              modern experience. Focus on outcomes, not tools.
            </p>
            <div id="cta" className="mt-8 flex items-center gap-3">
              <button
                onClick={handleCTA}
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                {state.isAuthenticated
                  ? "Go to your dashboard"
                  : "Get started for free"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <Link
                to="/boards"
                className="px-5 py-3 rounded-xl border text-gray-700 hover:bg-gray-50"
              >
                Explore boards
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
              <div className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                Secure by design
              </div>
              <div className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                Built for teams
              </div>
              <div className="inline-flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" />
                Kanban-first
              </div>
            </div>
          </motion.div>
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="absolute -top-6 -left-6 h-24 w-24 bg-indigo-200 rounded-full blur-2xl opacity-60" />
            <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-sky-200 rounded-full blur-2xl opacity-60" />
            <div className="relative border rounded-2xl shadow-xl bg-white p-4">
              <div className="flex items-center gap-3 p-3 border rounded-xl">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Create your first project
                  </div>
                  <div className="text-xs text-gray-500">
                    One click to get started
                  </div>
                </div>
                <div className="ml-auto px-3 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700">
                  Fast
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <div className="text-sm font-medium text-gray-900">
                    Boards
                  </div>
                  <div className="text-xs text-gray-500">
                    Visual task tracking
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Teams</div>
                  <div className="text-xs text-gray-500">
                    Collaborate together
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Cards</div>
                  <div className="text-xs text-gray-500">
                    Keep details clear
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm font-medium text-gray-900">
                    Insights
                  </div>
                  <div className="text-xs text-gray-500">
                    Understand progress
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Project-centric",
              desc: "Create and organize projects with clarity.",
            },
            {
              title: "Board-based",
              desc: "Plan visually with flexible columns and cards.",
            },
            {
              title: "Team-ready",
              desc: "Invite people and get work done together.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="group p-6 border rounded-xl bg-white hover:shadow-sm transition"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <div className="text-sm font-semibold text-gray-900">
                {f.title}
              </div>
              <div className="mt-1 text-sm text-gray-600">{f.desc}</div>
              
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-gray-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} WiseCamp</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-700">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-700">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
