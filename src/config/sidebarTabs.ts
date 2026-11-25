import { TabId } from '../types/dashboard';

export interface SidebarTabConfig {
  id: TabId;
  label: string;
  badge?: string;
  lobs?: Array<'voice' | 'chat' | 'email'>;
}

export const SIDEBAR_TABS: SidebarTabConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
  },
  {
    id: 'simulations',
    label: 'Simulations',
    badge: 'Voice',
  },
];
