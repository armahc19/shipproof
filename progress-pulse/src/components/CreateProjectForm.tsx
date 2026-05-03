import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Github, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { API_BASE_URL } from "@/config";

const CreateProjectForm = ({ onProjectCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reposLoading, setReposLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    github_repo: "",
    deadline: "",
  });
  const [repoSearch, setRepoSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState(null);

  // Fetch user's repositories
  useEffect(() => {
  if (open && repos.length === 0) {
    fetchRepositories();
  }
}, [open]);

  const fetchRepositories = async () => {
    try {
      setReposLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/api/repos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch repos");
      const data = await response.json();
      setRepos(data);
    } catch (err) {
      console.error("Error fetching repos:", err);
    } finally {
      setReposLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create project");
      const data = await response.json();

      // Reset form
      setFormData({
        name: "",
        description: "",
        github_repo: "",
        deadline: "",
      });
      setOpen(false);

      // Notify parent
      if (onProjectCreated) {
        onProjectCreated(data.project);
      }
    } catch (err) {
      console.error("Error creating project:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(repoSearch.toLowerCase())
  );
    // 👇 put it here
        const showDropdown =
    repos.length > 0 &&
    repoSearch.trim().length >= 0 &&
    filteredRepos.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              placeholder="My Awesome Project"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-secondary/50 border-border"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this project about?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-secondary/50 border-border min-h-24"
            />
          </div>

          {/* GitHub Repository */}
          <div className="space-y-2">
            <Label>GitHub Repository (Optional)</Label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Search your repositories..."
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                onFocus={() => setRepoSearch("")}
                className="bg-secondary/50 border-border"
              />
              {reposLoading && <Loader className="h-4 w-4 animate-spin" />}
            </div>

            {/* Repo Selection Dropdown */}
            {showDropdown && (
  <div className="max-h-48 overflow-y-auto border border-border rounded-lg bg-card">
    {filteredRepos.length > 0 ? (
      filteredRepos.map((repo) => (
        <motion.button
          key={repo.id}
          type="button"
          onClick={() => {
            setSelectedRepo(repo);

            setFormData((prev) => ({
            ...prev,
            github_repo: repo.full_name,
            }));

            setRepoSearch(repo.name);
          }}
          className="w-full text-left p-3 border-b border-border last:border-b-0 hover:bg-secondary/50"
        >
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-primary" />
            <div>
              <p className="font-medium text-sm">{repo.name}</p>
              <p className="text-xs text-muted-foreground">
                {repo.full_name}
              </p>
            </div>
          </div>
        </motion.button>
      ))
    ) : (
      <div className="p-3 text-sm text-muted-foreground">
        No repositories found
      </div>
    )}
  </div>
)}

            {/* Selected Repo Display */}
            {selectedRepo && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                        {selectedRepo.full_name}
                    </span>
                    </div>

                    <button
                    type="button"
                    onClick={() => {
                        setSelectedRepo(null);
                        setFormData((prev) => ({ ...prev, github_repo: "" }));
                    }}
                    className="text-xs text-primary hover:underline"
                    >
                    Clear
                    </button>
                </div>
                )}
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="bg-secondary/50 border-border"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectForm;
