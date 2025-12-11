
import React, { useEffect, useRef, useState } from 'react';
import { AppView } from '../types';
import { useStore } from '../store/useStore';
import { LayoutDashboard, Truck, Map, PieChart, Zap, FileCheck, Radar, Smartphone, Sun, Moon, User, LogOut } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { currentView, setView } = useStore();
  const { theme, toggleTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const navRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLButtonElement | null)[]>([]);
  const contactRef = useRef<HTMLDivElement>(null);
  const topLineRef = useRef<HTMLSpanElement>(null);
  const bottomLineRef = useRef<HTMLSpanElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const iconTL = useRef<gsap.core.Timeline | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showBurger, setShowBurger] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Formatear rol para mostrar
  const formatRole = (role: string | undefined): string => {
    if (!role) return 'Usuario';
    const roleMap: Record<string, string> = {
      'admin': 'Administrador',
      'fleet_manager': 'Gerente de Flota',
      'driver': 'Conductor',
    };
    return roleMap[role] || 'Usuario';
  };

  // Obtener iniciales del nombre
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleLogout = async () => {
    await signOut();
    setView(AppView.HOME);
    setShowUserMenu(false);
  };

  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: AppView.FLEET, label: 'Equipo', icon: <Truck className="w-5 h-5" /> },
    { id: AppView.ROUTES, label: 'Rutas', icon: <Map className="w-5 h-5" /> },
    { id: AppView.ROUTE_BUILDER, label: 'Constructor', icon: <Zap className="w-5 h-5" /> },
    { id: AppView.FINANCIALS, label: 'Finanzas', icon: <PieChart className="w-5 h-5" /> },
    { id: AppView.COMPLIANCE, label: 'Cumplimiento', icon: <FileCheck className="w-5 h-5" /> },
    { id: AppView.DRIVER_MOBILE, label: 'App Conductor', icon: <Smartphone className="w-5 h-5" /> },
  ];

  const toggleMenu = () => {
    if (!tl.current || !iconTL.current) return;

    if (isOpen) {
      tl.current.reverse();
      iconTL.current.reverse();
    } else {
      tl.current.play();
      iconTL.current.play();
    }
    setIsOpen(!isOpen);
  };

  const handleNavClick = (view: AppView) => {
    setView(view);
    if (tl.current && iconTL.current) {
      tl.current.reverse();
      iconTL.current.reverse();
      setIsOpen(false);
    }
  };

  // GSAP Animations
  useGSAP(() => {
    if (!navRef.current) return;

    // Initial state
    gsap.set(navRef.current, { xPercent: 100 });
    gsap.set([...linksRef.current, contactRef.current].filter(Boolean), {
      autoAlpha: 0,
      x: -20,
    });

    // Menu slide-in timeline
    tl.current = gsap
      .timeline({ paused: true })
      .to(navRef.current, {
        xPercent: 0,
        duration: 0.8,
        ease: 'power3.inOut',
      })
      .to(
        [...linksRef.current].filter(Boolean),
        {
          autoAlpha: 1,
          x: 0,
          stagger: 0.08,
          duration: 0.4,
          ease: 'power2.out',
        },
        '<+0.2'
      )
      .to(
        contactRef.current,
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.4,
          ease: 'power2.out',
        },
        '<+0.3'
      );

    // Hamburger icon animation
    iconTL.current = gsap
      .timeline({ paused: true })
      .to(topLineRef.current, {
        rotate: 45,
        y: 6,
        duration: 0.3,
        ease: 'power2.inOut',
      })
      .to(
        bottomLineRef.current,
        {
          rotate: -45,
          y: -6,
          duration: 0.3,
          ease: 'power2.inOut',
        },
        '<'
      );
  }, []);

  // Scroll behavior for hamburger button
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowBurger(currentScrollY < lastScrollY || currentScrollY < 10);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    if (!showUserMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <>
      {/* Main Navbar - Desktop */}
      <nav className="fixed top-0 left-0 w-full z-40 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1"
              onClick={() => setView(AppView.HOME)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setView(AppView.HOME);
                }
              }}
              aria-label="Ir al inicio"
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-brand-500/20 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-brand-500 to-brand-900 rounded-xl flex items-center justify-center border border-white/10">
                  <Zap className="text-white w-5 h-5" aria-hidden="true" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tighter text-white leading-none">
                  FLEET<span className="text-brand-500">TECH</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">OS Logístico</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${currentView === item.id
                      ? 'bg-white/10 text-white border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                      : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle - Desktop */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10"
              aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* User Profile - Desktop */}
            <div className="hidden md:block relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-900 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white/20">
                  {getInitials(profile?.full_name)}
                </div>
                
                {/* User Info */}
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-200">
                    {profile?.full_name || 'Usuario'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatRole(profile?.role)}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-dark-900 border border-white/10 rounded-lg shadow-xl z-50">
                  <div className="p-3 border-b border-white/5">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {profile?.email}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatRole(profile?.role)}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        ref={navRef}
        className="fixed z-50 flex flex-col justify-between w-full h-full px-8 bg-gradient-to-br from-dark-950 via-dark-900 to-black text-white py-20 gap-y-10 md:w-1/2 md:left-1/2 border-l border-white/10"
      >
        {/* Navigation Items */}
        <div className="flex flex-col text-3xl gap-y-3 md:text-4xl lg:text-5xl mt-16">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => (linksRef.current[index] = el)}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-4 transition-all duration-300 cursor-pointer uppercase tracking-tight font-bold text-left ${currentView === item.id
                ? 'text-brand-400 translate-x-2'
                : 'text-white/60 hover:text-white hover:translate-x-2'
                }`}
            >
              <div className={currentView === item.id ? 'text-brand-400' : 'text-white/40'}>
                {item.icon}
              </div>
              {item.label}
              {currentView === item.id && (
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse ml-2"></div>
              )}
            </button>
          ))}
        </div>

        {/* Contact Info */}
        <div ref={contactRef} className="flex flex-col gap-6 text-sm">
          {/* User Profile - Mobile */}
          <div className="font-light">
            <p className="tracking-wider text-white/40 uppercase text-xs mb-2">Usuario</p>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/5">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-900 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white/20">
                {getInitials(profile?.full_name)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {profile?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-slate-400">
                  {formatRole(profile?.role)}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all duration-300 text-red-400"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>

          {/* Theme Toggle - Mobile */}
          <div className="font-light">
            <p className="tracking-wider text-white/40 uppercase text-xs mb-2">Apariencia</p>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 w-fit"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-slate-300">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Modo Oscuro</span>
                </>
              )}
            </button>
          </div>

          <div className="font-light">
            <p className="tracking-wider text-white/40 uppercase text-xs mb-2">Sistema</p>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/5 w-fit">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-mono text-slate-300">ONLINE</span>
            </div>
          </div>

          <div className="font-light">
            <p className="tracking-wider text-white/40 uppercase text-xs mb-2">FleetTech</p>
            <p className="text-lg tracking-wide text-white/80">OS Logístico Inteligente</p>
          </div>
        </div>
      </div>

      {/* Animated Hamburger Button */}
      <div
        className="fixed z-50 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 bg-gradient-to-br from-brand-500 to-brand-900 rounded-full cursor-pointer w-14 h-14 md:w-16 md:h-16 top-6 right-6 md:hidden border border-white/20 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
        onClick={toggleMenu}
        role="button"
        tabIndex={0}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
          }
        }}
        style={
          showBurger
            ? { clipPath: 'circle(50% at 50% 50%)', opacity: 1 }
            : { clipPath: 'circle(0% at 50% 50%)', opacity: 0 }
        }
      >
        <span
          ref={topLineRef}
          className="block w-7 h-0.5 bg-white rounded-full origin-center"
        ></span>
        <span
          ref={bottomLineRef}
          className="block w-7 h-0.5 bg-white rounded-full origin-center"
        ></span>
      </div>
    </>
  );
};

export default Navbar;
