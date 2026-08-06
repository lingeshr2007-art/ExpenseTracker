// src/utils/categoryIcons.jsx
import React from "react";
import {
  FaUtensils,
  FaCar,
  FaBagShopping,
  FaGamepad,
  FaHeartPulse,
  FaReceipt,
  FaGraduationCap,
  FaBriefcase,
  FaArrowTrendUp,
  FaEllipsis,
  FaCircle,
  FaWallet,
  FaHouse,
  FaWifi,
  FaPlane,
  FaGift,
  FaMusic,
  FaBook,
  FaDumbbell,
} from "react-icons/fa6";
import { themeColors } from "../theme/colors";

const iconMap = {
  UtensilsCrossed: FaUtensils,
  Car: FaCar,
  ShoppingBag: FaBagShopping,
  Gamepad2: FaGamepad,
  Heart: FaHeartPulse,
  Receipt: FaReceipt,
  GraduationCap: FaGraduationCap,
  Briefcase: FaBriefcase,
  TrendingUp: FaArrowTrendUp,
  MoreHorizontal: FaEllipsis,
  Circle: FaCircle,
  Wallet: FaWallet,
  Home: FaHouse,
  Wifi: FaWifi,
  Plane: FaPlane,
  Gift: FaGift,
  Music: FaMusic,
  BookOpen: FaBook,
  Dumbbell: FaDumbbell,
};

export function CategoryIcon({ name, size = 16, className = "" }) {
  const Icon = iconMap[name] || FaCircle;
  return <Icon size={size} className={className} />;
}

export function getCategoryColor(categories, catName) {
  const cat = categories?.find((c) => c.name === catName);
  return cat?.color || themeColors.primaryAccent;
}
