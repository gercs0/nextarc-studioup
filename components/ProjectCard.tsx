
import React, { useState } from 'react';
import { Project } from '../types';
import { Calendar, DollarSign, Bookmark, CheckCircle, ArrowRight, MapPin, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { currentUser, getUserById, saveProject, unsaveProject } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const athlete = getUserById(project.ownerId);
  const isSaved = currentUser?.savedProjects?.includes(project.id);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser || currentUser.role !== 'creator') {
        addToast('Only creators can save projects.', 'info');
        return;
    }
    
    setIsSaving(true);
    if (isSaved) {
        await unsaveProject(project.id);
        addToast('Request unsaved!', 'success');
    } else {
        await saveProject(project.id);
        addToast('Request saved!', 'success');
    }
    setIsSaving(false);
  };

  const handleCardClick = () => {
      navigate(`/project/${project.id}`);
  }

  return (
    <div 
      onClick={handleCardClick} 
      className={cn(
          "group relative w-full bg-[#0A0A0A] rounded-2xl overflow-hidden cursor-pointer border transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,77,0,0.1)]",
          project.isInternalProduction ? "border-[#FFD700]/50 hover:border-[#FFD700]" : "border-white/5 hover:border-[#FF4D00]/30"
      )}
    >
      {/* Image Header */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
            src={project.images[0] || 'https://picsum.photos/400/300?grayscale'} 
            alt={project.serviceType}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0 grayscale-[50%] opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />
        
        {/* Internal Production Badge */}
        {project.isInternalProduction && (
             <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#FFD700] text-black text-[10px] font-bold px-4 py-1 rounded-b-lg shadow-[0_0_15px_rgba(255,215,0,0.5)] z-20 flex items-center gap-1 uppercase tracking-widest">
                <Zap size={10} fill="black" /> Official Production
             </div>
        )}

        {/* Sport Tag */}
        <div className="absolute top-4 left-4">
             <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 group-hover:border-[#FF4D00]/50 transition-colors">
                {project.sport}
             </span>
        </div>

        {/* Save Button */}
        <div className="absolute top-4 right-4 z-10">
             {currentUser?.role === 'creator' && (
                <button 
                    onClick={handleSaveToggle}
                    disabled={isSaving}
                    className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-[#FF4D00] transition-colors border border-white/10"
                >
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-white text-white' : 'text-white'}`} />
                </button>
            )}
        </div>
        
        {/* Price Tag overlay on image */}
        <div className="absolute bottom-4 right-4">
            <div className={cn(
                "flex items-center text-white font-bold px-3 py-1.5 rounded-lg shadow-lg",
                project.isInternalProduction ? "bg-[#FFD700] text-black" : "bg-[#FF4D00]"
            )}>
                <DollarSign size={14} strokeWidth={3} className="mr-0.5"/> 
                <span className="text-sm font-syne">{project.budget}</span>
            </div>
        </div>
      </div>
      
      {/* Content Body */}
      <div className="p-6 relative">
        <div className="mb-4">
             <h3 className={cn(
                 "font-syne text-xl font-bold transition-colors leading-tight mb-2 truncate",
                 project.isInternalProduction ? "text-[#FFD700]" : "text-white group-hover:text-[#FF4D00]"
             )}>
                {project.serviceType}
             </h3>
             <div className="flex items-center text-xs font-medium text-gray-400">
                <span className="text-white mr-1">{athlete?.name}</span>
                {athlete?.isVerified && <CheckCircle className="h-3 w-3 text-[#FF4D00]" />}
             </div>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-6 h-10 leading-relaxed">
            {project.description}
        </p>
        
        <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <div className="flex items-center text-xs text-gray-500 font-medium">
                <Calendar size={12} className="mr-1.5 text-gray-600" />
                <span>Due {new Date(project.deadline + 'T00:00:00').toLocaleDateString()}</span>
            </div>
            <div className="text-[#FF4D00] text-xs font-bold uppercase tracking-wide flex items-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                Details <ArrowRight size={12} className="ml-1" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
