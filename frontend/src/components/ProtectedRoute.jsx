import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');
    const location = useLocation();

    if (!token) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
