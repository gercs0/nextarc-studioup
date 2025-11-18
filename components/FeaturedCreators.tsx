import React from 'react';
import { useCreators } from '../hooks/useCreators';
import { Link } from 'react-router-dom';
import Rating from './ui/Rating';
import { ArrowRight } from 'lucide-react';

const FeaturedCreators: React.FC = () => {
    const { creators } = useCreators();
    // Get the first 3 creators to feature
    const featured = creators.slice(0, 3);

    return (
        <section className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Meet Our Top Creators</h2>
            <p className="mt-4 text-lg text-gray-400">The talent behind the lens, trusted by athletes to deliver excellence.</p>
            <div className="mt-12 grid md:grid-cols-3 gap-8">
                {featured.map(creator => (
                    <Link to={`/creator/${creator.id}`} key={creator.id} className="group block text-left bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 transition-all duration-300 hover:border-[#FF4D00]/50 hover:-translate-y-1">
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
                        <p className="text-gray-400 mt-4 text-sm h-16 overflow-hidden">{creator.bio}</p>
                         <div className="mt-4 text-sm font-semibold text-[#FF4D00] flex items-center">
                           View Profile <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default FeaturedCreators;
