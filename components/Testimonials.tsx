import React from 'react';

const testimonials = [
    {
        quote: "NextArc connected me with a creator who understood my vision instantly. The highlight reel they produced was fire and got insane engagement. Total game-changer.",
        name: "Jalen 'Jet' Carter",
        title: "Pro Basketball Player",
        avatar: "https://i.pravatar.cc/150?u=jalen-carter",
    },
    {
        quote: "As a creator, finding serious athletes who value quality work can be tough. NextArc cuts through the noise. I've landed three major projects here that have been career highlights.",
        name: "Elena Rodriguez",
        title: "Lead Videographer, PixelPerfect",
        avatar: "https://i.pravatar.cc/150?u=elena-rodriguez",
    },
    {
        quote: "The payment system is seamless and secure. I funded the project, collaborated, and only released the payment when I was 100% happy. It's the professionalism I was looking for.",
        name: "Marcus Thorne",
        title: "Champion Sprinter",
        avatar: "https://i.pravatar.cc/150?u=marcus-thorne",
    },
];

const Testimonials: React.FC = () => {
    return (
        <section className="relative overflow-hidden">
             <div className="absolute inset-0 -z-10 bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <div className="max-w-7xl mx-auto">
                 <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Why the Pros Choose Us</h2>
                    <p className="mt-4 text-lg text-gray-400">Don't just take our word for it. Here's what our users are saying.</p>
                </div>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <figure key={index} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                            <blockquote className="text-gray-300">
                                <p>"“{testimonial.quote}”"</p>
                            </blockquote>
                            <figcaption className="mt-6 flex items-center gap-x-4">
                                <img className="h-12 w-12 rounded-full bg-neutral-700" src={testimonial.avatar} alt="" />
                                <div>
                                    <div className="font-semibold text-white">{testimonial.name}</div>
                                    <div className="text-gray-400">{testimonial.title}</div>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    )
};

export default Testimonials;
