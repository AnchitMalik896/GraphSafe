import { Home, LayoutDashboard, Settings, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: Home },
  { label: 'Analysis', href: '/analysis', icon: ShieldAlert },
  { label: 'Settings', href: '/settings', icon: Settings },
];