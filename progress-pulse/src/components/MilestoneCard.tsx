import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, GitCommit } from "lucide-react";
import type { Milestone } from "@/data/mockData";

const statusConfig = {
  completed: { icon: CheckCircle2, label: "Completed", className: "text-success bg-success/10" },
  "in-progress": { icon: Clock, label: "In Progress", className: "text-warning bg-warning/10" },
  pending: { icon: AlertCircle, label: "Pending", className: "text-muted-foreground bg-muted" },
};

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
}

const MilestoneCard = ({ milestone, index }: MilestoneCardProps) => {
  const completedTasks = milestone.tasks.filter((t) => t.status === "completed").length;
  const progress = Math.round((completedTasks / milestone.tasks.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-mono font-semibold text-foreground">{milestone.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
        </div>
        <span className="text-sm font-mono text-primary font-semibold">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-secondary rounded-full mb-5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {milestone.tasks.map((task) => {
          const config = statusConfig[task.status];
          const Icon = config.icon;
          return (
            <div key={task.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${config.className.split(" ")[0]}`} />
                <span className="text-sm text-foreground">{task.title}</span>
              </div>
              <div className="flex items-center gap-3">
                {task.commits > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <GitCommit className="w-3 h-3" />
                    {task.commits}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.className}`}>
                  {config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MilestoneCard;
