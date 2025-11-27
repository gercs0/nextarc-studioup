import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, Bell, Edit3, Settings, Crown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { Logo } from '../ui/Logo';
import { cn } from '../../lib/utils';

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            setTimeout(() => markAllAsRead(), 1000);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <Button variant="ghost" size="icon" onClick={handleToggle} className="relative hover:bg-white/10 rounded-full">
                <Bell className="h-5 w-5 text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-[#FF4D00] ring-2 ring-[#050810] shadow-[0_0_8px_#FF4D00]" />
                )}
            </Button>
            {isOpen && (
                 <div className="absolute right-0 mt-3 w-80 bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 font-syne font-bold text-white border-b border-white/5">Notifications</div>
                    <div className="py-1 max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <Link to={n.link} key={n.id} className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors" onClick={() => setIsOpen(false)}>
                                    <p className={!n.read ? 'font-bold text-white' : ''}>{n.message}</p>
                                    <p className="text-[10px] uppercase tracking-wide text-gray-500 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                                </Link>
                            ))
                        ) : (
                            <p className="px-4 py-6 text-sm text-gray-500 text-center italic">No new notifications.</p>
                        )}
                    </div>
                 </div>
            )}
        </div>
    );
};


const UserMenu: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!currentUser) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 hover:bg-white/5 rounded-full pl-2 pr-4 border border-transparent hover:border-white/10 transition-all">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center border border-white/10">
                     <UserIcon className="h-4 w-4 text-white" />
                </div>
                <span className="font-syne font-bold text-sm text-gray-200 hidden sm:block">
                    {currentUser.name.split(' ')[0]}
                </span>
            </Button>
            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                         <p className="text-white font-bold font-syne truncate">{currentUser.name}</p>
                         <p className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{currentUser.role}</p>
                    </div>
                    <div className="py-2">
                        <Link to="/dashboard" className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors group" onClick={() => setIsOpen(false)}>
                            <LayoutDashboard className="mr-3 h-4 w-4 text-gray-500 group-hover:text-[#FF4D00]" /> Dashboard
                        </Link>
                        {currentUser.role === 'creator' && (
                           <>
                           <Link to={`/creator/${currentUser.id}`} className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors group" onClick={() => setIsOpen(false)}>
                             <UserIcon className="mr-3 h-4 w-4 text-gray-500 group-hover:text-[#FF4D00]" /> Public Profile
                           </Link>
                           <Link to="/edit-profile" className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors group" onClick={() => setIsOpen(false)}>
                             <Edit3 className="mr-3 h-4 w-4 text-gray-500 group-hover:text-[#FF4D00]" /> Edit Profile
                           </Link>
                           <Link to="/pro" className="flex items-center px-4 py-3 text-sm text-yellow-400 hover:bg-white/5 transition-colors" onClick={() => setIsOpen(false)}>
                             <Crown className="mr-3 h-4 w-4" /> Go Pro
                           </Link>
                           </>
                        )}
                        <Link to="/settings" className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors group" onClick={() => setIsOpen(false)}>
                           <Settings className="mr-3 h-4 w-4 text-gray-500 group-hover:text-[#FF4D00]" /> Settings
                        </Link>
                        <div className="border-t border-white/5 my-1" />
                        <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                            <LogOut className="mr-3 h-4 w-4" /> Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const Header: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { currentUser, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'Requests', path: '/browse' },
        { name: 'Creators', path: '/creators' },
        { name: 'Leaderboards', path: '/leaderboards' },
        ...(currentUser && currentUser.role === 'athlete' ? [
            { name: 'Hire', path: '/post-project' },
        ] : [])
    ];

    return (
        <header 
            className={cn(
                "sticky top-0 z-40 transition-all duration-300 border-b",
                scrolled ? "bg-[#050810]/80 backdrop-blur-md border-white/5 py-2" : "bg-transparent border-transparent py-4"
            )}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Logo />
                    </div>
                    
                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center justify-center flex-1 mx-10">
                        <div className="flex items-center space-x-1 bg-white/5 backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/5">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        cn(
                                            "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 font-syne",
                                            isActive 
                                                ? "bg-[#FF4D00] text-white shadow-lg shadow-orange-500/20" 
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                        )
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <div className="hidden md:block">
                        {currentUser ? (
                           <div className="flex items-center gap-4">
                               <NotificationBell />
                               <UserMenu />
                           </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-bold uppercase tracking-wide text-gray-400 hover:text-white transition-colors">
                                    Log In
                                </Link>
                                <Button asChild variant="default" size="sm" className="rounded-full px-6">
                                    <Link to="/signup">Sign Up</Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-[#050810] border-b border-white/10 fixed w-full z-50 shadow-2xl">
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        {navItems.map(item => (
                             <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    cn(
                                        "block px-4 py-3 rounded-lg text-base font-bold uppercase tracking-wide transition-colors font-syne",
                                        isActive ? 'bg-[#FF4D00] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    )
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </div>
                    <div className="pt-4 pb-6 border-t border-white/10 px-4 bg-white/[0.02]">
                        <div className="space-y-4">
                           {currentUser ? (
                                <>
                                 <div className="flex items-center gap-3 mb-4">
                                    <div className="font-syne text-xl font-bold text-white">
                                        {currentUser.name}
                                    </div>
                                    <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-[#FF4D00] uppercase tracking-wider border border-white/10">{currentUser.role}</div>
                                 </div>
                                 <Link to="/dashboard" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/5" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                 {currentUser.role === 'creator' && (
                                     <>
                                     <Link to={`/creator/${currentUser.id}`} className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/5" onClick={() => setIsOpen(false)}>Public Profile</Link>
                                     <Link to="/pro" className="block px-4 py-3 rounded-lg text-base font-medium text-yellow-400 hover:bg-white/5" onClick={() => setIsOpen(false)}>Go Pro</Link>
                                     </>
                                 )}
                                 <Link to="/settings" className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/5" onClick={() => setIsOpen(false)}>Settings</Link>
                                 <button className="w-full text-left block px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-900/10" onClick={() => { logout(); setIsOpen(false); }}>Log Out</button>
                                </>
                           ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Link to="/login" className="flex items-center justify-center px-4 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white/5" onClick={() => setIsOpen(false)}>LOG IN</Link>
                                    <Link to="/signup" className="flex items-center justify-center px-4 py-3 rounded-xl bg-[#FF4D00] text-sm font-bold text-white hover:bg-[#e04400]" onClick={() => setIsOpen(false)}>SIGN UP</Link>
                                </div>
                           )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;