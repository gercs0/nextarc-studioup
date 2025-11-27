
import React, { useMemo } from 'react';
import { Project, User } from '../types';
import { TrendingUp, DollarSign, Award, BarChart3, PieChart, Crown } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProAnalyticsProps {
    projects: Project[];
    currentUser: User;
}

const ProAnalytics: React.FC<ProAnalyticsProps> = ({ projects, currentUser }) => {
    
    const analytics = useMemo(() => {
        const myOffers = projects.flatMap(p => p.offers.filter(o => o.creatorId === currentUser.id));
        const totalOffers = myOffers.length;
        
        const completedProjects = projects.filter(p => 
            p.status === 'completed' && 
            p.acceptedOfferId && 
            p.offers.find(o => o.id === p.acceptedOfferId)?.creatorId === currentUser.id
        );

        const activeProjects = projects.filter(p => 
            p.status === 'in-progress' && 
            p.acceptedOfferId && 
            p.offers.find(o => o.id === p.acceptedOfferId)?.creatorId === currentUser.id
        );

        const totalEarned = completedProjects.reduce((acc, p) => {
            const offer = p.offers.find(o => o.id === p.acceptedOfferId);
            return acc + (offer?.amount || 0);
        }, 0);

        const pendingEarnings = activeProjects.reduce((acc, p) => {
            const offer = p.offers.find(o => o.id === p.acceptedOfferId);
            return acc + (offer?.amount || 0);
        }, 0);

        const acceptedOffersCount = completedProjects.length + activeProjects.length;
        const winRate = totalOffers > 0 ? Math.round((acceptedOffersCount / totalOffers) * 100) : 0;

        // Mock Monthly Data for Chart
        // In a real app, calculate this from `completedProjects` timestamps
        const monthlyData = [
            { month: 'May', amount: totalEarned * 0.1 },
            { month: 'Jun', amount: totalEarned * 0.15 },
            { month: 'Jul', amount: totalEarned * 0.1 },
            { month: 'Aug', amount: totalEarned * 0.2 },
            { month: 'Sep', amount: totalEarned * 0.25 },
            { month: 'Oct', amount: totalEarned * 0.2 },
        ];
        
        const maxMonth = Math.max(...monthlyData.map(d => d.amount)) || 100;

        return {
            totalEarned,
            pendingEarnings,
            winRate,
            totalOffers,
            monthlyData,
            maxMonth
        };
    }, [projects, currentUser]);

    return (
        <div className="bg-[#0F0F0F] border border-[#FFD700]/30 rounded-xl p-6 relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Crown size={120} />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#FFD700]/10 p-2 rounded-lg">
                    <BarChart3 className="text-[#FFD700] h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white font-syne">Pro Analytics</h2>
                    <p className="text-xs text-[#FFD700] font-bold uppercase tracking-wider">Exclusive Insights</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Metric 1: Total Revenue */}
                <div className="bg-[#161616] p-4 rounded-lg border border-neutral-800">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Lifetime Earnings</span>
                        <DollarSign className="text-green-500 h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold text-white">${analytics.totalEarned.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">
                        +${analytics.pendingEarnings.toLocaleString()} pending
                    </div>
                </div>

                {/* Metric 2: Win Rate */}
                <div className="bg-[#161616] p-4 rounded-lg border border-neutral-800">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Offer Win Rate</span>
                        <Award className="text-[#FF4D00] h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold text-white">{analytics.winRate}%</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {analytics.totalOffers} total offers made
                    </div>
                </div>

                {/* Metric 3: Growth */}
                 <div className="bg-[#161616] p-4 rounded-lg border border-neutral-800">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Market Performance</span>
                        <PieChart className="text-blue-500 h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold text-white">Top 10%</div>
                    <div className="text-xs text-gray-500 mt-1">
                        Of creators in your category
                    </div>
                </div>
            </div>

            {/* Earnings Chart */}
            <div className="bg-[#161616] p-6 rounded-lg border border-neutral-800">
                <h3 className="text-sm font-bold text-gray-300 mb-6 flex items-center gap-2">
                    <TrendingUp size={14} /> Revenue History (Last 6 Months)
                </h3>
                <div className="flex items-end justify-between h-32 gap-2">
                    {analytics.monthlyData.map((data, index) => {
                        const heightPercentage = (data.amount / analytics.maxMonth) * 100;
                        return (
                            <div key={index} className="flex flex-col items-center flex-1 group">
                                <div className="w-full bg-[#222] rounded-t-sm relative h-full flex items-end overflow-hidden">
                                     <div 
                                        style={{ height: `${heightPercentage}%` }} 
                                        className="w-full bg-gradient-to-t from-[#FFD700]/20 to-[#FFD700] opacity-80 group-hover:opacity-100 transition-all duration-500"
                                     ></div>
                                </div>
                                <span className="text-[10px] text-gray-500 mt-2 font-mono uppercase">{data.month}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProAnalytics;
