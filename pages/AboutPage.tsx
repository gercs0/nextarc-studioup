
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h1 className="text-4xl font-black tracking-tighter text-white">About NextArc Studio</h1>
      <p className="mt-4 text-lg text-gray-300">
        NextArc Studio was founded on a simple principle: every athlete has a story, and every story deserves to be told with excellence. In today's digital age, compelling content is not a luxury—it's a necessity for building a brand, engaging with fans, and creating a legacy.
      </p>
      <p className="mt-4 text-lg text-gray-300">
        We saw a gap between the world-class talent on the field and the specialized creative talent needed to capture their moments. NextArc is the bridge. We've built a curated, streamlined marketplace where athletes can easily commission high-quality content from a community of creators who live and breathe sports.
      </p>
      <p className="mt-6 font-semibold text-xl text-[#FF4D00]">
        Our mission is to empower athletes and creators to achieve their best work, together.
      </p>
      <img src="https://picsum.photos/800/400?grayscale" alt="Team at work" className="mt-8 rounded-lg mx-auto" />
    </div>
  );
};

export default AboutPage;
