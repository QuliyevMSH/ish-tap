
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import WorkerDetail from "./pages/WorkerDetail";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import { useEffect, useState } from "react";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useIsMobile } from "./hooks/use-mobile";
import Workers from "./pages/Workers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10000,
    },
  },
});

const App = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const isMobile = useIsMobile();

  // Check if this is the first visit
  useEffect(() => {
    const visited = localStorage.getItem('visited');
    if (visited) {
      setIsFirstVisit(false);
    } else {
      localStorage.setItem('visited', 'true');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <Layout>
                <div className={isMobile ? "mobile-view" : "web-view"}>
                  <Routes>
                    <Route path="/" element={<Navigate to={isFirstVisit ? "/auth" : "/jobs"} replace />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:id" element={<JobDetail />} />
                    <Route path="/workers" element={<Workers />} />
                    <Route path="/workers/:id" element={<WorkerDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:userId" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </Layout>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
