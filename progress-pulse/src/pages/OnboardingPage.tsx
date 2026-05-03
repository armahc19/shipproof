import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Github, Link2, Rocket, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const OnboardingPage = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const isDeveloper = role === "developer";

  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const developerSteps = [
    {
      title: "Connect GitHub",
      description: "Link your repositories to track commits and deployments.",
      icon: Github,
      action: (
        <Button variant="outline" className="w-full gap-2" onClick={() => setStep(1)}>
          <Github className="h-4 w-4" />
          Connect GitHub
        </Button>
      ),
      skip: true,
    },
    {
      title: "Create your first project",
      description: "Give your project a name to get started.",
      icon: Rocket,
      action: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project name</Label>
            <Input
              id="project"
              placeholder="My Awesome App"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-secondary/50 border-border focus:border-primary transition-colors"
            />
          </div>
          <Button className="w-full group" onClick={() => setStep(2)}>
            Create project
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      ),
      skip: true,
    },
    {
      title: "You're all set!",
      description: "Your workspace is ready. Start tracking your project.",
      icon: CheckCircle2,
      action: (
        <Button className="w-full group" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      ),
      skip: false,
    },
  ];

  const clientSteps = [
    {
      title: "Join a project",
      description: "Enter the project link or invite code shared by your developer.",
      icon: Link2,
      action: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite">Project link or invite code</Label>
            <Input
              id="invite"
              placeholder="https://shipproof.app/share/... or ABC-123"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="bg-secondary/50 border-border focus:border-primary transition-colors"
            />
          </div>
          <Button className="w-full group" onClick={() => setStep(1)}>
            Join project
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      ),
      skip: true,
    },
    {
      title: "You're all set!",
      description: "You can now track your project's progress in real time.",
      icon: CheckCircle2,
      action: (
        <Button className="w-full group" onClick={() => navigate("/client/demo-project")}>
          View Project
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      ),
      skip: false,
    },
  ];

  const steps = isDeveloper ? developerSteps : clientSteps;
  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-border"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{current.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{current.description}</p>
            </div>

            {current.action}

            {current.skip && (
              <button
                onClick={() => setStep(step + 1)}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
              >
                Skip for now
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
