
import React, { useState, useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, Filter } from 'lucide-react';
import { SPORT_OPTIONS, SERVICE_OPTIONS } from '../constants';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';

const budgetRanges = [
    { id: 'all', label: 'All Budgets' },
    { id: 'low', label: '< $500' },
    { id: 'mid', label: '$500 - $1.5k' },
    { id: 'high', label: '$1.5k+' },
];

const sortOptions = [
    { id: 'newest', label: 'Newest' },
    { id: 'deadline', label: 'Urgent' },
    { id: 'budget-desc', label: 'Highest Budget' },
];

type SortOption = 'newest' | 'deadline' | 'budget-desc' | 'budget-asc';

const BrowsePage: React.FC = () => {
    const { projects, loading } = useProjects();
    const [searchTerm, setSearchTerm] = useState('');
    const [sportFilter, setSportFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [budgetFilter, setBudgetFilter] = useState('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    const openProjects = useMemo(() => {
        return projects
            .filter(p => p.status === 'open')
            .filter(p => {
                if (!searchTerm.trim()) return true;
                const searchLower = searchTerm.toLowerCase();
                return p.serviceType.toLowerCase().includes(searchLower) ||
                       p.sport.toLowerCase().includes(searchLower) ||
                       p.description.toLowerCase().includes(searchLower);
            })
            .filter(p => sportFilter === 'all' || p.sport === sportFilter)
            .filter(p => serviceFilter === 'all' || p.serviceType === serviceFilter)
            .filter(p => {
                if (budgetFilter === 'all') return true;
                if (budgetFilter === 'low') return p.budget < 500;
                if (budgetFilter === 'mid') return p.budget >= 500 && p.budget <= 1500;
                if (budgetFilter === 'high') return p.budget > 1500;
                return true;
            })
            .sort((a, b) => {
                switch(sortBy) {
                    case 'deadline':
                        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                    case 'budget-desc':
                        return b.budget - a.budget;
                    case 'budget-asc':
                        return a.budget - b.budget;
                    case 'newest':
                    default:
                        return b.id.localeCompare(a.id);
                }
            });
    }, [projects, searchTerm, sportFilter, serviceFilter, budgetFilter, sortBy]);
    
    const handleResetFilters = () => {
        setSearchTerm('');
        setSportFilter('all');
        setServiceFilter('all');
        setBudgetFilter('all');
        setSortBy('newest');
    };

    return (
        <div>
            <div className="mb-12 text-center">
                <h1 className="font-syne text-4xl font-black text-white">Browse Requests</h1>
                <p className="text-gray-400 mt-2 text-lg">Find new opportunities to create.</p>
            </div>
            
            {/* Filter Bar */}
            <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-6 mb-10 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Search */}
                    <div className="md:col-span-4 relative">
                        <Input 
                            type="text" 
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-neutral-900 border-neutral-700"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    </div>

                    {/* Dropdowns */}
                    <div className="md:col-span-2">
                        <Select value={sportFilter} onChange={e => setSportFilter(e.target.value)} className="bg-neutral-900 border-neutral-700">
                            <option value="all">All Sports</option>
                            {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </div>
                    <div className="md:col-span-2">
                        <Select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} className="bg-neutral-900 border-neutral-700">
                            <option value="all">All Services</option>
                            {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </div>
                    <div className="md:col-span-2">
                         <Select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)} className="bg-neutral-900 border-neutral-700">
                            {sortOptions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </Select>
                    </div>

                    {/* Reset */}
                    <div className="md:col-span-2 flex justify-end">
                        <Button variant="ghost" onClick={handleResetFilters} className="w-full md:w-auto text-gray-400 hover:text-white">
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Budget Chips */}
                <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-neutral-800">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center mr-2"><Filter className="h-3 w-3 mr-1" /> Budget:</span>
                    {budgetRanges.map(range => (
                        <button
                            key={range.id}
                            onClick={() => setBudgetFilter(range.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                budgetFilter === range.id 
                                ? 'bg-white text-black' 
                                : 'bg-neutral-900 text-gray-400 hover:bg-neutral-800'
                            }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                       <div key={i} className="bg-[#0A0A0A] p-5 rounded-2xl space-y-3 border border-neutral-800">
                           <Skeleton className="h-48 w-full rounded-xl" />
                           <div className="space-y-2 pt-2">
                               <Skeleton className="h-4 w-24" />
                               <Skeleton className="h-6 w-3/4" />
                           </div>
                       </div>
                    ))}
                </div>
            ) : openProjects.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {openProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 border-2 border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20">
                    <h3 className="text-2xl font-bold text-white font-syne">No requests found.</h3>
                    <p className="mt-2 text-gray-400 mb-6">Try adjusting your filters.</p>
                    <Button asChild variant="outline">
                       <a href="#/post-project">Post a Request</a>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default BrowsePage;