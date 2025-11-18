
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const blogPosts = [
    {
        id: 1,
        title: "How to Write a Project Brief That Attracts Top-Tier Creators",
        category: "For Athletes",
        excerpt: "Your project brief is the single most important document for attracting the right talent. It's your first impression and your primary communication tool. We'll break down the key elements of a perfect brief...",
        imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800",
        date: "October 26, 2023",
        author: "NextArc Team"
    },
    {
        id: 2,
        title: "5 Tips for Pricing Your Creative Services on a Marketplace",
        category: "For Creators",
        excerpt: "Pricing your work is one of the hardest parts of being a freelance creator. Too high, and you might scare away clients. Too low, and you devalue your work. Here’s how to find the sweet spot.",
        imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=800",
        date: "October 22, 2023",
        author: "NextArc Team"
    },
    {
        id: 3,
        title: "The Rise of the Athlete-Creator: Why Personal Branding Matters More Than Ever",
        category: "Industry Insights",
        excerpt: "In the age of social media, an athlete's brand is as valuable as their on-field performance. We explore the trend of athletes taking control of their narrative through high-quality content.",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d3077884978e?q=80&w=800",
        date: "October 18, 2023",
        author: "NextArc Team"
    }
];

const BlogPage: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black tracking-tighter text-white">The NextArc Blog</h1>
                <p className="mt-2 text-lg text-gray-400">Insights, tips, and stories for the modern athlete and creator.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {blogPosts.map(post => (
                    <div key={post.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden flex flex-col group">
                        <img src={post.imageUrl} alt={post.title} className="h-48 w-full object-cover" />
                        <div className="p-6 flex flex-col flex-grow">
                            <p className="text-sm font-semibold text-[#FF4D00]">{post.category}</p>
                            <h2 className="mt-2 text-xl font-bold text-white group-hover:text-[#FF4D00] transition-colors">
                                <Link to="#">{post.title}</Link>
                            </h2>
                            <p className="mt-3 text-sm text-gray-400 flex-grow">{post.excerpt}</p>
                            <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
                                <span>{post.date}</span>
                                <Link to="#" className="font-semibold text-[#FF4D00] flex items-center">
                                    Read More <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogPage;
