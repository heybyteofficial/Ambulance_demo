import { createContext, useContext, useState } from "react";
import { seedCrewDemoData } from "../mock/crewDemo";

const KEY = "ambulance_account";
const AuthContext = createContext(null);

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved?.phone ? saved : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = read();
    if (saved?.role === "crew") seedCrewDemoData(saved);
    return saved;
  });

  const login = (name, phone, role = "citizen") => {
    const account = { name, phone, role };
    localStorage.setItem(KEY, JSON.stringify(account));
    if (role === "crew" && seedCrewDemoData(account)) {
      window.dispatchEvent(new Event("ambulance_crew_demo_seeded"));
      window.dispatchEvent(new Event("ambulance_trips_updated"));
    }
    setUser(account);
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: Boolean(user), login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
