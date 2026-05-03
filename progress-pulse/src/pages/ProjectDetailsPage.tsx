import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Edit,
  Trash2,
  Loader,
  Github,
  RefreshCw,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { API_BASE_URL } from "@/config";
import { useToast } from "@/hooks/use-toast";
import ActivityFeed from "@/components/ActivityFeed";
import MilestoneCard from "@/components/MilestoneCard";
import TimelineView from "@/components/TimelineView";

const statusBadge = {
  active: { icon: Clock, label: "Active", className: "text-accent bg-accent/10" },
  completed: { icon: CheckCircle2, label: "Completed", className: "text-success bg-success/10" },
  delayed: { icon: AlertTriangle, label: "Delayed", className: "text-destructive bg-destructive/10" },
};

interface ProjectData {
  id: string;
  name: string;
  description: string;
  github_repo: string;
  progress: number;
  status: "active" | "completed" | "delayed";
  deadline?: string;
}

interface Activity {
  id: string;
  message: string;
  timestamp: string;
  type: "commit" | "pr" | "merge" | "milestone" | "deploy";
}

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data);

        // Transform commits/PRs into activities for ActivityFeed
        const transformedActivities: Activity[] = [];
        
        // Add commits as activities
        if (data.activity?.commits) {
          data.activity.commits.forEach((commit: any, index: number) => {
            transformedActivities.push({
              id: `commit-${index}`,
              message: `Commit: ${commit.message || "Code update"}`,
              timestamp: new Date(commit.created_at).toLocaleDateString(),
              type: "commit",
            });
          });
        }

        // Add PRs as activities
        if (data.activity?.pull_requests) {
          data.activity.pull_requests.forEach((pr: any, index: number) => {
            transformedActivities.push({
              id: `pr-${index}`,
              message: `Pull Request: ${pr.title}`,
              timestamp: new Date(pr.created_at).toLocaleDateString(),
              type: pr.state === "merged" ? "merge" : "pr",
            });
          });
        }

        setActivities(transformedActivities.slice(0, 7)); // Show last 7 activities
        
        // Set timeline events from the API response
        if (data.activity?.timeline) {
          setTimelineEvents(data.activity.timeline);
        }
      }
    } catch (err) {
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        // Refresh activities
        fetchProjectDetails();
      }
    } catch (err) {
      console.error("Error syncing project:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleShare = () => {
    const shareLink = `${window.location.origin}/share/${projectId}`;
    navigator.clipboard.writeText(shareLink);
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
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Project not found</p>
            <Link to="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const badge = statusBadge[project.status] || statusBadge.active;
  const BadgeIcon = badge.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="font-mono font-bold text-foreground">{project.name}</h1>
              <p className="text-xs text-muted-foreground">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
              title="Copy share link to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" /> Share
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              Sync
            </Button>
            <Link to={`/dashboard/${projectId}/edit`}>
              <Button variant="outline" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Edit className="w-4 h-4" /> Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2 text-destructive border-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Progress and Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-mono font-bold text-foreground">Project Status</h2>
                    <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${badge.className}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </div>
                  {project.github_repo && (
                    <p className="text-sm text-muted-foreground font-mono flex items-center gap-1">
                      <Github className="w-3 h-3" /> {project.github_repo}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Ring */}
              <div className="inline-flex flex-col items-center w-full">
                <div className="relative w-40 h-40 mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" className="stroke-secondary" strokeWidth="8" />
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
                      animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - project.progress / 100) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-mono font-bold text-foreground">{project.progress}%</span>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">Overall Progress</p>
              </div>
            </motion.div>

            {/* Timeline and Activity Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="activity">Activity Feed</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="space-y-4">
                  {timelineEvents.length > 0 ? (
                    <TimelineView events={timelineEvents} projectName={project.name} />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No commits or pull requests yet</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity">
                  {activities.length > 0 ? (
                    <ActivityFeed activities={activities} title="Recent Activity" />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No activity yet</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Right Column - Meta Info */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4"
            >
              <h3 className="font-mono font-semibold text-foreground mb-4">Project Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Status</p>
                  <p className="text-foreground font-medium capitalize">{project.status}</p>
                </div>
                {project.deadline && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Deadline</p>
                    <p className="text-foreground font-medium">{new Date(project.deadline).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="font-mono font-bold text-primary">{project.progress}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetailsPage;
