import { motion } from "framer-motion";
import { GitCommit, Shield, Eye, Zap, ArrowRight, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: GitCommit,
    title: "Proof, Not Promises",
    description: "Every commit, PR, and deployment is automatically tracked and translated into human-readable progress.",
  },
  {
    icon: Eye,
    title: "Client Clarity",
    description: "Clients see progress bars and timelines — not commit hashes and branch names.",
  },
  {
    icon: Shield,
    title: "Trust by Default",
    description: "Shareable progress pages that prove work is happening. No login required for clients.",
  },
  {
    icon: Zap,
    title: "Zero Overhead",
    description: "Connect GitHub, create milestones, and let ShipProof do the rest automatically.",
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-mono font-bold text-lg text-foreground">ShipProof</span>
          </Link>
          <div className="flex items-center gap-4">
           {/* <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Button>
            </Link>
            <Link to="/client/demo-project">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Client View
              </Button>
            </Link>*/}
            <Link to="/login">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--glow-primary)),transparent_50%)]" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-sm text-primary font-medium">Live proof of developer progress</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-mono font-bold tracking-tight mb-6">
              <span className="text-foreground">Ship with </span>
              <span className="gradient-text">proof.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              Translate commits, PRs, and deployments into crystal-clear progress your clients actually understand. No jargon. Just proof.
            </p>
            <div className="flex items-center gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8 h-12 text-base">
                  Start Shipping <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              {/*<Link to="/share/demo-project">
                <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary gap-2 h-12 text-base">
                  <Eye className="w-4 h-4" /> See Demo
                </Button>
              </Link>*/}
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <div className="glass-card p-1 glow-primary">
              <div className="bg-card rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <span className="text-sm text-muted-foreground font-mono">shipproof — developer dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Active Projects", value: "4", change: "+1 this week" },
                    { label: "Tasks Completed", value: "23", change: "87% rate" },
                    { label: "Client Satisfaction", value: "98%", change: "↑ 3%" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-mono font-bold text-foreground mt-1">{stat.value}</p>
                      <p className="text-xs text-primary mt-1">{stat.change}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-4">
              Built for trust
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Everything your clients need to feel confident, without the noise.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:border-primary/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-mono font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="glass-card p-12 max-w-3xl mx-auto text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--glow-primary)),transparent_70%)]" />
            <div className="relative z-10">
              <Github className="w-10 h-10 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-mono font-bold text-foreground mb-4">
                Connect. Ship. Prove.
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Link your GitHub repos, create milestones, and give your clients a window into real progress.
              </p>
              <Link to="/login">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">ShipProof</span>
          </div>
          <p className="text-sm text-muted-foreground">Built for developers who ship.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
