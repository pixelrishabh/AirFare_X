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
      items: [
        {
          title: 'Overview',
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Airfare Index',
          url: '/airfare-index',
          icon: IconChartLine,
        },
        {
          title: 'Route Analysis',
          url: '/route-analysis',
          icon: IconRoute,
        },
        {
          title: 'Airline Analysis',
          url: '/airline-analysis',
          icon: IconPlane,
        },
        {
          title: 'Route Heatmap',
          url: '/route-heatmap',
          icon: IconGridDots,
        },
        {
          title: 'Lead-Time Analysis',
          url: '/lead-time-analysis',
          icon: IconClockHour4,
        },
      ],
    },
    {
      title: 'Data & Verification',
      items: [
        {
          title: 'Data Explorer',
          url: '/data-explorer',
          icon: IconDatabase,
        },
        {
          title: 'Backtesting',
          url: '/backtesting',
          icon: IconScale,
        },
      ],
    },
    {
      title: 'Platform & API',
      items: [
        {
          title: 'API Documentation',
          url: '/api-docs',
          icon: IconCode,
        },
        {
          title: 'System Status',
          url: '/system-status',
          badge: 'Live',
          icon: IconActivity,
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          title: 'Settings',
          icon: IconSettings,
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
        },
      ],
    },
  ],
}

