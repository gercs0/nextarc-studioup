import React, { useState, useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import { Project } from '../types';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search } from 'lucide-react';
import { SPORT_OPTIONS, SERVICE_OPTIONS } from '../constants';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';

const budgetRanges = [
    { id: 'all', label: 'Any Budget' },
    { id: 'low', label: '< $500' },
    { id: 'mid', label: '$500 - $1500' },
    { id: 'high', label: '> $1500' },
];

const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'deadline', label: 'Nearing Deadline' },
    { id: 'budget-desc', label: 'Budget: High to Low' },
    { id: 'budget-asc', label: 'Budget: Low to High' },
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
                         // Assuming IDs are timestamp-based, a higher ID is newer
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
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black tracking-tighter text-white">Browse Projects</h1>
                <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-400">Find your next collaboration. Creators, this is your arena.</p>
            </div>
            
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 mb-8 flex flex-col sm:flex-row flex-wrap gap-4 items-center">
                <div className="relative flex-grow w-full sm:w-auto min-w-[200px]">
                    <Input 
                        type="text" 
                        placeholder="Search by keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                 <div className="flex-grow w-full sm:w-auto">
                    <Select value={sportFilter} onChange={e => setSportFilter(e.target.value)} className="w-full">
                        <option value="all">All Sports</option>
                        {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </div>
                 <div className="flex-grow w-full sm:w-auto">
                    <Select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} className="w-full">
                        <option value="all">All Services</option>
                        {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </div>
                <div className="flex-grow w-full sm:w-auto">
                     <Select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)} className="w-full">
                        {sortOptions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </Select>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {budgetRanges.map(range => (
                        <Button
                            key={range.id}
                            variant={budgetFilter === range.id ? 'default' : 'secondary'}
                            size="sm"
                            onClick={() => setBudgetFilter(range.id)}
                        >
                            {range.label}
                        </Button>
                    ))}
                </div>
                <Button variant="ghost" onClick={handleResetFilters} className="sm:ml-auto">Reset Filters</Button>
            </div>

            {loading ? (
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                       <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-5 space-y-3">
                           <div className="h-32 bg-neutral-800 rounded"></div>
                           <div className="flex justify-between items-start">
                               <div>
                                   <Skeleton className="h-4 w-20 mb-2" />
                                   <Skeleton className="h-6 w-32" />
                               </div>
                               <Skeleton className="h-8 w-20 rounded-full" />
                           </div>
                           <Skeleton className="h-10 w-full" />
                           <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                               <Skeleton className="h-4 w-1/2" />
                               <Skeleton className="h-8 w-8 rounded" />
                           </div>
                       </div>
                    ))}
                </div>
            ) : openProjects.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {openProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-lg">
                    <h3 className="text-xl font-semibold text-white">No Open Projects Found</h3>
                    <p className="mt-2 text-gray-400">Try adjusting your filters or check back soon for new opportunities.</p>
                    <Button asChild className="mt-6">
                       <a href="#/post-project">Post a Project</a>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default BrowsePage;