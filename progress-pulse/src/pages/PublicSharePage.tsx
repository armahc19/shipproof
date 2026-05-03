import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Shield, Loader, Copy, Check, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config";
import TimelineView from "@/components/TimelineView";
import { useToast } from "@/hooks/use-toast";

interface ProjectData {
  id: string;
  name: string;
  description: string;
  github_repo: string;
  progress: number;
  status: "active" | "completed" | "delayed";
  deadline?: string;
  activity?: any;
}

const PublicSharePage = () => {
  const { projectId } = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      // Public endpoint - no auth required
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/public`);

      if (response.ok) {
        const data = await response.json();
        setProject(data);

        // Set timeline events from the API response
        if (data.activity?.timeline) {
          setTimelineEvents(data.activity.timeline);
        }
      } else if (response.status === 404) {
        setProject(null);
      }
    } catch (err) {
      console.error("Error fetching project:", err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/share/${projectId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-6 h-14 flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <Shield className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-mono text-sm text-muted-foreground">ShipProof</span>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-12 max-w-3xl text-center">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    active: { label: "Active", color: "text-accent" },
    completed: { label: "Completed", color: "text-success" },
    delayed: { label: "Delayed", color: "text-destructive" },
  };

  const status = statusConfig[project.status] || statusConfig.active;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Shield className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-mono text-sm text-muted-foreground">ShipProof</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyShareLink}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Share Link
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Title and Description */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="text-4xl font-mono font-bold text-foreground">
                {project.name}
              </h1>
              {project.github_repo && (
                <p className="text-sm text-muted-foreground font-mono flex items-center gap-1 mt-2">
                  <Github className="w-4 h-4" /> {project.github_repo}
                </p>
              )}
            </div>
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${status.color} bg-opacity-10 border border-current border-opacity-20`}>
              {status.label}
            </span>
          </div>
          <p className="text-lg text-muted-foreground mb-8">{project.description}</p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 mb-8 text-center"
        >
          <div className="inline-flex flex-col items-center">
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  className="stroke-secondary"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 52 * (1 - project.progress / 100),
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-mono font-bold text-foreground">
                  {project.progress}%
                </span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground font-medium">
              Overall Progress
            </p>
            {project.deadline && (
              <p className="text-sm text-muted-foreground mt-2">
                Due: {new Date(project.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        </motion.div>

        {/* Timeline */}
        {timelineEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 mb-8"
          >
            <h2 className="text-xl font-mono font-bold text-foreground mb-6">
              Repository Timeline
            </h2>
            <TimelineView events={timelineEvents} projectName={project.name} />
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Total Commits</p>
            <p className="text-3xl font-mono font-bold text-foreground">
              {project.activity?.totalCommits || 0}
            </p>
          </div>
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Pull Requests</p>
            <p className="text-3xl font-mono font-bold text-foreground">
              {project.activity?.totalPRs || 0}
            </p>
          </div>
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Status</p>
            <p className={`text-lg font-mono font-bold capitalize ${status.color}`}>
              {project.status}
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            Live progress powered by <span className="text-primary font-medium">ShipProof</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicSharePage;
