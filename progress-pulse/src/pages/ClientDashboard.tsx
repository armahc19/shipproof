import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { Shield, CheckCircle2, Clock, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockProjects } from "@/data/mockData";
import ActivityFeed from "@/components/ActivityFeed";

const statusConfig = {
  completed: { icon: CheckCircle2, label: "Completed", color: "text-success", bg: "bg-success" },
  "in-progress": { icon: Clock, label: "In Progress", color: "text-warning", bg: "bg-warning" },
  pending: { icon: AlertTriangle, label: "Not Started", color: "text-muted-foreground", bg: "bg-muted-foreground" },
};

const ClientDashboard = () => {
  const { projectId } = useParams();
  const project = mockProjects.find((p) => p.id === projectId) || mockProjects[0];

  const allTasks = project.milestones.flatMap((m) => m.tasks);
  const completed = allTasks.filter((t) => t.status === "completed").length;
  const inProgress = allTasks.filter((t) => t.status === "in-progress").length;
  const pending = allTasks.filter((t) => t.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-mono font-bold text-lg text-foreground">ShipProof</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Developer View
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Project Header */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-foreground mb-2">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
          {project.deadline && (
            <p className="text-sm text-muted-foreground mt-2">
              Deadline: <span className="text-foreground font-medium">{new Date(project.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            </p>
          )}
        </motion.div>

        {/* Big Progress */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 mb-8">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
            <p className="text-5xl font-mono font-bold gradient-text">{project.progress}%</p>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 1.2 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-mono font-bold text-success">{completed}</p>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-warning">{inProgress}</p>
              <p className="text-xs text-muted-foreground mt-1">In Progress</p>
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-muted-foreground">{pending}</p>
              <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
            </div>
          </div>
        </motion.div>

        {/* Milestones - Client View */}
        <div className="space-y-4 mb-8">
          <h2 className="font-mono font-semibold text-foreground text-lg">Milestones</h2>
          {project.milestones.map((milestone, i) => {
            const mCompleted = milestone.tasks.filter((t) => t.status === "completed").length;
            const mProgress = Math.round((mCompleted / milestone.tasks.length) * 100);
            const isComplete = mProgress === 100;

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="glass-card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-warning" />
                    )}
                    <h3 className="font-mono font-semibold text-foreground">{milestone.title}</h3>
                  </div>
                  <span className={`text-sm font-mono font-semibold ${isComplete ? "text-success" : "text-primary"}`}>
                    {mProgress}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${mProgress}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                    className={`h-full rounded-full ${isComplete ? "bg-success" : "bg-primary"}`}
                  />
                </div>
                <div className="space-y-2">
                  {milestone.tasks.map((task) => {
                    const cfg = statusConfig[task.status];
                    const TaskIcon = cfg.icon;
                    return (
                      <div key={task.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <TaskIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                          <span className="text-foreground">{task.title}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color} ${cfg.bg}/10`}>
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Activity */}
        <ActivityFeed activities={project.activities} title="Recent Updates" />
      </div>
    </div>
  );
};

export default ClientDashboard;
