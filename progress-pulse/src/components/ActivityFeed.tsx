import { motion } from "framer-motion";
import { GitCommit, GitPullRequest, GitMerge, Milestone as MilestoneIcon, Rocket } from "lucide-react";
import type { Activity } from "@/data/mockData";

const iconMap = {
  commit: GitCommit,
  pr: GitPullRequest,
  merge: GitMerge,
  milestone: MilestoneIcon,
  deploy: Rocket,
};

const colorMap = {
  commit: "text-muted-foreground",
  pr: "text-accent",
  merge: "text-primary",
  milestone: "text-warning",
  deploy: "text-success",
};

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
}

const ActivityFeed = ({ activities, title = "Live Activity" }: ActivityFeedProps) => {
  return (
    <div className="glass-card p-6">
      <h3 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        {title}
      </h3>
      <div className="space-y-4">
        {activities.map((activity, i) => {
          const Icon = iconMap[activity.type];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className={`mt-0.5 ${colorMap[activity.type]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.timestamp}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
