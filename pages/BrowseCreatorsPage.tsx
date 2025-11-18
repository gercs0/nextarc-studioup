import React, { useState, useMemo } from 'react';
import { useCreators } from '../hooks/useCreators';
import { Input } from '../components/ui/Input';
import { Search, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Rating from '../components/ui/Rating';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';


const AvailabilityIndicator: React.FC<{ availability?: string }> = ({ availability }) => {
    const statusStyles: { [key: string]: { text: string; bg: string; dot: string } } = {
        'Available': { text: 'text-green-400', bg: 'bg-green-900/50', dot: 'bg-green-500' },
        'Booked Up': { text: 'text-yellow-400', bg: 'bg-yellow-900/50', dot: 'bg-yellow-500' },
        'On Vacation': { text: 'text-gray-400', bg: 'bg-neutral-700/50', dot: 'bg-gray-500' },
    };

    const style = statusStyles[availability || ''] || statusStyles['On Vacation'];

    return (
        <div className={cn("inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium", style.bg, style.text)}>
            <div className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
            {availability}
        </div>
    );
};

const BrowseCreatorsPage: React.FC = () => {
    const { creators, loading } = useCreators();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCreators = useMemo(() => {
        if (!searchTerm.trim()) {
            return creators;
        }
        const searchLower = searchTerm.toLowerCase();
        return creators.filter(creator => 
            creator.username.toLowerCase().includes(searchLower) ||
            creator.bio.toLowerCase().includes(searchLower)
        );
    }, [creators, searchTerm]);

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black tracking-tighter text-white">Browse Creators</h1>
                <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-400">Discover the top-tier talent ready to bring your vision to life.</p>
            </div>

            <div className="max-w-xl mx-auto mb-8">
                 <div className="relative">
                    <Input 
                        type="text" 
                        placeholder="Search by name, sport, or specialty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 text-base"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 space-y-4">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="w-16 h-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-5 w-28" />
                        </div>
                    ))}
                </div>
            ) : filteredCreators.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCreators.map(creator => (
                         <Link to={`/creator/${creator.id}`} key={creator.id} className="group block text-left bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 transition-all duration-300 hover:border-[#FF4D00]/50 hover:-translate-y-1">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <img src={creator.profilePictureUrl} alt={creator.username} className="w-16 h-16 rounded-full object-cover border-2 border-neutral-700" />
                                    <div>
                                        <h3 className="text-xl font-semibold text-white group-hover:text-[#FF4D00] transition-colors">{creator.username}</h3>
                                        <div className="flex items-center mt-1">
                                            <Rating value={creator.rating} readonly size={16} />
                                            <span className="text-xs text-gray-500 ml-2">({creator.ratingsCount} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                <AvailabilityIndicator availability={creator.availability} />
                            </div>
                            <p className="text-gray-400 mt-4 text-sm h-16 overflow-hidden">{creator.bio}</p>
                             <div className="mt-4 text-sm font-semibold text-[#FF4D00] flex items-center">
                               View Profile <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-lg">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-4 text-xl font-semibold text-white">No Creators Found</h3>
                    <p className="mt-2 text-gray-400">We couldn't find any creators matching your search. Try another term.</p>
                </div>
            )}

        </div>
    );
};

export default BrowseCreatorsPage;