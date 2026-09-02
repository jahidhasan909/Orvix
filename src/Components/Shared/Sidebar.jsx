"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars, ChevronDown, ChevronRight, Xmark } from "@gravity-ui/icons";
import { LogOut } from "lucide-react";
import { Button, Drawer } from "@heroui/react";
import { findActiveHref, getVisibleNavigation } from "@/lib/navigation";
import { useAccess } from "@/context/AccessContext";
import { authClient } from "@/lib/auth-client";
import { NAV_ICONS } from "./nav-icons";

function isGroupOpen(item, activeHref, expandedIds) {
  if (expandedIds[item.id] !== undefined) return expandedIds[item.id];
  return (item.children ?? []).some((child) => child.href === activeHref);
}

function NavLink({ item, active, collapsed, onNavigate }) {
  const Icon = NAV_ICONS[item.icon] ?? NAV_ICONS.Folder;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-r-lg px-3 py-2 text-sm transition-colors border-l-2 ${
        active
          ? "border-[#2075fe] bg-[#2075fe]/10 text-[#2075fe]"
          : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      } ${collapsed ? "justify-center px-0 py-1.5" : ""}`}
    >
      <Icon className={`size-[18px] shrink-0 ${active ? "text-[#2075fe]" : "text-slate-400 group-hover:text-slate-600"}`} />
      {!collapsed && <span className="truncate font-medium">{item.label}</span>}
    </Link>
  );
}

function NavGroup({ item, activeHref, collapsed, expandedIds, onToggle, onNavigate }) {
  const Icon = NAV_ICONS[item.icon] ?? NAV_ICONS.Folder;
  const open = isGroupOpen(item, activeHref, expandedIds);
  const childActive = (item.children ?? []).some((child) => child.href === activeHref);

  if (collapsed) {
    const first = item.children?.[0];
    return (
      <Link
        href={first?.href ?? "#"}
        title={item.label}
        onClick={onNavigate}
        className={`flex items-center justify-center rounded-r-lg py-1.5 border-l-2 ${
          childActive ? "border-[#2075fe] bg-[#2075fe]/10 text-[#2075fe]" : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <Icon className="size-[18px]" />
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(item.id, !open)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          childActive ? "text-[#2075fe]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <Icon className={`size-[18px] shrink-0 ${childActive ? "text-[#2075fe]" : "text-slate-400"}`} />
        <span className="flex-1 truncate text-left font-medium">{item.label}</span>
        {open ? <ChevronDown className="size-3.5 text-slate-500" /> : <ChevronRight className="size-3.5 text-slate-500" />}
      </button>
      {open && (
        <div className="mt-0.5 ml-4 space-y-0.5 border-l border-dashed border-slate-300 pl-3">
          {item.children.map((child) => (
            <NavLink
              key={child.id}
              item={child}
              active={child.href === activeHref}
              collapsed={false}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarBody({ collapsed, onNavigate, onToggleCollapse }) {
  const pathname = usePathname();
  const { persona } = useAccess();
  const [expandedIds, setExpandedIds] = useState({});
  const sections = useMemo(() => (persona ? getVisibleNavigation(persona) : []), [persona]);
  const activeHref = findActiveHref(pathname, sections);

  return (
    <div className="flex h-full flex-col border-r border-dashed border-slate-300 bg-white text-slate-700">
      <div className={`relative flex h-16 items-center border-b border-dashed border-slate-300 ${collapsed ? "justify-center px-1" : "gap-3 px-4"}`}>
        <Image
          src="/orvix-logo.png"
          alt="ORVIX"
          width={collapsed ? 28 : 40}
          height={collapsed ? 28 : 40}
          className="shrink-0"
          priority
        />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold tracking-wide text-slate-900">ORVIX</p>
            <p className="truncate text-[11px] text-slate-500">NGO Operations</p>
          </div>
        )}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 lg:inline-flex ${
              collapsed ? "absolute top-1 right-0.5" : ""
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight className={collapsed ? "size-3.5" : "size-4 rotate-180"} />
          </button>
        )}
      </div>

      <nav className={`sidebar-scroll flex-1 overflow-y-auto ${collapsed ? "space-y-1 px-1 py-2" : "space-y-5 px-3 py-4"}`}>
        {sections.map((section) => (
          <div key={section.id}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                {section.label}
              </p>
            )}
            <div className={collapsed ? "space-y-1" : "space-y-0.5"}>
              {section.items.map((item) =>
                item.children ? (
                  <NavGroup
                    key={item.id}
                    item={item}
                    activeHref={activeHref}
                    collapsed={collapsed}
                    expandedIds={expandedIds}
                    onToggle={(id, next) => setExpandedIds((current) => ({ ...current, [id]: next }))}
                    onNavigate={onNavigate}
                  />
                ) : (
                  <NavLink
                    key={item.id}
                    item={item}
                    active={item.href === activeHref}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </nav>

      <div className={`border-t border-dashed border-slate-300 p-3 ${collapsed ? "flex flex-col items-center gap-1" : "space-y-1"}`}>
        <div className={`flex items-center gap-3 p-2 ${collapsed ? "justify-center" : ""}`}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2075fe]/10 text-xs font-semibold text-[#2075fe]">
            {persona?.initials}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-900">{persona?.name}</span>
              <span className="block truncate text-[11px] text-slate-500">{persona?.email}</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              await authClient.signOut();
            } finally {
              window.location.replace("/login");
            }
          }}
          title="Log out"
          className={`flex w-full items-center gap-3 rounded-xl p-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="size-[18px] shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </div>
  );
}

export function DesktopSidebar({ collapsed, onToggleCollapse }) {
  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col transition-[width] duration-200 lg:flex ${
        collapsed ? "w-[64px]" : "w-[280px]"
      }`}
    >
      <SidebarBody collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
    </aside>
  );
}

export function MobileNav() {
  return (
    <div className="lg:hidden">
      <Drawer>
        <Button variant="secondary" className="border-slate-200 bg-white text-slate-700">
          <Bars className="size-4" />
          Menu
        </Button>
        <Drawer.Backdrop>
          <Drawer.Content placement="left" className="w-[min(280px,85vw)] p-0">
            <Drawer.Dialog className="h-full p-0">
              <Drawer.CloseTrigger className="absolute top-3 right-3 z-10 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800">
                <Xmark className="size-4" />
              </Drawer.CloseTrigger>
              <SidebarBody collapsed={false} />
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}

