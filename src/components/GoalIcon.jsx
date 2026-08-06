// src/components/GoalIcon.jsx
import React from "react";
import {
  FaTriangleExclamation,
  FaPlane,
  FaHouse,
  FaCar,
  FaGraduationCap,
  FaLaptop,
  FaMobileScreen,
  FaRing,
  FaBriefcase,
  FaChartLine,
  FaHeartPulse,
  FaGamepad,
  FaBullseye,
  FaUmbrellaBeach,
  FaRocket,
  FaBagShopping,
  FaUtensils,
  FaFilm,
  FaBook,
  FaBolt,
  FaTag,
  FaMoneyBillWave,
  FaGift,
  FaMusic,
  FaDumbbell,
  FaWifi,
} from "react-icons/fa6";

const ICON_MAP = {
  // Goal Categories & Names
  Emergency: FaTriangleExclamation,
  Siren: FaTriangleExclamation,
  "🚨": FaTriangleExclamation,

  Vacation: FaPlane,
  Plane: FaPlane,
  "✈️": FaPlane,

  House: FaHouse,
  Home: FaHouse,
  "🏠": FaHouse,

  Vehicle: FaCar,
  Car: FaCar,
  "🚗": FaCar,

  Education: FaGraduationCap,
  GraduationCap: FaGraduationCap,
  "🎓": FaGraduationCap,

  Laptop: FaLaptop,
  Computer: FaLaptop,
  "💻": FaLaptop,

  Mobile: FaMobileScreen,
  Phone: FaMobileScreen,
  "📱": FaMobileScreen,

  Wedding: FaRing,
  Ring: FaRing,
  "💒": FaRing,
  "💍": FaRing,

  Business: FaBriefcase,
  Work: FaBriefcase,
  Briefcase: FaBriefcase,
  "💼": FaBriefcase,

  Investment: FaChartLine,
  Invest: FaChartLine,
  TrendingUp: FaChartLine,
  "📈": FaChartLine,

  Healthcare: FaHeartPulse,
  Medical: FaHeartPulse,
  "🏥": FaHeartPulse,

  Gaming: FaGamepad,
  Gamepad: FaGamepad,
  Gamepad2: FaGamepad,
  "🎮": FaGamepad,

  Custom: FaBullseye,
  Target: FaBullseye,
  "🎯": FaBullseye,

  Beach: FaUmbrellaBeach,
  "🏝️": FaUmbrellaBeach,

  Rocket: FaRocket,
  "🚀": FaRocket,

  Shopping: FaBagShopping,
  ShoppingBag: FaBagShopping,
  "🛍️": FaBagShopping,

  Food: FaUtensils,
  UtensilsCrossed: FaUtensils,
  "🍕": FaUtensils,

  Show: FaFilm,
  "🎬": FaFilm,

  Book: FaBook,
  BookOpen: FaBook,
  "📚": FaBook,

  Utility: FaBolt,
  "⚡": FaBolt,

  Tag: FaTag,
  "🏷️": FaTag,

  Gift: FaGift,
  Music: FaMusic,
  Dumbbell: FaDumbbell,
  Wifi: FaWifi,
  Money: FaMoneyBillWave,
  "💰": FaMoneyBillWave,
};

export default function GoalIcon({ icon, name, size = 18, color, className = "" }) {
  const IconComponent = ICON_MAP[icon] || ICON_MAP[name] || FaBullseye;
  return <IconComponent size={size} color={color} className={className} />;
}

export { ICON_MAP };
