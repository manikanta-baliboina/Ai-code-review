import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Repositories", to: "/repositories" },
];

/**
 * Primary app navigation.
 */
export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-500 to-emerald-500" />
          <div>
            <p className="font-display text-lg font-semibold text-white">Review Forge</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">AI Platform</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  active ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="h-10 w-10 rounded-full border border-white/10" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
              {user?.username?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">{user?.username}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
