"use client"
import { Bars, Bell, Envelope, Gear, House, Magnifier, Person } from "@gravity-ui/icons";
import { Button, Drawer } from "@heroui/react";

const navItems = [
  { icon: House, label: "Home" },
  { icon: Magnifier, label: "Search" },
  { icon: Bell, label: "Notifications" },
  { icon: Envelope, label: "Messages" },
  { icon: Person, label: "Profile" },
  { icon: Gear, label: "Settings" },
];


export function MobileNav() {
  return (
    <div className="block md:hidden">
      <Drawer>
        <Button variant="secondary">
          <Bars />
          Menu
        </Button>
        <Drawer.Backdrop>
          <Drawer.Content placement="left">
            <Drawer.Dialog>
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <Drawer.Heading>Navigation</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body>
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.label}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-default"
                        type="button"
                      >
                        <IconComponent className="size-5 text-muted" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-default-200 bg-background p-4 md:flex">
      <div className="mb-6 px-3">
        <h2 className="text-lg font-semibold text-foreground">Navigation</h2>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.label}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-default"
              type="button"
            >
              <IconComponent className="size-5 text-muted" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}


export default function Navigation() {
  return (
    <>
  
      <MobileNav />

   
      <DesktopSidebar />
    </>
  );
}