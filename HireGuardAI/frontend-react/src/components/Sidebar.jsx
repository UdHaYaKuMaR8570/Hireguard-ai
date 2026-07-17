import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, FileWarning, ShieldCheck, Database, Lock } from 'lucide-react';

/**
 * Sidebar navigation panel designed for internal dashboard interfaces.
 */
const Sidebar = () => {
  const navItems = [
    { name: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Company Search', path: '/search', icon: Search },
    { name: 'Report a Scam', path: '/report-scam', icon: FileWarning },
    { name: 'Admin Verification Queue', path: '/admin', icon: Lock },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 p-6 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div>
        <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <ShieldCheck className="h-5 w-5 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Protected Session
          </span>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
          <Database className="h-4 w-4 animate-pulse" />
          Dual-Graph Active
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Connected to Phase 2 MongoDB & Neo4j dual-persistence clusters.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
