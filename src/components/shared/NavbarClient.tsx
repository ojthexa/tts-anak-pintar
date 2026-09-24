"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/providers/ThemeProvider";
import { isSoundEnabled, setSoundEnabled, playClickSound } from "@/services/game/audio";
import { useAuth } from "@/providers/AuthProvider";

/**
 * Auth-aware navigation links
 * Shows different items based on login state
 */
export function NavLinks() {
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <NavLink href="/play" icon="🎮" active={isActive("/play")}>
        Main
      </NavLink>
      <NavLink href="/soal" icon="📋" active={isActive("/soal")}>
        Soal
      </NavLink>
      <NavLink href="/leaderboard" icon="🏆" active={isActive("/leaderboard")}>
        Peringkat
      </NavLink>
      <NavLink href="/dashboard" icon="📊" active={isActive("/dashboard")}>
        Dashboard
      </NavLink>
      {isAuthenticated ? (
        <div className="flex items-center gap-0.5 sm:gap-1.5">
          <NavLink href="/profile" icon={profile?.avatarUrl ? undefined : "👤"} active={isActive("/profile")}>
            {profile?.displayName || "Profil"}
          </NavLink>
          <button
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
            className="group relative clay-sm h-9 w-9 flex items-center justify-center text-[17px] leading-none clay-text hover:scale-105 active:scale-95 transition-transform duration-200 shrink-0"
            title="Keluar"
            aria-label="Keluar"
          >
            <span aria-hidden="true">🚪</span>
            <MenuBubble label="Keluar" />
          </button>
        </div>
      ) : (
        <NavLink href="/login" icon="👤" active={isActive("/login")}>
          Masuk
        </NavLink>
      )}
    </>
  );
}

function NavLink({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon?: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  const label = typeof children === "string" ? children : "Menu";

  return (
    <Link
      href={href}
      className={`group relative clay-sm px-2.5 sm:px-4 py-2 flex items-center gap-1.5 text-sm font-semibold clay-text hover:scale-105 active:scale-95 transition-transform duration-200 whitespace-nowrap shrink-0 ${active ? "ring-2 ring-[#a8e6cf]" : ""}`}
      aria-current={active ? "page" : undefined}
      aria-label={label}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="inline-flex h-5 w-5 items-center justify-center text-[17px] leading-none"
        >
          {icon}
        </span>
      )}
      <span className="hidden sm:inline font-bold">{children}</span>
      <MenuBubble label={label} />
    </Link>
  );
}

/**
 * Small label bubble shown under an icon-only control on mobile
 * (appears on hover, keyboard focus, or tap)
 */
function MenuBubble({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[calc(100%+0.5rem)] -translate-x-1/2 scale-90 whitespace-nowrap rounded-lg clay-sm px-2 py-1 text-[11px] font-bold clay-text opacity-0 transition-all duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100 sm:hidden"
    >
      {label}
    </span>
  );
}

/**
 * Dark mode toggle button
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    if (isSoundEnabled()) playClickSound();
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      className="clay-sm h-9 w-9 flex items-center justify-center text-[17px] leading-none clay-text hover:scale-105 active:scale-95 transition-transform duration-200 shrink-0"
      title={theme === "light" ? "Mode Gelap" : "Mode Terang"}
      aria-label={theme === "light" ? "Aktifkan mode gelap" : "Aktifkan mode terang"}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}

/**
 * Sound toggle button
 */
export function SoundToggle() {
  const soundEnabled = isSoundEnabled();

  const handleToggle = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    if (newState) playClickSound();
  };

  return (
    <button
      onClick={handleToggle}
      className="clay-sm h-9 w-9 flex items-center justify-center text-[17px] leading-none clay-text hover:scale-105 active:scale-95 transition-transform duration-200 shrink-0"
      title={soundEnabled ? "Matikan Suara" : "Hidupkan Suara"}
      aria-label={soundEnabled ? "Matikan suara" : "Hidupkan suara"}
    >
      {soundEnabled ? "🔊" : "🔇"}
    </button>
  );
}

/**
 * Large font toggle button for accessibility
 */
export function FontSizeToggle() {
  const [largeFont, setLargeFont] = useState(false);

  const handleToggle = () => {
    const newState = !largeFont;
    setLargeFont(newState);
    document.documentElement.classList.toggle("font-large", newState);
    localStorage.setItem("large_font", newState ? "1" : "0");
    if (isSoundEnabled()) playClickSound();
  };

  // Initialize on mount
  useEffect(() => {
    const saved = localStorage.getItem("large_font");
    if (saved === "1") {
      setLargeFont(true);
      document.documentElement.classList.add("font-large");
    }
  }, []);

  return (
    <button
      onClick={handleToggle}
      className={`clay-sm h-9 w-9 flex items-center justify-center text-[17px] leading-none clay-text hover:scale-105 active:scale-95 transition-transform duration-200 shrink-0 ${largeFont ? "ring-2 ring-[#a8e6cf]" : ""}`}
      title={largeFont ? "Font Normal" : "Font Besar"}
      aria-label={largeFont ? "Kembalikan ukuran font normal" : "Perbesar ukuran font"}
    >
      {largeFont ? "🔠" : "🔡"}
    </button>
  );
}
