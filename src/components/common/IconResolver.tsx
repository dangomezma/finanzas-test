import React from 'react';
import {
  Landmark,
  Smartphone,
  Banknote,
  CreditCard,
  TrendingUp,
  Folder,
  UtensilsCrossed,
  Car,
  Home,
  HeartPulse,
  Film,
  ShoppingBag,
  Briefcase,
  Laptop,
  HelpCircle,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Landmark,
  Smartphone,
  Banknote,
  CreditCard,
  TrendingUp,
  Folder,
  UtensilsCrossed,
  Car,
  Home,
  HeartPulse,
  Film,
  ShoppingBag,
  Briefcase,
  Laptop,
};

interface IconResolverProps {
  name: string;
  className?: string;
}

export const IconResolver: React.FC<IconResolverProps> = ({ name, className = 'w-5 h-5' }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent className={className} />;
};
