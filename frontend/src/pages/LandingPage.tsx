import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  Layers,
  ChevronDown,
  ClipboardList,
  UserPlus,
  BarChart,
  Star,
  FolderKanban,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleCTA = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Nav */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg border-b border-gray-200"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">WiseCamp</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a className="hover:text-gray-900" href="#features">
              Features
            </a>
            <a className="hover:text-gray-900" href="#faq">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-12 relative overflow-hidden">
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
                Get started for free
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
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FolderKanban className="w-6 h-6 text-white" />
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
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Everything you need to ship great products
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              WiseCamp is built with features that help your team stay aligned
              and deliver faster.
            </p>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ClipboardList,
                title: "Flexible Kanban Boards",
                desc: "Visualize your workflow with customizable columns and cards. Drag, drop, and get a clear overview of your progress.",
                className: "bg-blue-100 text-blue-600",
              },
              {
                icon: UserPlus,
                title: "Seamless Collaboration",
                desc: "Invite your team, assign tasks, and communicate effectively within projects. Keep everyone in the loop, effortlessly.",
                className: "bg-purple-100 text-purple-600",
              },
              {
                icon: BarChart,
                title: "Project-Based Organization",
                desc: "Group your work into projects to maintain focus and clarity. Manage access and track progress on a per-project basis.",
                className: "bg-emerald-100 text-emerald-600",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="p-8 border rounded-2xl bg-white shadow-lg shadow-gray-200/50"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <div
                  className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${f.className}`}
                >
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-gray-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Frequently asked questions
          </h2>
          <div className="mt-12 space-y-4">
            <FAQItem
              q="Is WiseCamp free to use?"
              a="Yes, WiseCamp offers a generous free tier for individuals and small teams to get started and organize their work."
            />
            <FAQItem
              q="Can I invite members from outside my organization?"
              a="Absolutely! You can invite anyone to collaborate on your projects by simply using their email address."
            />
            <FAQItem
              q="How does WiseCamp compare to other project management tools?"
              a="WiseCamp focuses on simplicity and a clean, visual-first approach. We aim to provide the core features you need without the clutter, making it faster and more enjoyable to use."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Create an account and start organizing your projects in minutes.
          </p>
          <div className="mt-8">
            <button
              onClick={handleCTA}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-gray-100 transition"
            >
              Sign up for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">WiseCamp</span>
            </div>
            <div className=" text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} WiseCamp. All rights reserved.</p>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <a href="#features" className="hover:text-gray-900">
                Features
              </a>
              <a href="#faq" className="hover:text-gray-900">
                FAQ
              </a>
              <a href="#" className="hover:text-gray-900">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left"
      >
        <span className="font-semibold text-lg text-gray-800">{q}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 text-gray-600"
        >
          {a}
        </motion.div>
      )}
    </div>
  );
};

export default LandingPage;
