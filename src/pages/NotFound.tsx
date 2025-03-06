
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Səhifə tapılmadı</p>
        <Button onClick={() => navigate("/jobs")}>
          Ana səhifəyə qayıt
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
