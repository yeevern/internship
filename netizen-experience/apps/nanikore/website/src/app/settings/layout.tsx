"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const childPath = useSelectedLayoutSegment("children");

  const [sideBarItems, setSideBarItems] = useState([
    { href: "/settings/account", label: "Account & Security", current: false },
    { href: "/settings/demographic", label: "Demographics Profile", current: false },
    { href: "/settings/payment", label: "Payment settings", current: false },
    { href: "/settings/notification", label: "Notification settings", current: false },
    { href: "/settings/referral", label: "Referral", current: false },
  ]);

  useEffect(() => {
    setSideBarItems((sideBarItems) =>
      sideBarItems.map((item) => ({
        ...item,
        current: childPath ? item.href.includes(childPath) : false,
      })),
    );
  }, [childPath]);

  return (
    <main className="container mt-8">
      <div className="flex gap-x-24">
        <div className="flex flex-col">
          <nav className="flex flex-col">
            <ul className="flex flex-1 flex-col">
              <li>
                <ul className="space-y-6">
                  {sideBarItems.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className={
                          item.current ? "text-base font-bold" : "text-base text-neutral-700 hover:text-neutral-900"
                        }
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
        <div className="grow">{children}</div>
      </div>
    </main>
  );
}
