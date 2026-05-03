export interface Project {
  id: string;
  name: string;
  description: string;
  deadline?: string;
  repo?: string;
  progress: number;
  status: "active" | "completed" | "delayed";
  shareLink: string;
  milestones: Milestone[];
  activities: Activity[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "pending";
  commits: number;
  linkedPR?: string;
}

export interface Activity {
  id: string;
  message: string;
  timestamp: string;
  type: "commit" | "pr" | "merge" | "milestone" | "deploy";
}

export const mockProjects: Project[] = [
  {
    id: "demo-project",
    name: "E-Commerce Platform",
    description: "Full-stack e-commerce solution with payments and inventory",
    deadline: "2026-04-30",
    repo: "acme/ecommerce-platform",
    progress: 72,
    status: "active",
    shareLink: "/share/demo-project",
    milestones: [
      {
        id: "m1",
        title: "Authentication System",
        description: "User signup, login, password reset, and OAuth",
        tasks: [
          { id: "t1", title: "Email/password auth", status: "completed", commits: 8, linkedPR: "#12" },
          { id: "t2", title: "Google OAuth integration", status: "completed", commits: 5, linkedPR: "#15" },
          { id: "t3", title: "Password reset flow", status: "completed", commits: 3, linkedPR: "#18" },
        ],
      },
      {
        id: "m2",
        title: "Product Catalog",
        description: "Product listing, search, filtering, and detail pages",
        tasks: [
          { id: "t4", title: "Product listing page", status: "completed", commits: 12 },
          { id: "t5", title: "Search & filters", status: "in-progress", commits: 6 },
          { id: "t6", title: "Product detail page", status: "in-progress", commits: 4 },
        ],
      },
      {
        id: "m3",
        title: "Shopping Cart & Checkout",
        description: "Cart management, Stripe payments, order confirmation",
        tasks: [
          { id: "t7", title: "Cart management", status: "in-progress", commits: 3 },
          { id: "t8", title: "Stripe integration", status: "pending", commits: 0 },
          { id: "t9", title: "Order confirmation", status: "pending", commits: 0 },
        ],
      },
    ],
    activities: [
      { id: "a1", message: "3 commits pushed to product catalog", timestamp: "2 hours ago", type: "commit" },
      { id: "a2", message: "Pull request merged: Google OAuth", timestamp: "5 hours ago", type: "merge" },
      { id: "a3", message: "Search & filters module started", timestamp: "1 day ago", type: "commit" },
      { id: "a4", message: "Authentication system completed", timestamp: "2 days ago", type: "milestone" },
      { id: "a5", message: "Pull request opened: Product listing", timestamp: "3 days ago", type: "pr" },
      { id: "a6", message: "Password reset flow deployed", timestamp: "4 days ago", type: "deploy" },
      { id: "a7", message: "8 commits pushed to authentication", timestamp: "5 days ago", type: "commit" },
    ],
  },
  {
    id: "project-2",
    name: "Analytics Dashboard",
    description: "Real-time analytics with custom reports and visualizations",
    repo: "acme/analytics-dash",
    progress: 45,
    status: "active",
    shareLink: "/share/project-2",
    milestones: [
      {
        id: "m4",
        title: "Data Pipeline",
        description: "Event ingestion and processing",
        tasks: [
          { id: "t10", title: "Event collector API", status: "completed", commits: 14 },
          { id: "t11", title: "Data aggregation", status: "in-progress", commits: 7 },
        ],
      },
    ],
    activities: [
      { id: "a8", message: "7 commits pushed to data aggregation", timestamp: "1 hour ago", type: "commit" },
      { id: "a9", message: "Event collector API completed", timestamp: "1 day ago", type: "milestone" },
    ],
  },
  {
    id: "project-3",
    name: "Mobile App Backend",
    description: "REST API and real-time features for iOS/Android app",
    deadline: "2026-03-15",
    repo: "acme/mobile-backend",
    progress: 95,
    status: "completed",
    shareLink: "/share/project-3",
    milestones: [
      {
        id: "m5",
        title: "Core API",
        description: "RESTful endpoints for all app features",
        tasks: [
          { id: "t12", title: "User endpoints", status: "completed", commits: 10 },
          { id: "t13", title: "Content endpoints", status: "completed", commits: 15 },
          { id: "t14", title: "Push notifications", status: "completed", commits: 8 },
        ],
      },
    ],
    activities: [
      { id: "a10", message: "Project completed and deployed", timestamp: "1 week ago", type: "deploy" },
    ],
  },
];
