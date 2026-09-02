"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars, ChevronDown, ChevronRight, Xmark } from "@gravity-ui/icons";
import { Button, Drawer } from "@heroui/react";
import { findActiveHref, getVisibleNavigation } from "@/lib/navigation";
import { useAccess } from "@/context/AccessContext";
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
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-violet-500/15 text-violet-200"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      } ${collapsed ? "justify-center px-0" : ""}`}
    >
      <Icon className={`size-[18px] shrink-0 ${active ? "text-violet-300" : "text-slate-400 group-hover:text-slate-200"}`} />
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
        className={`flex items-center justify-center rounded-lg py-2 ${
          childActive ? "bg-violet-500/15 text-violet-200" : "text-slate-300 hover:bg-white/5 hover:text-white"
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
          childActive ? "text-violet-200" : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icon className={`size-[18px] shrink-0 ${childActive ? "text-violet-300" : "text-slate-400"}`} />
        <span className="flex-1 truncate text-left font-medium">{item.label}</span>
        {open ? <ChevronDown className="size-3.5 text-slate-500" /> : <ChevronRight className="size-3.5 text-slate-500" />}
      </button>
      {open && (
        <div className="mt-0.5 ml-4 space-y-0.5 border-l border-white/10 pl-3">
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
    <div className="flex h-full flex-col bg-slate-950 text-slate-200">
      <div className={`flex items-center gap-3 border-b border-white/5 px-4 py-4 ${collapsed ? "flex-col px-2" : ""}`}>
        <Image
          src="/orvix-logo.png"
          alt="ORVIX"
          width={72}
          height={50}
          className={`shrink-0 object-contain ${collapsed ? "h-8 w-auto" : "h-9 w-auto"}`}
          priority
        />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-wide text-white">ORVIX</p>
            <p className="truncate text-[11px] text-slate-400">NGO Operations</p>
          </div>
        )}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight className={`size-4 ${collapsed ? "" : "rotate-180"}`} />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="border-b border-white/5 px-4 py-3">
          <p className="truncate text-xs font-medium text-slate-200">{persona.orgName}</p>
          <p className="truncate text-[11px] text-slate-500">{persona.orgHint}</p>
        </div>
      )}

      <nav className="sidebar-scroll flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.id}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
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

      <div className={`border-t border-white/5 p-3 ${collapsed ? "flex justify-center" : ""}`}>
        <Link
          href="/profile"
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5 ${collapsed ? "justify-center" : ""}`}
          title={persona.name}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-200">
            {persona.initials}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-white">{persona.name}</span>
              <span className="block truncate text-[11px] text-slate-400">
                {persona.designationLabel ?? persona.roleLabel}
              </span>
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}

export function DesktopSidebar({ collapsed, onToggleCollapse }) {
  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-800 transition-[width] duration-200 lg:flex ${
        collapsed ? "w-[72px]" : "w-[280px]"
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
              <Drawer.CloseTrigger className="absolute top-3 right-3 z-10 rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
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

