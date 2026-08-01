import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, FileWarning, Shield, Database, Lock } from 'lucide-react';

/**
 * Sidebar navigation panel styled with the Luxury Dark Gold & Serif Theme.
 */
const Sidebar = () => {
  const navItems = [
    { name: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Company Search', path: '/search', icon: Search },
    { name: 'Report a Scam', path: '/report-scam', icon: FileWarning },
    { name: 'Admin Verification Queue', path: '/admin', icon: Lock },
  ];

  return (
    <aside className="w-64 bg-[#181615] border-r border-[#c59b27]/30 p-6 flex flex-col justify-between min-h-[calc(100vh-5rem)]">
      <div>
        <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-[#121110] rounded-lg border border-[#c59b27]/30">
          <Shield className="h-4 w-4 text-[#d4af37]" />
          <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-[#d4af37]">
            Protected Session
          </span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-md text-xs font-serif tracking-[0.12em] uppercase transition-all ${
                    isActive
                      ? 'bg-[#c59b27]/15 text-[#d4af37] border border-[#c59b27]/40 shadow-lg'
                      : 'text-[#a39e93] hover:bg-[#1f1d1a] hover:text-[#f3f0e8]'
                  }`
                }
              >
                <Icon className="h-4 w-4 text-[#c59b27]" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 bg-[#121110] rounded-xl border border-[#c59b27]/30">
        <div className="flex items-center gap-2 text-xs font-serif tracking-wider text-[#d4af37] mb-1">
          <Database className="h-4 w-4 text-[#c59b27] animate-pulse" />
          Dual-Graph Active
        </div>
        <p className="text-[11px] text-[#8c867a] leading-relaxed font-light">
          Connected to Phase 5 MongoDB & Neo4j dual-persistence clusters.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
