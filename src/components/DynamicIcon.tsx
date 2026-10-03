import React from 'react';
import {
  Layers,
  Cpu,
  ShieldCheck,
  BarChart3,
  Smartphone,
  Workflow,
  Code2,
  Cloud,
  Database,
  Globe,
  Lock,
  Zap,
  Server,
  Terminal,
  Sparkles,
  LineChart,
  Boxes,
  Rocket,
  Compass,
  Briefcase,
  CheckCircle2,
  Settings,
  Gauge,
  Network,
} from 'lucide-react';

export const AVAILABLE_SERVICE_ICONS = [
  'Layers',
  'Cpu',
  'ShieldCheck',
  'BarChart3',
  'Smartphone',
  'Workflow',
  'Code2',
  'Cloud',
  'Database',
  'Globe',
  'Lock',
  'Zap',
  'Server',
  'Terminal',
  'LineChart',
  'Boxes',
  'Rocket',
  'Compass',
  'Briefcase',
  'Gauge',
  'Network',
  'Settings',
  'CheckCircle2',
  'Sparkles',
] as const;

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Cpu,
  ShieldCheck,
  BarChart3,
  Smartphone,
  Workflow,
  Code2,
  Cloud,
  Database,
  Globe,
  Lock,
  Zap,
  Server,
  Terminal,
  LineChart,
  Boxes,
  Rocket,
  Compass,
  Briefcase,
  Gauge,
  Network,
  Settings,
  CheckCircle2,
  Sparkles,
};

interface DynamicIconProps {
  name: string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5' }) => {
  const IconComponent = ICON_MAP[name] || Layers;
  return <IconComponent className={className} />;
};
