// src/components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import useStore from "../store/useStore";
import {
  FaBell,
  FaCheckDouble,
  FaCircleExclamation,
  FaTriangleExclamation,
  FaCircleCheck,
  FaCircleInfo,
} from "react-icons/fa6";
import { themeColors } from "../theme/colors";

const TYPE_ICONS = {
  error: { Icon: FaCircleExclamation, color: themeColors.danger },
  warning: { Icon: FaTriangleExclamation, color: themeColors.warning },
  success: { Icon: FaCircleCheck, color: themeColors.success },
  info: { Icon: FaCircleInfo, color: themeColors.primaryAccent },
};

export default function NotificationBell() {
  const store = useStore();
  const notifications = typeof store.getNotifications === "function" ? (store.getNotifications() || []) : [];
  const markNotificationRead = store.markNotificationRead || (() => {});
  const markAllNotificationsRead = store.markAllNotificationsRead || (() => {});

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "0.625rem",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          color: unreadCount > 0 ? themeColors.primaryAccent : "var(--color-text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.2s",
        }}
        aria-label="Open notifications"
      >
        <FaBell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              backgroundColor: themeColors.danger,
              color: "white",
              fontSize: "0.65rem",
              fontWeight: 800,
              padding: "0.1rem 0.35rem",
              minWidth: "18px",
              height: "18px",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--color-surface)",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Modern Dropdown Panel */}
      {isOpen && (
        <div
          className="card animate-in"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 0.5rem)",
            width: "340px",
            maxHeight: "420px",
            borderRadius: "1rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            zIndex: 1100,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Dropdown Header */}
          <div
            style={{
              padding: "0.85rem 1rem",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-text)" }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    backgroundColor: "rgba(62,195,213,0.1)",
                    color: themeColors.primaryAccent,
                    padding: "0.1rem 0.4rem",
                    borderRadius: "0.25rem",
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                style={{
                  background: "none",
                  border: "none",
                  color: themeColors.primaryAccent,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <FaCheckDouble size={11} /> Mark Read
              </button>
            )}
          </div>

          {/* List of Recent Alerts */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((n) => {
                const iconInfo = TYPE_ICONS[n.type] || TYPE_ICONS.info;
                const IconComponent = iconInfo.Icon;

                return (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    style={{
                      padding: "0.65rem 0.75rem",
                      borderRadius: "0.5rem",
                      marginBottom: "0.35rem",
                      backgroundColor: n.read ? "transparent" : "var(--color-hover)",
                      cursor: "pointer",
                      display: "flex",
                      gap: "0.65rem",
                      alignItems: "flex-start",
                      transition: "background-color 0.15s",
                    }}
                  >
                    <div style={{ color: iconInfo.color, marginTop: "0.15rem" }}>
                      <IconComponent size={15} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.825rem", fontWeight: 700, color: "var(--color-text)", display: "flex", justifyContent: "space-between" }}>
                        <span>{n.title}</span>
                        {!n.read && <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: themeColors.primaryAccent }} />}
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0.15rem 0 0.25rem" }}>
                        {n.description}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem" }}>
                        <span style={{ color: "var(--color-text-muted)" }}>{n.timestamp}</span>
                        {n.actionText && n.actionLink && (
                          <Link to={n.actionLink} onClick={() => setIsOpen(false)} style={{ color: themeColors.primaryAccent, fontWeight: 700, textDecoration: "none" }}>
                            {n.actionText}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.825rem" }}>
                No new notifications.
              </div>
            )}
          </div>

          {/* Footer Link */}
          <div
            style={{
              padding: "0.65rem",
              borderTop: "1px solid var(--color-border)",
              textAlign: "center",
              backgroundColor: "var(--color-hover)",
            }}
          >
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              style={{ fontSize: "0.8rem", fontWeight: 700, color: themeColors.primaryAccent, textDecoration: "none" }}
            >
              View Notification Center →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
