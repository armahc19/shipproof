import { motion } from "framer-motion";
import {
  GitCommit,
  GitPullRequest,
  GitMerge,
  ExternalLink,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimelineEvent {
  id: string;
  type: "commit" | "pr" | "merge";
  message?: string;
  title?: string;
  author?: string;
  state?: string;
  number?: number;
  url?: string;
  timestamp: string;
  count?: number;
}

interface TimelineViewProps {
  events: TimelineEvent[];
  projectName: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString();
};

const getEventIcon = (type: string) => {
  switch (type) {
    case "commit":
      return <GitCommit className="w-5 h-5" />;
    case "merge":
      return <GitMerge className="w-5 h-5" />;
    case "pr":
      return <GitPullRequest className="w-5 h-5" />;
    default:
      return <Code2 className="w-5 h-5" />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case "commit":
      return "bg-blue-500/10 text-blue-600 border border-blue-200/50";
    case "merge":
      return "bg-purple-500/10 text-purple-600 border border-purple-200/50";
    case "pr":
      return "bg-green-500/10 text-green-600 border border-green-200/50";
    default:
      return "bg-slate-500/10 text-slate-600 border border-slate-200/50";
  }
};

const getEventLabel = (type: string) => {
  switch (type) {
    case "commit":
      return "Commit";
    case "merge":
      return "Merged";
    case "pr":
      return "Pull Request";
    default:
      return "Event";
  }
};

export const TimelineView = ({ events, projectName }: TimelineViewProps) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8">
        <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground">No commits or activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative"
        >
          {/* Timeline connector */}
          {index < events.length - 1 && (
            <div className="absolute left-6 top-14 w-0.5 h-8 bg-gradient-to-b from-primary/50 to-primary/10" />
          )}

          <div className="flex gap-4">
            {/* Timeline dot */}
            <div className="flex flex-col items-center pt-1">
              <div
                className={`relative z-10 p-2.5 rounded-full ${getEventColor(event.type)} flex items-center justify-center`}
              >
                {getEventIcon(event.type)}
              </div>
            </div>

            {/* Event content */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getEventColor(
                        event.type
                      )}`}
                    >
                      {getEventLabel(event.type)}
                    </span>
                    {event.state && (
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          event.state === "merged"
                            ? "bg-purple-100 text-purple-700"
                            : event.state === "closed"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {event.state}
                      </span>
                    )}
                  </div>

                  {event.type === "commit" && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-foreground">
                        {event.message || "Code update"}
                      </p>
                      {event.author && (
                        <p className="text-xs text-muted-foreground mt-1">
                          by {event.author}
                        </p>
                      )}
                    </div>
                  )}

                  {(event.type === "pr" || event.type === "merge") && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-foreground">
                        {event.title}
                      </p>
                      {event.number && (
                        <p className="text-xs text-muted-foreground mt-1">
                          PR #{event.number}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(event.timestamp)}
                  </p>
                </div>

                {/* External link button */}
                {event.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 ml-2"
                    asChild
                  >
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View on GitHub"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TimelineView;
