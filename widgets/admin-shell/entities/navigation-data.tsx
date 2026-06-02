import {
  BadgeRussianRuble,
  BarChart3,
  Bell,
  Bot,
  BotMessageSquare,
  Box,
  Brain,
  FileText,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Package,
  Settings,
  ShieldAlert,
  ShoppingCart,
  Users,
  WalletCards,
  Globe2
} from 'lucide-react'

export const navItems = [
  {
    title: 'Dashboard',
    href: 'dashboard',
    icon: LayoutDashboard
  },
  { title: 'Conversations', href: 'conversations', icon: MessageSquare },
  { title: 'Clients', href: 'clients', icon: Users },

  { title: 'Deals', href: 'deals', icon: FileText },
  { title: 'Orders', href: 'orders', icon: ShoppingCart },

  { title: 'Payments', href: 'payments', icon: WalletCards },

  { title: 'Products', href: 'products', icon: Package },
  { title: 'Product Categories', href: 'product-categories', icon: Box },
  { title: 'AI Agents', href: 'ai-agents', icon: Brain },
  {
    title: 'AI Workspace',
    href: 'ai-workspace',
    icon: BotMessageSquare
  }
]

export const sidebarItems = [
  {
    title: 'Dashboard',
    href: 'dashboard',
    icon: LayoutDashboard
  },
  { title: 'Conversations', href: 'conversations', icon: MessageSquare },
  { title: 'Clients', href: 'clients', icon: Users },

  { title: 'Deals', href: 'deals', icon: FileText },
  { title: 'Orders', href: 'orders', icon: ShoppingCart },
  { title: 'Payments', href: 'payments', icon: WalletCards },

  { title: 'Products', href: 'products', icon: Package },
  { title: 'Product Categories', href: 'product-categories', icon: Box },
  { title: 'Websites', href: 'websites', icon: Globe2 },
  { title: 'Bots', href: 'bots', icon: Bot },
  { title: 'AI Agents', href: 'ai-agents', icon: Brain },
  {
    title: 'AI Workspace',
    href: 'ai-workspace',
    icon: BotMessageSquare
  },

  { title: 'Analytics', href: 'analytics', icon: BarChart3 },
  { title: 'Tasks', href: 'tasks', icon: ListChecks },
  { title: 'Notifications', href: 'notifications', icon: Bell },
  { title: 'Warnings', href: 'warnings', icon: ShieldAlert },

  { title: 'Currency', href: 'currency', icon: BadgeRussianRuble },
  { title: 'Settings', href: 'settings', icon: Settings }
]
