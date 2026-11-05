import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Crew.scss";

export default function Duty() {
  const { user } = useAuth();
  const [onDuty, setOnDuty] = useState(false);

  return (
    <main className="crew-page">
      <h1>duty</h1>
    </main>
  );
}
