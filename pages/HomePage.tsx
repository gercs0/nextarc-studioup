
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Counters } from '../types';
import { getLiveCounters, resetCounters } from '../services/countersService';
import { Zap, ShieldCheck, Users, ArrowRight, Play, FileUp, CreditCard, Handshake } from 'lucide-react';
import FeaturedCreators from '../components/FeaturedCreators';
import Testimonials from '../components/Testimonials';

const HexIcon: React.FC<{ icon: React.ElementType, label: string }> = ({ icon: Icon, label }) => (
    <div className="flex flex-col items-center gap-4 group cursor-pointer">
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2">
            {/* Hexagon Shape CSS or SVG background could go here, keeping it simple with borders for now matching the style */}
            <div className="absolute inset-0 bg-[#0A0A0A] border border-[#FFD700]/30 rounded-2xl rotate-45 shadow-[0_0_15px_rgba(255,215,0,0.1)] group-hover:border-[#FF4D00]/50 group-hover:shadow-[0_0_25px_rgba(255,77,0,0.2)] transition-all"></div>
            <Icon className="relative z-10 w-6 h-6 md:w-8 md:h-8 text-[#FFD700] group-hover:text-[#FF4D00] transition-colors" />
        </div>
        <span className="font-syne font-bold text-white tracking-wide text-xs md:text-sm uppercase group-hover:text-[#FF4D00] transition-colors">{label}</span>
    </div>
);

const HomePage: React.FC = () => {
    const [counters, setCounters] = useState<Counters | null>(null);
    const [adminMode, setAdminMode] = useState(false);

    useEffect(() => {
        const fetchAndSetCounters = async () => {
            const data = await getLiveCounters();
            setCounters(data);
        };

        fetchAndSetCounters();
        const interval = setInterval(fetchAndSetCounters, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleResetCounters = () => {
        if (window.confirm("Are you sure you want to reset all counters?")) {
            resetCounters();
            window.location.reload();
        }
    };
    
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if(e.key === 'R' && e.ctrlKey && e.shiftKey) {
            setAdminMode(prev => !prev);
        }
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className="pb-12">
            
            {/* Hero Section */}
            <section className="relative min-h-[80vh] md:min-h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-16 md:pt-20">
                {/* Background Hexagons Pattern */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <div className="absolute top-10 left-10 w-48 h-48 md:w-64 md:h-64 border border-[#FF4D00]/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-64 h-64 md:w-96 md:h-96 border border-blue-500/10 rounded-full blur-3xl"></div>
                    {/* SVG Overlay for tech lines */}
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="hex-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#hex-pattern)" />
                    </svg>
                </div>

                <div className="container px-4 mx-auto relative z-10 text-center">
                    {/* Logo Mark Above Text */}
                    <div className="mx-auto mb-6 md:mb-8 w-16 h-16 md:w-24 md:h-24 flex items-center justify-center relative animate-float">
                         <div className="absolute inset-0 bg-[#FF4D00] blur-[30px] md:blur-[40px] opacity-20 rounded-full"></div>
                         {/* Using the N shape from logo conceptually here */}
                         <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 md:w-16 md:h-16">
                            <path d="M10 30V10L24 24V12" stroke="#E6E6E6" strokeWidth="3" strokeLinecap="square" strokeLinejoin="round"/>
                            <path d="M24 12L30 6M30 6V14M30 6H22" stroke="#FF4D00" strokeWidth="3" strokeLinecap="square" strokeLinejoin="round"/>
                        </svg>
                        <div className="absolute -bottom-4 font-syne font-bold text-[10px] md:text-xs tracking-[0.3em] text-gray-500 whitespace-nowrap">NEXTARC STUDIO</div>
                    </div>

                    <h1 className="font-syne font-black text-5xl sm:text-6xl md:text-8xl lg:text-[9rem] tracking-tighter leading-[0.9] md:leading-[0.85] mb-6 select-none">
                        <span className="block text-white drop-shadow-2xl">CAPTURE</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#FF4D00] to-[#FF8000] drop-shadow-2xl relative pb-2 md:pb-4">
                            THE HYPE
                            {/* Glow effect under text */}
                            <span className="absolute inset-0 blur-3xl bg-[#FF4D00]/20 -z-10"></span>
                        </span>
                    </h1>

                    <p className="font-inter text-sm md:text-lg text-gray-400 mb-8 md:mb-12 max-w-xl mx-auto font-light tracking-wide px-4">
                        The platform where elite athletes hire top-tier creators.<br className="hidden md:block"/>
                        Turn your game into a legacy.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
                        <Button asChild size="lg" className="rounded-full w-full sm:w-auto min-w-[200px] h-12 md:h-14 text-sm md:text-base shadow-[0_0_30px_rgba(255,77,0,0.4)]">
                            <Link to="/post-project">Hire a Creator <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" /></Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full w-full sm:w-auto min-w-[200px] h-12 md:h-14 text-sm md:text-base border-white/20 hover:bg-white/5 hover:border-white/50">
                            <Link to="/browse">Browse Requests</Link>
                        </Button>
                    </div>

                    {/* How It Works Icons */}
                    <div className="mt-16 md:mt-24 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto border-t border-white/5 pt-8 md:pt-12">
                        <HexIcon icon={FileUp} label="Post" />
                        <HexIcon icon={Users} label="Offers" />
                        <HexIcon icon={CreditCard} label="Pay" />
                    </div>
                </div>
            </section>

            {/* Stats Section - Minimal */}
            <section className="border-y border-white/5 bg-[#0A0A0A]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
                        {[
                            { label: 'Community', value: counters?.followers },
                            { label: 'Athletes', value: counters?.athletes },
                            { label: 'Requests', value: counters?.projects },
                            { label: 'Completed', value: counters?.completed },
                        ].map((stat) => (
                            <div key={stat.label} className="py-8 md:py-10 text-center group hover:bg-white/[0.02] transition-colors relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#FF4D00] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="font-syne text-3xl md:text-5xl font-bold text-white group-hover:text-[#FF4D00] transition-colors">
                                    {stat.value?.toLocaleString() ?? '-'}
                                </div>
                                <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] mt-2 md:mt-3 font-bold">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Props - Asymmetric */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#0F0F0F] to-[#050505] border border-white/5 p-8 md:p-12 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4D00]/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-[#FF4D00]/20 transition-colors"></div>
                        <Zap className="text-[#FF4D00] h-10 w-10 mb-6" />
                        <h3 className="font-syne text-2xl md:text-3xl font-bold text-white mb-3 uppercase">Speed & Quality</h3>
                        <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-md">
                            Get high-end content delivered at the speed of social media. Our creators know the game and capture the moments that matter.
                        </p>
                    </div>
                    <div className="col-span-1 bg-[#0A0A0A] border border-white/5 p-8 md:p-12 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-all">
                         <ShieldCheck className="text-white h-10 w-10 mb-6" />
                        <h3 className="font-syne text-xl md:text-2xl font-bold text-white mb-3 uppercase">Secure</h3>
                        <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                            Funds are held safely until you approve the files. No risk, just results. 8% platform fee.
                        </p>
                    </div>
                    <div className="col-span-1 bg-[#0A0A0A] border border-white/5 p-8 md:p-12 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-all">
                         <Users className="text-white h-10 w-10 mb-6" />
                        <h3 className="font-syne text-xl md:text-2xl font-bold text-white mb-3 uppercase">Vetted</h3>
                        <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                           Access a curated network of sports specialists.
                        </p>
                    </div>
                     <div className="col-span-1 md:col-span-2 bg-[#FF4D00] p-8 md:p-12 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between group shadow-[0_0_40px_rgba(255,77,0,0.2)]">
                        <div className="relative z-10 mb-6 md:mb-0">
                             <h3 className="font-syne text-2xl md:text-3xl font-bold text-white mb-2 uppercase">Ready to create?</h3>
                             <p className="text-white/80 mb-8 font-medium">Join the community today.</p>
                             <Button asChild variant="secondary" className="rounded-full px-8 font-bold">
                                <Link to="/signup">Get Started</Link>
                             </Button>
                        </div>
                        <Play className="text-white/20 w-32 h-32 md:w-48 md:h-48 absolute -right-4 -bottom-4 md:-right-8 md:-bottom-8 group-hover:scale-110 transition-transform rotate-12" />
                    </div>
                </div>
            </section>

            <FeaturedCreators />
            
            <div className="py-16 md:py-24">
                 <Testimonials />
            </div>

            {adminMode && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Button variant="destructive" size="sm" onClick={handleResetCounters}>Reset (Admin)</Button>
                </div>
            )}
        </div>
    );
};

export default HomePage;
