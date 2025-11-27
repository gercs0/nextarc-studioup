import React from 'react';
import { League } from '../../types';
import { cn } from '../../lib/utils';
import { Trophy, Shield, Medal, Star } from 'lucide-react';

interface LeagueBadgeProps {
    league: League;
    className?: string;
    showLabel?: boolean;
}

export const LeagueBadge: React.FC<LeagueBadgeProps> = ({ league, className, showLabel = true }) => {
    
    const config = {
        'Rookie': {
            icon: Shield,
            style: 'bg-neutral-800 text-gray-400 border-gray-700',
            label: 'Rookie'
        },
        'Varsity': {
            icon: Medal,
            style: 'bg-blue-900/40 text-blue-400 border-blue-500/30',
            label: 'Varsity'
        },
        'Pro': {
            icon: Star,
            style: 'bg-[#FF4D00]/20 text-[#FF4D00] border-[#FF4D00]/40 shadow-[0_0_10px_rgba(255,77,0,0.1)]',
            label: 'Pro'
        },
        'All-Star': {
            icon: Trophy,
            style: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]',
            label: 'All-Star'
        }
    };

    const { icon: Icon, style, label } = config[league] || config['Rookie'];

    return (
        <div className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", style, className)}>
            <Icon className="w-3 h-3 mr-1.5" />
            {showLabel && label}
        </div>
    );
};