import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={styles.loading}><div style={styles.spinner}></div><p>Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const styles = {
  loading: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", color:"#4f46e5" },
  spinner: { width:"40px", height:"40px", border:"4px solid #e0e0e0", borderTop:"4px solid #4f46e5", borderRadius:"50%", animation:"spin 1s linear infinite" },
};

export default ProtectedRoute;
