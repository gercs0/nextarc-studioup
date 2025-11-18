
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin } from 'lucide-react';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M22.28 6.51c-1.21-1.33-3.28-2.18-5.32-2.18h-1.63v11.55c0 1.28-.53 2.54-1.45 3.43-.92.89-2.17 1.4-3.48 1.4-1.31 0-2.56-.51-3.48-1.4-1-1-1.5-2.3-1.5-3.7v-5.9h3.12V8.09H6.41v5.9c0 2.25.9 4.35 2.5 5.92 1.6 1.57 3.7 2.43 5.9 2.43 2.2 0 4.3-.86 5.9-2.43 1.6-1.57 2.5-3.67 2.5-5.92V8.67c1.33.86 2.87 1.33 4.48 1.33v-3.5c-1.5-.07-2.9-.66-4.02-1.61z"/>
    </svg>
);


const Footer: React.FC = () => {
    return (
        <footer className="bg-[#050810] border-t border-neutral-800/50">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <Link to="/" className="flex items-center space-x-2">
                             <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                <path d="M5.5 28V4H12.3L21.5 19.5V4H28V28H21.2L12 12.5V28H5.5Z" fill="currentColor"/>
                            </svg>
                            <div className="flex flex-col">
                                <span className="font-black text-xl tracking-tighter text-white">NextArc</span>
                                <span className="text-xs font-semibold tracking-[0.2em] text-gray-400 -mt-1">STUDIO</span>
                            </div>
                        </Link>
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
