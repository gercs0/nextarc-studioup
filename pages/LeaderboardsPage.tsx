
import React, { useState, useMemo } from 'react';
import { useCreators } from '../hooks/useCreators';
import { useProjects } from '../hooks/useProjects';
import { Link } from 'react-router-dom';
import { Crown, CheckCircle, Star, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import Rating from '../components/ui/Rating';

type SortKey = 'completed' | 'rating' | 'offers';

const LeaderboardsPage: React.FC = () => {
    const { creators } = useCreators();
    const { projects } = useProjects();
    const [sortBy, setSortBy] = useState<SortKey>('completed');

    const creatorStats = useMemo(() => {
        return creators.map(creator => {
            const completedProjects = projects.filter(p =>
                p.status === 'completed' &&
                p.acceptedOfferId &&
                p.offers.find(o => o.id === p.acceptedOfferId)?.creatorId === creator.id
            ).length;

            const offersMade = projects.reduce((count, p) => {
                return count + p.offers.filter(o => o.creatorId === creator.id).length;
            }, 0);

            return {
                ...creator,
                completed: completedProjects,
                offers: offersMade
            };
        });
    }, [creators, projects]);

    const sortedCreators = useMemo(() => {
        return [...creatorStats].sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    if (b.rating !== a.rating) return b.rating - a.rating;
                    return b.ratingsCount - a.ratingsCount; // Tie-break by number of ratings
                case 'offers':
                    return b.offers - a.offers;
                case 'completed':
                default:
                    return b.completed - a.completed;
            }
        });
    }, [creatorStats, sortBy]);

    const getTrophyColor = (rank: number) => {
        if (rank === 0) return 'text-yellow-400';
        if (rank === 1) return 'text-gray-400';
        if (rank === 2) return 'text-yellow-600';
        return 'text-neutral-600';
    };

    const sortOptions: { id: SortKey, label: string, icon: React.ElementType }[] = [
        { id: 'completed', label: 'Projects Completed', icon: CheckCircle },
        { id: 'rating', label: 'Highest Rated', icon: Star },
        { id: 'offers', label: 'Offers Made', icon: Send },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black tracking-tighter text-white">Creator Leaderboards</h1>
                <p className="mt-2 text-lg text-gray-400">Recognizing the top talent on the NextArc platform.</p>
            </div>
            
            <div className="mb-8 flex justify-center bg-neutral-900/50 border border-neutral-800 rounded-lg p-2">
                {sortOptions.map(opt => (
                     <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id)}
                        className={cn(
                            'flex-1 text-center py-2 px-4 rounded-md text-sm font-semibold transition-colors',
                            sortBy === opt.id ? 'bg-[#FF4D00] text-white' : 'text-gray-300 hover:bg-neutral-800'
                        )}
                    >
                        <opt.icon className="inline-block mr-2 h-4 w-4" />
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden">
                <ul className="divide-y divide-neutral-800">
                    {sortedCreators.map((creator, index) => (
                        <li key={creator.id} className="p-4 flex items-center space-x-4 hover:bg-neutral-800/50 transition-colors">
                            <div className="w-12 text-center text-xl font-bold flex items-center justify-center">
                                <span className={getTrophyColor(index)}><Crown /></span>
                                <span className="ml-2">{index + 1}</span>
                            </div>
                            <img src={creator.profilePictureUrl} alt={creator.username} className="w-12 h-12 rounded-full object-cover" />
                            <div className="flex-grow">
                                <Link to={`/creator/${creator.id}`} className="font-semibold text-white hover:text-[#FF4D00]">{creator.username}</Link>
                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                    <Rating value={creator.rating} readonly size={14} />
                                    <span className="ml-2">({creator.ratingsCount})</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-white">
                                    {sortBy === 'completed' ? creator.completed : sortBy === 'rating' ? creator.rating.toFixed(1) : creator.offers}
                                </p>
                                <p className="text-xs text-gray-400 capitalize">{sortBy === 'rating' ? 'Avg. Rating' : sortBy}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LeaderboardsPage;
