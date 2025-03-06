
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the jobs page
    navigate("/jobs");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">İş Tap</h1>
        <p className="mt-2">Yüklənir...</p>
      </div>
    </div>
  );
};

export default Index;
