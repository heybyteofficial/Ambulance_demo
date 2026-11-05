import { createContext, useContext, useState } from "react";

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
  const [user, setUser] = useState(read);

  const login = (name, phone, role = "citizen") => {
    const account = { name, phone, role };
    localStorage.setItem(KEY, JSON.stringify(account));
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
