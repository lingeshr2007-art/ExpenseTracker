// src/components/NotificationCenter.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import useStore from "../store/useStore";
import {
  FaBell,
  FaChevronDown,
  FaChevronUp,
  FaCheckDouble,
  FaTrash,
  FaMagnifyingGlass,
  FaCircleExclamation,
  FaTriangleExclamation,
  FaCircleCheck,
  FaCircleInfo,
  FaClock,
} from "react-icons/fa6";
import { themeColors } from "../theme/colors";

const TYPE_STYLES = {
  error: {
    bg: "var(--color-danger-light)",
    borderLeft: `4px solid ${themeColors.danger}`,
    iconColor: themeColors.danger,
    Icon: FaCircleExclamation,
    badgeBg: "rgba(255, 84, 96, 0.15)",
    badgeColor: themeColors.danger,
  },
  warning: {
    bg: "var(--color-warning-light)",
    borderLeft: `4px solid ${themeColors.warning}`,
    iconColor: themeColors.warning,
    Icon: FaTriangleExclamation,
    badgeBg: "rgba(245, 158, 11, 0.15)",
    badgeColor: themeColors.warning,
  },
  success: {
    bg: "rgba(65, 220, 101, 0.08)",
    borderLeft: `4px solid ${themeColors.success}`,
    iconColor: themeColors.success,
    Icon: FaCircleCheck,
    badgeBg: "rgba(65, 220, 101, 0.15)",
    badgeColor: themeColors.success,
  },
  info: {
    bg: "rgba(62, 195, 213, 0.08)",
    borderLeft: `4px solid ${themeColors.primaryAccent}`,
    iconColor: themeColors.primaryAccent,
    Icon: FaCircleInfo,
    badgeBg: "rgba(62, 195, 213, 0.15)",
    badgeColor: themeColors.primaryAccent,
  },
};

export default function NotificationCenter() {
  const store = useStore();
  const notifications = typeof store.getNotifications === "function" ? (store.getNotifications() || []) : [];
  const markNotificationRead = store.markNotificationRead || (() => {});
  const markAllNotificationsRead = store.markAllNotificationsRead || (() => {});
  const deleteNotification = store.deleteNotification || (() => {});

  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filtering
  const filteredNotifs = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    return n.type.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div
      className="card animate-in"
      style={{
        borderRadius: "1.125rem",
        border: "1px solid var(--color-border)",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Compact Header Summary Card */}
      <div
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
          backgroundColor: expanded ? "var(--color-hover)" : "transparent",
          transition: "background-color 0.2s",
        }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "0.625rem",
              backgroundColor: unreadCount > 0 ? "rgba(62, 195, 213, 0.1)" : "var(--color-hover)",
              color: unreadCount > 0 ? themeColors.primaryAccent : "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <FaBell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-3px",
                  right: "-3px",
                  backgroundColor: themeColors.danger,
                  color: "white",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--color-surface)",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
              Notification Center
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>
              {notifications.length > 0
                ? `You have ${notifications.length} financial alert${notifications.length > 1 ? "s" : ""} (${unreadCount} unread)`
                : "No active financial alerts"}
            </p>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem" }}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((p) => !p);
          }}
        >
          <span>{expanded ? "Collapse" : "View Details"}</span>
          {expanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </button>
      </div>

      {/* Expanded Notification Panel */}
      {expanded && (
        <div
          style={{
            padding: "1rem 1.25rem 1.25rem",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Controls: Search, Filters & Actions */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
            {/* Search Input */}
            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
              <FaMagnifyingGlass
                size={13}
                style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }}
              />
              <input
                type="text"
                placeholder="Search alerts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.4rem 0.75rem 0.4rem 2.2rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.8rem",
                  outline: "none",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: "flex", gap: "0.35rem", overflowX: "auto" }}>
              {["All", "Unread", "Warning", "Error", "Success", "Info"].map((tab) => {
                const active = filter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    style={{
                      padding: "0.3rem 0.65rem",
                      borderRadius: "0.4rem",
                      border: active ? `1px solid ${themeColors.primaryAccent}` : "1px solid var(--color-border)",
                      backgroundColor: active ? "rgba(62, 195, 213, 0.1)" : "transparent",
                      color: active ? themeColors.primaryAccent : "var(--color-text-muted)",
                      fontSize: "0.75rem",
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={markAllNotificationsRead}
                style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
              >
                <FaCheckDouble size={12} color={themeColors.primaryAccent} /> Mark All as Read
              </button>
            )}
          </div>

          {/* List of Notifications */}
          {filteredNotifs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {filteredNotifs.map((item) => {
                const style = TYPE_STYLES[item.type] || TYPE_STYLES.info;
                const IconComponent = style.Icon;

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "0.85rem 1rem",
                      borderRadius: "0.75rem",
                      backgroundColor: item.read ? "var(--color-surface)" : style.bg,
                      border: item.read ? "1px solid var(--color-border)" : "none",
                      borderLeft: style.borderLeft,
                      display: "flex",
                      gap: "0.85rem",
                      alignItems: "flex-start",
                      position: "relative",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ color: style.iconColor, marginTop: "0.2rem" }}>
                      <IconComponent size={18} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text)" }}>
                            {item.title}
                          </span>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "0.1rem 0.4rem",
                              borderRadius: "0.25rem",
                              backgroundColor: style.badgeBg,
                              color: style.badgeColor,
                            }}
                          >
                            {item.type}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <FaClock size={11} /> {item.timestamp}
                          </span>
                          <button
                            onClick={() => deleteNotification(item.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--color-text-muted)",
                              cursor: "pointer",
                              padding: "0.2rem",
                              display: "flex",
                              alignItems: "center",
                            }}
                            title="Dismiss Notification"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>

                      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", margin: "0.35rem 0 0.5rem", lineHeight: 1.4 }}>
                        {item.description}
                      </p>

                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {!item.read && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => markNotificationRead(item.id)}
                            style={{ fontSize: "0.725rem", padding: "0.2rem 0.5rem" }}
                          >
                            Mark Read
                          </button>
                        )}
                        {item.actionText && item.actionLink && (
                          <Link
                            to={item.actionLink}
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: themeColors.primaryAccent,
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.2rem",
                            }}
                          >
                            {item.actionText} →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--color-text-muted)",
                fontSize: "0.85rem",
              }}
            >
              No matching financial notifications found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
