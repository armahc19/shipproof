import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Plus, Github, ExternalLink, Clock, CheckCircle2, AlertTriangle, Loader, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config";
import CreateProjectForm from "@/components/CreateProjectForm";
import ActivityFeed from "@/components/ActivityFeed";
import { jwtDecode } from "jwt-decode";

const statusBadge = {
  active: { icon: Clock, label: "Active", className: "text-accent bg-accent/10" },
  completed: { icon: CheckCircle2, label: "Completed", className: "text-success bg-success/10" },
  delayed: { icon: AlertTriangle, label: "Delayed", className: "text-destructive bg-destructive/10" },
};

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  
  useEffect(() => {
  const tokenFromUrl = new URLSearchParams(window.location.search).get("token");

  // 1. Save token if it comes from URL
  if (tokenFromUrl) {
    localStorage.setItem("auth_token", tokenFromUrl);
    window.history.replaceState({}, document.title, "/dashboard");
  }

  // 2. Always read from localStorage AFTER
  const token = localStorage.getItem("auth_token");

  if (token) {
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("auth_token");
    }
  }
}, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    navigate("/login");
  };

  const activeProjects = projects.filter((p) => p.status === "active").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-mono font-bold text-lg text-foreground">ShipProof</span>
          </Link>
          <div className="flex items-center gap-3">
           {/* <Button variant="outline" size="sm" className="gap-2 border-border text-foreground">
              <Github className="w-4 h-4" /> Connected
            </Button>*/}
            <CreateProjectForm onProjectCreated={handleProjectCreated} />
          {user && (
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full border border-border"
              />

              <span className="text-sm font-medium text-foreground">
                {user.username}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Projects", value: activeProjects.toString() },
            { label: "Total Projects", value: projects.length.toString() },
            { label: "Completed", value: projects.filter((p) => p.status === "completed").length.toString() },
            { label: "Avg Progress", value: projects.length > 0 ? `${Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%` : "0%" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-mono font-bold text-foreground mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-muted-foreground mb-2">No projects yet</p>
            <p className="text-sm text-muted-foreground mb-6">Create your first project to get started</p>
            <CreateProjectForm onProjectCreated={handleProjectCreated} />
          </motion.div>
        )}

        {/* Projects */}
        {!loading && projects.length > 0 && (
          <div className="space-y-8">
            {projects.map((project) => {
              const badge = statusBadge[project.status] || statusBadge.active;
              const BadgeIcon = badge.icon;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-mono font-bold text-foreground">{project.name}</h2>
                        <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${badge.className}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      {project.github_repo && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono flex items-center gap-1">
                          <Github className="w-3 h-3" /> {project.github_repo}
                        </p>
                      )}
                    </div>
                    <Link to={`/details/${project.id}`}>
                      <Button variant="outline" size="sm" className="gap-2 border-border text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-3 h-3" /> Details
                      </Button>
                    </Link>
                  </div>

                  {/* Overall Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">Overall Progress</p>
                      <p className="text-sm font-mono font-bold text-primary">{project.progress}%</p>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperDashboard;
