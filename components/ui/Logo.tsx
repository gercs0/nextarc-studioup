
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
    // Stylized N with an arrow integrated, matching the "NextArc" visual identity
    // Responsive sizing: w-8 h-8 on mobile, w-10 h-10 on md+
    const Icon = (
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0 w-8 h-8 md:w-10 md:h-10 transition-all", iconClassName)}>
            {/* Background Glow */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            
            {/* Main N Shape with Arrow */}
            <path 
                d="M10 30V10L24 24V12" 
                stroke="#E6E6E6" 
                strokeWidth="3.5" 
                strokeLinecap="square" 
                strokeLinejoin="round"
            />
            <path 
                d="M24 12L30 6M30 6V14M30 6H22" 
                stroke="#FF4D00" 
                strokeWidth="3.5" 
                strokeLinecap="square" 
                strokeLinejoin="round"
            />
        </svg>
    );

    const Text = (
        <div className="flex flex-col justify-center ml-2 md:ml-3">
            <span className="font-syne font-black text-lg md:text-xl tracking-tighter text-white leading-none">NEXTARC</span>
            <span className="font-syne text-[0.6rem] md:text-[0.65rem] tracking-[0.2em] text-gray-400 uppercase leading-none mt-0.5 md:mt-1">STUDIO</span>
        </div>
    );

    const content = (
        <div className={cn("flex items-center group select-none", className)}>
            <div className="transition-transform duration-300 group-hover:scale-105">
                {Icon}
            </div>
            {!iconOnly && Text}
        </div>
    );

    if (to) {
        return <Link to={to} className="block">{content}</Link>;
    }
    return content;
};

export default Logo;
