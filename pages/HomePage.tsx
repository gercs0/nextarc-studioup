import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Counters } from '../types';
import { getLiveCounters, resetCounters } from '../services/countersService';
import { Zap, ShieldCheck, Users } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import FeaturedCreators from '../components/FeaturedCreators';
import Testimonials from '../components/Testimonials';

const HomePage: React.FC = () => {
    const [counters, setCounters] = useState<Counters | null>(null);
    const [adminMode, setAdminMode] = useState(false);

    useEffect(() => {
        const fetchAndSetCounters = async () => {
            const data = await getLiveCounters();
            setCounters(data);
        };

        fetchAndSetCounters();
        const interval = setInterval(fetchAndSetCounters, 5000); // "Live" update
        return () => clearInterval(interval);
    }, []);

    const handleResetCounters = () => {
        if (window.confirm("Are you sure you want to reset all counters to their initial values?")) {
            resetCounters();
            window.location.reload();
        }
    };
    
    // Secret key combo to show reset button
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if(e.key === 'R' && e.ctrlKey && e.shiftKey) {
            setAdminMode(prev => !prev);
        }
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, []);

    const counterItems = [
        { label: 'Followers', value: counters?.followers },
        { label: 'Athletes', value: counters?.athletes },
        { label: 'Projects', value: counters?.projects },
        { label: 'Completed', value: counters?.completed },
    ];

    const valueProps = [
        { icon: Zap, title: "Speed & Quality", description: "Connect with elite creators who deliver stunning content on your timeline." },
        { icon: ShieldCheck, title: "Secure Payments", description: "Escrow-like system ensures you only pay when you're satisfied with the work." },
        { icon: Users, title: "Sports Focused", description: "A curated community of creators who understand the language of sports." },
    ];

    const howItWorksSteps = [
        { number: "01", title: "Post Your Project", description: "Detail your content needs, budget, and deadline. It's free and takes minutes." },
        { number: "02", title: "Receive Offers", description: "Top creators submit their proposals. Compare and choose the best fit." },
        { number: "03", title: "Collaborate & Pay", description: "Work directly with your chosen creator and release payment upon completion." },
    ];

    return (
        <div className="space-y-24 md:space-y-32">
            {/* Hero Section */}
            <section className="text-center pt-16 pb-8 relative">
                <div className="absolute inset-0 -z-10 bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white uppercase">
                    Your Vision. Their Talent.
                    <br />
                    <span className="text-[#FF4D00] ember-glow">Next Level Content.</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
                    The exclusive marketplace where professional athletes and elite content creators build the future of sports media.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild size="lg">
                        <Link to="/post-project">Post a Project</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link to="/browse">Browse Projects</Link>
                    </Button>
                </div>
            </section>

            {/* Global Counters */}
            <section>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                    {counterItems.map(item => (
                        <div key={item.label} className="text-center p-4 bg-neutral-900/30 rounded-lg">
                            {item.value !== undefined ? (
                                <p className="text-4xl md:text-5xl font-bold text-[#FF4D00]">{item.value.toLocaleString()}+</p>
                            ) : (
                                <Skeleton className="h-12 w-32 mx-auto" />
                            )}
                            <p className="mt-2 text-sm text-gray-400 uppercase tracking-wider">{item.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Value Propositions */}
            <section className="max-w-5xl mx-auto text-center">
                 <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">The Ultimate Playbook for Content Creation</h2>
                 <p className="mt-4 text-lg text-gray-400">NextArc is more than a platform—it's your competitive edge.</p>
                <div className="mt-12 grid md:grid-cols-3 gap-8">
                    {valueProps.map(prop => (
                        <div key={prop.title} className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                            <prop.icon className="h-10 w-10 text-[#FF4D00] mx-auto" />
                            <h3 className="mt-4 text-xl font-semibold text-white">{prop.title}</h3>
                            <p className="mt-2 text-gray-400">{prop.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section>
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How It Works</h2>
                    <p className="mt-4 text-lg text-gray-400">Get your project rolling in three simple steps.</p>
                </div>
                <div className="mt-12 grid md:grid-cols-3 gap-8 text-left relative">
                     <div className="absolute top-1/2 left-0 w-full h-px bg-neutral-700 hidden md:block" />
                     {howItWorksSteps.map((step, index) => (
                        <div key={index} className="relative p-6 bg-[#050810]">
                            <span className="text-6xl font-black text-neutral-800 absolute -top-4 -left-2">{step.number}</span>
                            <h3 className="text-xl font-bold text-white relative z-10">{step.title}</h3>
                            <p className="mt-2 text-gray-400 relative z-10">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            
            <FeaturedCreators />

            <Testimonials />

            {adminMode && (
                <div className="text-center">
                    <Button variant="destructive" onClick={handleResetCounters}>Reset Counters (Admin)</Button>
                </div>
            )}
        </div>
    );
};

export default HomePage;