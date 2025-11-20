
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface LogoProps {
    className?: string;
    iconClassName?: string;
    to?: string | null;
    iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, iconClassName, to = "/", iconOnly = false }) => {
    const Icon = (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("text-white shrink-0", iconClassName)}>
            <path d="M5 4V28L14 19V4H5Z" fill="currentColor"/>
            <path d="M18 13V28H27V4L18 13Z" fill="currentColor"/>
        </svg>
    );

    const Text = (
        <div className="flex flex-col justify-center">
            <span className="font-black text-xl tracking-tighter text-white leading-none">NextArc</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 leading-none mt-0.5">STUDIO</span>
        </div>
    );

    const content = (
        <div className={cn("flex items-center gap-2", className)}>
            {Icon}
            {!iconOnly && Text}
        </div>
    );

    if (to) {
        return <Link to={to} className="block hover:opacity-90 transition-opacity">{content}</Link>;
    }
    return content;
};

export default Logo;
