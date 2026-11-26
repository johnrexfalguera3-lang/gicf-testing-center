import { TabId } from '../types/dashboard';

export type UserRole = 'agent' | 'trainer' | 'supervisor' | 'manager' | 'admin';

export interface SidebarTabConfig {
  id: TabId;
  label: string;
  badge?: string;
  roles?: UserRole[];
  lobs?: ('voice' | 'chat' | 'email')[];
}

export const SIDEBAR_TABS: SidebarTabConfig[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'simulations', label: 'Simulations', lobs: ['voice', 'chat', 'email'] },
  {
    id: 'admin_users',
    label: 'Admin Users',
    roles: ['trainer', 'supervisor', 'manager', 'admin'],
  },
];