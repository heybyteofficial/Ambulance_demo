import { NavLink } from "react-router-dom";
import "./CrewNav.scss";

const items = [
  { to: "/", icon: "bi-speedometer2", label: "Duty", end: true },
  { to: "/crew/trips", icon: "bi-clock-history", label: "Trips" },
  { to: "/crew/vehicle", icon: "bi-truck-front-fill", label: "Vehicle" },
  { to: "/crew/profile", icon: "bi-person-fill", label: "Profile" },
];

export default function CrewNav() {
  return (
    <nav className="crew-nav" aria-label="Crew navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `crew-nav__item ${isActive ? "is-active" : ""}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="crew-nav__icon">
                <i className={`bi ${item.icon}`} aria-hidden="true" />
              </span>
              <span className="crew-nav__label">{item.label}</span>
              {isActive && (
                <span className="crew-nav__indicator" aria-hidden="true" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
