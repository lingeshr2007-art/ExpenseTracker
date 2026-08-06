// src/components/Toast.jsx
import React, { useEffect, useState } from "react";
import useStore from "../store/useStore";
import {
  FaCheck,
  FaHandshake,
  FaTrashCan,
  FaTriangleExclamation,
  FaXmark,
  FaWandMagicSparkles,
} from "react-icons/fa6";

/**
 * Enhanced Toast component that displays pop messages with dynamic icon badges,
 * glassmorphic design, spring pop animation, and countdown timer.
 */
export default function Toast(props) {
  const storeToast = useStore((state) => state.toast);
  const clearToast = useStore((state) => state.clearToast);

  // Use explicit props if provided, otherwise default to global Zustand store state
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
    }, 280);
  };

  const handleAction = () => {
    if (activeToast.action) {
      activeToast.action();
    }
    handleClose();
  };

  // Determine theme variant & icon based on explicit type or message text
  const msg = (activeToast.message || "").toLowerCase();
  let theme = activeToast.type || "success";
  let IconComponent = FaCheck;

  if (activeToast.type) {
    if (activeToast.type === "info" || activeToast.type === "borrow") {
      theme = "info";
      IconComponent = FaHandshake;
    } else if (activeToast.type === "danger" || activeToast.type === "delete") {
      theme = "danger";
      IconComponent = FaTrashCan;
    } else if (activeToast.type === "warning") {
      theme = "warning";
      IconComponent = FaTriangleExclamation;
    } else {
      theme = "success";
      IconComponent = FaCheck;
    }
  } else {
    // Intelligent auto-detection for finance actions
    if (
      msg.includes("borrow") ||
      msg.includes("returned") ||
      msg.includes("paid back") ||
      msg.includes("debt") ||
      msg.includes("loan")
    ) {
      theme = "info";
      IconComponent = FaHandshake;
    } else if (
      msg.includes("delete") ||
      msg.includes("removed") ||
      msg.includes("clear")
    ) {
      theme = "danger";
      IconComponent = FaTrashCan;
    } else if (
      msg.includes("warn") ||
      msg.includes("alert") ||
      msg.includes("exceed")
    ) {
      theme = "warning";
      IconComponent = FaTriangleExclamation;
    } else if (msg.includes("budget") || msg.includes("recharge")) {
      theme = "success";
      IconComponent = FaWandMagicSparkles;
    } else {
      theme = "success";
      IconComponent = FaCheck;
    }
  }

  const durationSec = ((activeToast.duration || 4000) / 1000).toFixed(1) + "s";

  return (
    <div className="toast-container">
      <div
        className={`toast toast-theme-${theme} ${isExiting ? "toast-exit" : ""}`}
        key={activeToast.id}
      >
        <div className="toast-icon-badge">
          <IconComponent />
        </div>

        <div className="toast-content">
          <span className="toast-message">{activeToast.message}</span>
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
          <FaXmark size={13} />
        </button>

        <div className="toast-progress-track">
          <div
            className="toast-progress-bar"
            style={{ animationDuration: durationSec }}
          />
        </div>
      </div>
    </div>
  );
}
