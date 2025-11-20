
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin } from 'lucide-react';
import { Logo } from '../ui/Logo';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
);


const Footer: React.FC = () => {
    return (
        <footer className="bg-[#050810] border-t border-neutral-800/50">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <Logo />
                        <p className="mt-2 text-sm text-gray-400 max-w-xs">The premier marketplace connecting elite athletes with world-class content creators.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
                        <div>
                            <h2 className="mb-4 text-sm font-semibold text-gray-200 uppercase tracking-wider">Navigate</h2>
                            <ul className="text-gray-400 space-y-2">
                                <li><Link to="/browse" className="hover:text-white transition-colors">Browse Projects</Link></li>
                                <li><Link to="/creators" className="hover:text-white transition-colors">Find Creators</Link></li>
                                <li><Link to="/post-project" className="hover:text-white transition-colors">Post a Project</Link></li>
                                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-4 text-sm font-semibold text-gray-200 uppercase tracking-wider">Resources</h2>
                            <ul className="text-gray-400 space-y-2">
                                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                                <li><Link to="/legal" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link to="/legal" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>
                         <div>
                            <h2 className="mb-4 text-sm font-semibold text-gray-200 uppercase tracking-wider">Community</h2>
                            <ul className="text-gray-400 space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                                <li><Link to="/leaderboards" className="hover:text-white transition-colors">Leaderboards</Link></li>
                                <li><Link to="/admin" className="hover:text-white transition-colors text-xs text-neutral-600">Admin</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-neutral-800 sm:mx-auto lg:my-8" />
                <div className="sm:flex sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-400 sm:text-center">© {new Date().getFullYear()} NextArc Studio™. All Rights Reserved.</span>
                    <div className="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
                        <a href="https://www.tiktok.com/@nextarc.media" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><TikTokIcon className="h-5 w-5" /></a>
                        <a href="https://www.instagram.com/nextarc_media/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Instagram size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><Linkedin size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
