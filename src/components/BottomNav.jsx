import { NavLink } from 'react-router-dom';
import './BottomNav.scss';

const items = [
  { to: '/citizen', icon: 'bi-house-door-fill', label: 'Home' },
  { to: '/citizen/trips', icon: 'bi-clock-history', label: 'Trips' },
  { to: '/citizen/first-aid', icon: 'bi-heart-pulse-fill', label: 'First aid' },
  { to: '/citizen/profile', icon: 'bi-person-fill', label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end className="bottom-nav__item">
          <i className={`bi ${item.icon}`} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}