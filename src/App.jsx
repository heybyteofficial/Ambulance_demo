import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { CrewProvider } from "./context/CrewContext";
import Splash from "./screens/Splash/Splash";
import SignIn from "./screens/Auth/SignIn";
import CrewSignIn from "./screens/crewApp/auth/CrewSignIn";
import Home from "./screens/Citizen/Home";
import Tracking from "./screens/Citizen/Tracking";
import FirstAid from "./screens/Citizen/FirstAid";
import Trips from "./screens/Citizen/Trips";
import Profile from "./screens/Citizen/Profile";
import BottomNav from "./components/BottomNav";
import CrewNav from "./screens/crewApp/CrewNav";
import Duty from "./screens/crewApp/Duty";
import CrewTrips from "./screens/crewApp/Trips";
import Vehicle from "./screens/crewApp/Vehicle";
import CrewProfile from "./screens/crewApp/Profile";

function Layout() {
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isCitizen =
    pathname === "/citizen" ||
    pathname.startsWith("/citizen/") ||
    ["/tracking", "/first-aid", "/trips", "/profile"].includes(pathname);
  const isCrew = !isCitizen;

  if (!isAuthenticated) {
    return (
      <div className="app-shell app-shell--full">
        {isCitizen ? <SignIn /> : <CrewSignIn />}
      </div>
    );
  }

  if (user?.role === 'crew' && isCitizen) {
    return <Navigate to="/" replace />;
  }
  if (user?.role === 'citizen' && isCrew) {
    return <Navigate to="/citizen" replace />;
  }

  const fullScreen =
    pathname === "/citizen/tracking" || pathname === "/tracking";

  return (
    <div className={`app-shell ${fullScreen ? "app-shell--full" : ""}`}>
      <Routes>
        <Route path="/" element={<Duty />} />
        <Route path="/crew" element={<Navigate to="/" replace />} />
        <Route path="/crew/trips" element={<CrewTrips />} />
        <Route path="/crew/vehicle" element={<Vehicle />} />
        <Route path="/crew/profile" element={<CrewProfile />} />
        <Route path="/crew/*" element={<Navigate to="/" replace />} />
        <Route path="/citizen" element={<Home />} />
        <Route path="/citizen/tracking" element={<Tracking />} />
        <Route path="/citizen/first-aid" element={<FirstAid />} />
        <Route path="/citizen/trips" element={<Trips />} />
        <Route path="/citizen/profile" element={<Profile />} />
        <Route
          path="/tracking"
          element={<Navigate to="/citizen/tracking" replace />}
        />
        <Route
          path="/first-aid"
          element={<Navigate to="/citizen/first-aid" replace />}
        />
        <Route
          path="/trips"
          element={<Navigate to="/citizen/trips" replace />}
        />
        <Route
          path="/profile"
          element={<Navigate to="/citizen/profile" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!fullScreen && (isCrew ? <CrewNav /> : <BottomNav />)}
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <Splash />;

  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <CrewProvider>
            <Layout />
          </CrewProvider>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
