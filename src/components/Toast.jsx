// src/components/Toast.jsx
import React, { useEffect, useState } from "react";
import useStore from "../store/useStore";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Sparkles,
  Trash2,
  X,
  Handshake,
} from "lucide-react";

/**
 * Remove raw emoji characters from message string to ensure
 * popup notifications display clean text with modern SVG icons only.
 */
const stripEmojis = (text) => {
  if (!text) return "";
  return text
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
};

export default function Toast(props) {
  const storeToast = useStore((state) => state.toast);
  const clearToast = useStore((state) => state.clearToast);

  const activeToast = props.message
    ? {
        message: props.message,
        action: props.onAction,
        duration: props.duration || 4000,
        type: props.type,
        id: "prop-toast",
      }
    : storeToast;

  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsExiting(false);
  }, [activeToast?.id]);

  if (!activeToast) return null;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (props.onClose) props.onClose();
      else clearToast();
      setIsExiting(false);
    }, 250);
  };

  const handleAction = () => {
    if (activeToast.action) {
      activeToast.action();
    }
    handleClose();
  };

  const rawMsg = activeToast.message || "";
  const cleanMsg = stripEmojis(rawMsg);
  const lowerMsg = rawMsg.toLowerCase();

  let theme = activeToast.type || "success";
  let IconComponent = CheckCircle2;
  let iconColor = "#10B981"; // Emerald
  let badgeBg = "rgba(16, 185, 129, 0.12)";

  if (activeToast.type === "info" || activeToast.type === "borrow") {
    theme = "info";
    IconComponent = Info;
    iconColor = "#3B82F6"; // Blue
    badgeBg = "rgba(59, 130, 246, 0.12)";
  } else if (activeToast.type === "danger" || activeToast.type === "delete" || activeToast.type === "error") {
    theme = "danger";
    IconComponent = AlertCircle;
    iconColor = "#EF4444"; // Red
    badgeBg = "rgba(239, 68, 68, 0.12)";
  } else if (activeToast.type === "warning") {
    theme = "warning";
    IconComponent = AlertTriangle;
    iconColor = "#F59E0B"; // Amber
    badgeBg = "rgba(245, 158, 11, 0.12)";
  } else {
    // Intelligent auto-detection based on message text
    if (lowerMsg.includes("borrow") || lowerMsg.includes("returned") || lowerMsg.includes("paid back") || lowerMsg.includes("debt")) {
      theme = "info";
      IconComponent = Handshake;
      iconColor = "#6366F1";
      badgeBg = "rgba(99, 102, 241, 0.12)";
    } else if (lowerMsg.includes("delete") || lowerMsg.includes("removed") || lowerMsg.includes("clear") || lowerMsg.includes("fail") || lowerMsg.includes("error") || lowerMsg.includes("invalid")) {
      theme = "danger";
      IconComponent = lowerMsg.includes("delete") || lowerMsg.includes("removed") ? Trash2 : AlertCircle;
      iconColor = "#EF4444";
      badgeBg = "rgba(239, 68, 68, 0.12)";
    } else if (lowerMsg.includes("warn") || lowerMsg.includes("alert") || lowerMsg.includes("exceed")) {
      theme = "warning";
      IconComponent = AlertTriangle;
      iconColor = "#F59E0B";
      badgeBg = "rgba(245, 158, 11, 0.12)";
    } else if (lowerMsg.includes("ai") || lowerMsg.includes("smart") || lowerMsg.includes("insight") || lowerMsg.includes("updated") || lowerMsg.includes("welcome")) {
      theme = "success";
      IconComponent = Sparkles;
      iconColor = "#4F5DED";
      badgeBg = "rgba(79, 93, 237, 0.12)";
    } else {
      theme = "success";
      IconComponent = CheckCircle2;
      iconColor = "#10B981";
      badgeBg = "rgba(16, 185, 129, 0.12)";
    }
  }

  const durationSec = ((activeToast.duration || 4000) / 1000).toFixed(1) + "s";

  return (
    <div className="toast-container">
      <div
        className={`toast toast-theme-${theme} ${isExiting ? "toast-exit" : ""}`}
        key={activeToast.id}
      >
        <div className="toast-icon-badge" style={{ backgroundColor: badgeBg, color: iconColor }}>
          <IconComponent size={20} strokeWidth={2.2} />
        </div>

        <div className="toast-content">
          <span className="toast-message">{cleanMsg || rawMsg}</span>
        </div>

        {activeToast.action && (
          <button className="toast-action-btn" onClick={handleAction}>
            Undo
          </button>
        )}

        <button
          className="toast-close-btn"
          onClick={handleClose}
          aria-label="Close notification"
        >
          <X size={15} strokeWidth={2.2} />
        </button>

        <div className="toast-progress-track">
          <div
            className="toast-progress-bar"
            style={{ animationDuration: durationSec, backgroundColor: iconColor }}
          />
        </div>
      </div>
    </div>
  );
}
