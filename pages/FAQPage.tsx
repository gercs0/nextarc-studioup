
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onClick }) => {
  return (
    <div className="border-b border-neutral-800">
      <h2>
        <button
          type="button"
          className="flex items-center justify-between w-full py-5 font-semibold text-left text-gray-200"
          onClick={onClick}
          aria-expanded={isOpen}
        >
          <span>{title}</span>
          <ChevronDown className={cn("w-6 h-6 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>
      </h2>
      <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", isOpen ? "max-h-96" : "max-h-0")}>
        <div className="pb-5 text-gray-400">
          {children}
        </div>
      </div>
    </div>
  );
};

const FAQPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqData = [
        {
            question: "What is NextArc Studio?",
            answer: "NextArc Studio is a marketplace designed to connect professional athletes with talented content creators for high-quality digital media projects, such as highlight reels, social media content, and documentaries."
        },
        {
            question: "How does payment work?",
            answer: "When an athlete accepts an offer, they pay the agreed amount plus a platform fee. The funds are held securely until the project is marked as complete by the athlete. This ensures creators are paid for their work and athletes receive the content they commissioned."
        },
        {
            question: "What is the platform fee?",
            answer: "We charge a transparent 8% platform fee on top of the creator's offer amount. This fee covers secure payment processing, platform maintenance, and customer support."
        },
        {
            question: "Can I upload any type of file for my project brief?",
            answer: "Currently, we support image files (PNG, JPG) and short video clips (MP4) up to 10MB each to be used as reference material for your project brief."
        },
        {
            question: "What happens after I accept an offer?",
            answer: "After you successfully complete the payment, the project status changes to 'In Progress'. You can then communicate with the creator directly (off-platform for the MVP) to collaborate. Once you are satisfied with the final delivery, you can mark the project as 'Completed' on your 'My Projects' dashboard."
        }
    ];

    const handleItemClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black tracking-tighter text-white">Frequently Asked Questions</h1>
                <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-400">Have questions? We've got answers.</p>
            </div>
            <div className="space-y-2">
                {faqData.map((item, index) => (
                    <AccordionItem 
                        key={index}
                        title={item.question}
                        isOpen={openIndex === index}
                        onClick={() => handleItemClick(index)}
                    >
                        <p>{item.answer}</p>
                    </AccordionItem>
                ))}
            </div>
        </div>
    );
};

export default FAQPage;
