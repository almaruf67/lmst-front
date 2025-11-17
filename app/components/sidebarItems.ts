export type SidebarNavItem = {
  label: string;
  to: string;
  icon: string;
  hiddenForRoles?: string[];
};

export const sidebarNavItems: SidebarNavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: '📊' },
  { label: 'Students', to: '/students', icon: '👨‍🎓' },
  {
    label: 'Teachers',
    to: '/teachers',
    icon: '👩‍🏫',
    hiddenForRoles: ['teacher'],
  },
  {
    label: 'Admins',
    to: '/admins',
    icon: '🛡️',
    hiddenForRoles: ['teacher'],
  },
  { label: 'Attendance', to: '/attendance', icon: '✓' },
];

export const resolveSidebarNavItems = (
  userType?: string | null
): SidebarNavItem[] => {
  if (!userType) {
    return sidebarNavItems;
  }

  return sidebarNavItems.filter((item) => {
    if (!item.hiddenForRoles) {
      return true;
    }

    return !item.hiddenForRoles.includes(userType);
  });
};
