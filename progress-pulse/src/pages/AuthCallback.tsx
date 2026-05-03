import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (token) {
      // Save token to localStorage
      localStorage.setItem("auth_token", token);
      
      // Decode token to get user info (basic decode, not cryptographic)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        localStorage.setItem("shipproof_user", JSON.stringify(payload));
        
        // Set role to developer by default for GitHub users
        localStorage.setItem("shipproof_role", "developer");
      } catch (e) {
        console.error("Failed to parse token", e);
      }
      
      // Redirect to dashboard
      navigate("/dashboard");
    } else {
      // No token, redirect to login
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Authenticating with GitHub...</p>
      </motion.div>
    </div>
  );
};

export default AuthCallback;
