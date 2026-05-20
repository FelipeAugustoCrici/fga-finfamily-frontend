import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { AIChatPanel } from './AIChatPanel';
import {
  LayoutDashboard,
  ListOrdered,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Target,
  PiggyBank,
  BarChart3,
  Heart,
  CreditCard,
  Tags,
  User,
  CalendarDays,
} from 'lucide-react';
import { cn } from './ui/Button';
import { logout } from '@/services/logout';
import LogoSvg from '@/common/icons/logo.svg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

// ─── Sidebar leaf item ────────────────────────────────────────────────────────

const SidebarItem = ({
  to,
  icon: Icon,
  label,
  active,
  onNavigate,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
}) => (
  <Link
    to={to}
    onClick={onNavigate}
    className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
      active
        ? 'bg-primary-700 text-white shadow-md'
        : 'text-primary-400 hover:bg-primary-800 hover:text-white',
    )}
  >
    <Icon
      size={20}
      className={cn(active ? 'text-white' : 'text-primary-500 group-hover:text-white')}
    />
    <span className="font-medium">{label}</span>
    {active && <ChevronRight size={16} className="ml-auto" />}
  </Link>
);

// ─── Accordion group ──────────────────────────────────────────────────────────

function SidebarAccordion({
  icon: Icon,
  label,
  items,
  isActive,
  onNavigate,
}: {
  icon: React.ElementType;
  label: string;
  items: SubItem[];
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = React.useState(isActive);
  const location = useLocation();

  React.useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full group',
          isActive
            ? 'bg-primary-800 text-white'
            : 'text-primary-400 hover:bg-primary-800 hover:text-white',
        )}
      >
        <Icon
          size={20}
          className={cn(isActive ? 'text-white' : 'text-primary-500 group-hover:text-white')}
        />
        <span className="font-medium flex-1 text-left">{label}</span>
        <ChevronDown
          size={16}
          className={cn('transition-transform duration-200', open ? 'rotate-180' : '')}
        />
      </button>

      {open && (
        <div className="ml-4 mt-1 space-y-1 border-l border-primary-700 pl-3">
          {items.map((item) => {
            const active =
              location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm group',
                  active
                    ? 'bg-primary-700 text-white shadow-md'
                    : 'text-primary-400 hover:bg-primary-800 hover:text-white',
                )}
              >
                <item.icon
                  size={16}
                  className={cn(active ? 'text-white' : 'text-primary-500 group-hover:text-white')}
                />
                <span className="font-medium">{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── FAB ──────────────────────────────────────────────────────────────────────

function AIChatFAB({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Chat IA — Registrar com linguagem natural"
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 201,
        display: 'flex',
        alignItems: 'center',
        gap: hovered ? 10 : 0,
        padding: hovered ? '14px 20px' : '14px',
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        background: isOpen
          ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
          : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        boxShadow: hovered
          ? '0 8px 32px rgba(99,102,241,0.5),0 2px 8px rgba(0,0,0,0.2)'
          : '0 4px 20px rgba(99,102,241,0.4),0 2px 8px rgba(0,0,0,0.15)',
        transform: hovered ? 'scale(1.06)' : 'scale(1)',
        transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        maxWidth: hovered ? 200 : 52,
      }}
    >
      <Sparkles size={20} color="#fff" style={{ flexShrink: 0 }} />
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#fff',
          opacity: hovered ? 1 : 0,
          maxWidth: hovered ? 120 : 0,
          transition: 'opacity 0.15s, max-width 0.2s',
          overflow: 'hidden',
        }}
      >
        {isOpen ? 'Fechar' : 'Chat IA'}
      </span>
    </button>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SidebarSection({ label }: { label: string }) {
  return (
    <p
      className="px-4 pt-4 pb-1 text-xs font-bold tracking-widest uppercase text-primary-600 select-none"
    >
      {label}
    </p>
  );
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const recordsSubItems: SubItem[] = [
  { to: '/record', icon: ListOrdered, label: 'Lista' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendário' },
  { to: '/credit-cards', icon: CreditCard, label: 'Cartões' },
];

const planningSubItems: SubItem[] = [
  { to: '/planning/goals', icon: Target, label: 'Metas' },
  { to: '/planning/budgets', icon: PiggyBank, label: 'Orçamentos' },
  { to: '/reports', icon: BarChart3, label: 'Relatórios' },
];

// ─── Sidebar nav content (shared between desktop + mobile) ───────────────────

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const p = location.pathname;

  const isRecords =
    p.startsWith('/record') || p.startsWith('/calendar') || p.startsWith('/credit-cards');
  const isPlanning = p.startsWith('/planning') || p.startsWith('/reports');

  return (
    <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-700 scrollbar-track-transparent">
      {/* Principal */}
      <SidebarSection label="Principal" />
      <SidebarItem
        to="/"
        icon={LayoutDashboard}
        label="Dashboard"
        active={p === '/' || p === '/dashboard'}
        onNavigate={onNavigate}
      />

      {/* Financeiro */}
      <SidebarSection label="Financeiro" />
      <SidebarAccordion
        icon={ListOrdered}
        label="Lançamentos"
        items={recordsSubItems}
        isActive={isRecords}
        onNavigate={onNavigate}
      />
      <SidebarAccordion
        icon={ClipboardList}
        label="Planejamento"
        items={planningSubItems}
        isActive={isPlanning}
        onNavigate={onNavigate}
      />

      {/* Família */}
      <SidebarSection label="Família" />
      <SidebarItem
        to="/family"
        icon={Users}
        label="Membros"
        active={p.startsWith('/family')}
        onNavigate={onNavigate}
      />
      <SidebarItem
        to="/couple-mode"
        icon={Heart}
        label="Modo Casal"
        active={p.startsWith('/couple-mode')}
        onNavigate={onNavigate}
      />

      {/* Configurações */}
      <SidebarSection label="Configurações" />
      <SidebarItem
        to="/category"
        icon={Tags}
        label="Categorias"
        active={p.startsWith('/category')}
        onNavigate={onNavigate}
      />
      <SidebarItem
        to="/profile"
        icon={User}
        label="Meu Perfil"
        active={p.startsWith('/profile')}
        onNavigate={onNavigate}
      />
    </nav>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-primary-900 p-6 text-white fixed h-full shadow-2xl z-20">
        <div className="flex flex-col items-center mb-6 px-2">
          <img
            src={LogoSvg}
            alt="FinFamily"
            style={{ width: 100, height: 100 }}
            className="invert"
          />
          <span className="text-xl font-bold tracking-tight">FinFamily AI</span>
        </div>

        <SidebarNav />

        <div className="mt-auto pt-6 border-t border-primary-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-400 hover:bg-danger-500/10 hover:text-danger-500 transition-all w-full text-left"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center px-4 py-3 bg-white border-b border-primary-100">
          <button className="p-2 text-primary-600" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>

        <div className="p-4 md:p-8 animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-primary-900/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-primary-900 h-full p-6 animate-in slide-in-from-left duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8 px-2 text-white">
              <div className="flex items-center gap-3">
                <img src={LogoSvg} alt="FinFamily" className="w-10 h-10 invert" />
                <span className="text-lg font-bold">FinFamily AI</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <SidebarNav onNavigate={() => setIsMobileMenuOpen(false)} />
            <div className="mt-auto pt-6 border-t border-primary-800">
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-400 hover:bg-danger-500/10 hover:text-danger-500 transition-all w-full text-left"
              >
                <LogOut size={20} />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB + floating chat */}
      <AIChatFAB onClick={() => setIsChatOpen((o) => !o)} isOpen={isChatOpen} />
      <AIChatPanel open={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};
