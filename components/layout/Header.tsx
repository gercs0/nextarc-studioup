
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, Bell, Edit3, Settings, Crown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { Logo } from '../ui/Logo';

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            setTimeout(() => markAllAsRead(), 1000); // Mark as read after a short delay
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
            <Button variant="ghost" size="icon" onClick={handleToggle}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-neutral-900" />
                )}
            </Button>
            {isOpen && (
                 <div className="absolute right-0 mt-2 w-80 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg z-50">
                    <div className="p-3 font-semibold text-white border-b border-neutral-700">Notifications</div>
                    <div className="py-1 max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <Link to={n.link} key={n.id} className="block px-4 py-3 text-sm text-gray-300 hover:bg-neutral-800" onClick={() => setIsOpen(false)}>
                                    <p className={!n.read ? 'font-bold text-white' : ''}>{n.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                                </Link>
                            ))
                        ) : (
                            <p className="px-4 py-3 text-sm text-gray-400">No new notifications.</p>
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
            <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5" />
                <span>
                    {currentUser.name}
                    {currentUser.role === 'creator' && !currentUser.verified && (
                         <span className="ml-2 text-xs font-semibold text-yellow-300 bg-yellow-900/50 px-2 py-0.5 rounded-full">Pending</span>
                    )}
                </span>
            </Button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg z-50">
                    <div className="py-1">
                        <Link to="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800" onClick={() => setIsOpen(false)}>
                            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                        </Link>
                        {currentUser.role === 'creator' && (
                           <>
                           <Link to={`/creator/${currentUser.id}`} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800" onClick={() => setIsOpen(false)}>
                             <UserIcon className="mr-2 h-4 w-4" /> My Public Profile
                           </Link>
                           <Link to="/edit-profile" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800" onClick={() => setIsOpen(false)}>
                             <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                           </Link>
                           <Link to="/pro" className="flex items-center px-4 py-2 text-sm text-yellow-400 hover:bg-neutral-800" onClick={() => setIsOpen(false)}>
                             <Crown className="mr-2 h-4 w-4" /> Go Pro
                           </Link>
                           </>
                        )}
                        <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800" onClick={() => setIsOpen(false)}>
                           <Settings className="mr-2 h-4 w-4" /> Settings
                        </Link>
                        <div className="border-t border-neutral-700 my-1" />
                        <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-neutral-800">
                            <LogOut className="mr-2 h-4 w-4" /> Log Out
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

    const navItems = [
        { name: 'Browse Projects', path: '/browse' },
        { name: 'Browse Creators', path: '/creators' },
        { name: 'Leaderboards', path: '/leaderboards' },
        ...(currentUser && currentUser.role === 'athlete' ? [
            { name: 'Post a Project', path: '/post-project' },
        ] : [])
    ];

    const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-neutral-800 hover:text-white transition-colors";
    const activeNavLinkClasses = "bg-neutral-800 text-white";

    return (
        <header className="sticky top-0 z-40 bg-[#050810]/80 backdrop-blur-sm border-b border-neutral-800/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Logo />
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:block">
                        {currentUser ? (
                           <div className="flex items-center gap-2">
                               <NotificationBell />
                               <UserMenu />
                           </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button asChild variant="outline">
                                    <Link to="/login">Log In</Link>
                                </Button>
                                <Button asChild>
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

            {isOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map(item => (
                             <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `block ${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </div>
                    <div className="pt-4 pb-3 border-t border-neutral-700">
                        <div className="px-2 space-y-2">
                           {currentUser ? (
                                <>
                                 <div className="flex items-center px-2 py-2 gap-2">
                                    <div className="text-base font-medium text-white">
                                        {currentUser.name}
                                    </div>
                                    <div className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-gray-400 capitalize">{currentUser.role}</div>
                                 </div>
                                 <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-neutral-700" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                 {currentUser.role === 'creator' && (
                                     <>
                                     <Link to={`/creator/${currentUser.id}`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-neutral-700" onClick={() => setIsOpen(false)}>My Public Profile</Link>
                                     <Link to="/pro" className="block px-3 py-2 rounded-md text-base font-medium text-yellow-400 hover:text-yellow-300 hover:bg-neutral-700" onClick={() => setIsOpen(false)}>Go Pro</Link>
                                     </>
                                 )}
                                 <Link to="/settings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-neutral-700" onClick={() => setIsOpen(false)}>Settings</Link>
                                 <button className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-neutral-700" onClick={() => { logout(); setIsOpen(false); }}>Log Out</button>
                                </>
                           ) : (
                                <>
                                    <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-neutral-700" onClick={() => setIsOpen(false)}>Log In</Link>
                                    <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-[#FF4D00] hover:bg-[#FF4D00]/90" onClick={() => setIsOpen(false)}>Sign Up</Link>
                                </>
                           )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
