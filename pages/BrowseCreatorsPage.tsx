
import React, { useState, useMemo } from 'react';
import { useCreators } from '../hooks/useCreators';
import { Input } from '../components/ui/Input';
import { Search, MessageSquare, ArrowRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import Rating from '../components/ui/Rating';
import { cn, calculateLeague } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';
import { LeagueBadge } from '../components/ui/LeagueBadge';
import { Select } from '../components/ui/Select';


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
    const [leagueFilter, setLeagueFilter] = useState<string>('all');

    const filteredCreators = useMemo(() => {
        let result = creators.map(c => ({...c, league: calculateLeague(c)}));

        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(creator => 
                creator.username.toLowerCase().includes(searchLower) ||
                creator.bio.toLowerCase().includes(searchLower)
            );
        }

        if (leagueFilter !== 'all') {
            result = result.filter(c => c.league === leagueFilter);
        }

        return result;
    }, [creators, searchTerm, leagueFilter]);

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black tracking-tighter text-white">Browse Creators</h1>
                <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-400">Discover top-tier talent ranked by our league system.</p>
            </div>

            <div className="max-w-3xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
                 <div className="relative flex-grow">
                    <Input 
                        type="text" 
                        placeholder="Search by name, sport, or specialty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 text-base bg-neutral-900 border-neutral-700"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <div className="w-full md:w-48">
                    <Select value={leagueFilter} onChange={e => setLeagueFilter(e.target.value)} className="h-11 bg-neutral-900 border-neutral-700">
                        <option value="all">All Leagues</option>
                        <option value="Rookie">Rookie</option>
                        <option value="Varsity">Varsity</option>
                        <option value="Pro">Pro</option>
                        <option value="All-Star">All-Star</option>
                    </Select>
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
                         <Link to={`/creator/${creator.id}`} key={creator.id} className="group block text-left bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 transition-all duration-300 hover:border-[#FF4D00]/50 hover:-translate-y-1 relative overflow-hidden">
                            {creator.league === 'All-Star' && (
                                <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                                    <Crown className="w-24 h-24 text-yellow-500" />
                                </div>
                            )}
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center space-x-4">
                                    <img src={creator.profilePictureUrl} alt={creator.username} className="w-16 h-16 rounded-full object-cover border-2 border-neutral-700" />
                                    <div>
                                        <h3 className="text-xl font-semibold text-white group-hover:text-[#FF4D00] transition-colors">{creator.username}</h3>
                                        <div className="flex flex-col items-start gap-1 mt-1">
                                            <LeagueBadge league={creator.league} />
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Rating value={creator.rating} readonly size={12} />
                                                <span className="ml-1">({creator.ratingsCount})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 mt-4 text-sm h-16 overflow-hidden relative z-10">{creator.bio}</p>
                             <div className="mt-4 flex justify-between items-center relative z-10">
                                <AvailabilityIndicator availability={creator.availability} />
                                <div className="text-sm font-semibold text-[#FF4D00] flex items-center">
                                   Profile <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-lg">
                    <Filter className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-4 text-xl font-semibold text-white">No Creators Found</h3>
                    <p className="mt-2 text-gray-400">Try adjusting your league or search filters.</p>
                </div>
            )}

        </div>
    );
};

function Crown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 9.17a.5.5 0 0 0 .442.259h6.126a.5.5 0 0 1 .374.832l-4.721 5.378a.5.5 0 0 0-.15.443l1.157 7.025a.5.5 0 0 1-.777.536L12 19.387l-6.843 4.256a.5.5 0 0 1-.777-.536l1.157-7.025a.5.5 0 0 0-.15-.443L.666 10.26a.5.5 0 0 1 .374-.832h6.126a.5.5 0 0 0 .442-.259l2.954-5.904Z" />
    </svg>
  )
}


export default BrowseCreatorsPage;