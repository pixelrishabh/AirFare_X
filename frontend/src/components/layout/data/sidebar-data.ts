import {
  IconLayoutDashboard,
  IconChartLine,
  IconRoute,
  IconPlane,
  IconGridDots,
  IconClockHour4,
  IconDatabase,
  IconScale,
  IconCode,
  IconActivity,
  IconSettings,
  IconUserCog,
  IconTool,
  IconPalette,
  IconBell,
  IconDeviceDesktopAnalytics,
  IconHelpCircle,
  IconBuildingCommunity,
  IconUsers,
} from '@tabler/icons-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'NSO Analytical Desk',
    email: 'analytics@airfarex.gov.in',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'AirFareX',
      logo: IconBuildingCommunity,
      plan: 'Price Intelligence Index',
    },
  ],
  navGroups: [
    {
      title: 'Index & Intelligence',
      roles: ['VIEWER', 'ANALYST', 'ADMIN'],
      items: [
        {
          title: 'Overview',
          url: '/',
          icon: IconLayoutDashboard,
          roles: ['VIEWER', 'ANALYST', 'ADMIN'],
        },
        {
          title: 'Airfare Index',
          url: '/airfare-index',
          icon: IconChartLine,
          roles: ['VIEWER', 'ANALYST', 'ADMIN'],
        },
        {
          title: 'Route Analysis',
          url: '/route-analysis',
          icon: IconRoute,
          roles: ['VIEWER', 'ANALYST', 'ADMIN'],
        },
        {
          title: 'Airline Analysis',
          url: '/airline-analysis',
          icon: IconPlane,
          roles: ['VIEWER', 'ANALYST', 'ADMIN'],
        },
        {
          title: 'Route Heatmap',
          url: '/route-heatmap',
          icon: IconGridDots,
          roles: ['VIEWER', 'ANALYST', 'ADMIN'],
        },
        {
          title: 'Lead-Time Analysis',
          url: '/lead-time-analysis',
          icon: IconClockHour4,
          roles: ['VIEWER', 'ANALYST', 'ADMIN'],
        },
      ],
    },
    {
      title: 'Data & Empirical Verification',
      roles: ['VIEWER', 'ANALYST', 'ADMIN'],
      items: [
        {
          title: 'Data Explorer',
          url: '/data-explorer',
          icon: IconDatabase,
          roles: ['VIEWER', 'ANALYST', 'ADMIN'],
        },
        {
          title: 'Backtesting',
          url: '/backtesting',
          icon: IconScale,
          roles: ['ANALYST', 'ADMIN'],
        },
      ],
    },
    {
      title: 'Platform & Operations',
      roles: ['ANALYST', 'ADMIN'],
      items: [
        {
          title: 'API Documentation',
          url: '/api-docs',
          icon: IconCode,
          roles: ['ANALYST', 'ADMIN'],
        },
        {
          title: 'System Status',
          url: '/system-status',
          badge: 'Live',
          icon: IconActivity,
          roles: ['ADMIN'],
        },
        {
          title: 'User Management',
          url: '/users',
          icon: IconUsers,
          roles: ['ADMIN'],
        },
      ],
    },
    {
      title: 'Settings',
      roles: ['VIEWER', 'ANALYST', 'ADMIN'],
      items: [
        {
          title: 'Settings',
          icon: IconSettings,
          roles: ['VIEWER', 'ANALYST', 'ADMIN'],
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: IconUserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: IconTool,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: IconBell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: IconDeviceDesktopAnalytics,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: IconHelpCircle,
          roles: ['VIEWER', 'ANALYST', 'ADMIN'],
        },
      ],
    },
  ],
}