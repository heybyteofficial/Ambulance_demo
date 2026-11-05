import { useAuth } from "../../context/AuthContext";
import "./Crew.scss";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <main className="crew-page">
      <h1>profile</h1>
    </main>
  );
}
