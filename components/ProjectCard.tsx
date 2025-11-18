import React, { useState } from 'react';
import { Project } from '../../types';
import { Calendar, DollarSign, Bookmark, CheckCircle, Star, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { Button } from './ui/Button';

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
        addToast('Project unsaved!', 'success');
    } else {
        await saveProject(project.id);
        addToast('Project saved to your dashboard!', 'success');
    }
    setIsSaving(false);
  };

  const handleCardClick = () => {
      navigate(`/project/${project.id}`);
  }

  return (
    <div onClick={handleCardClick} className="cursor-pointer bg-neutral-900/50 border border-neutral-800 rounded-lg transition-all duration-300 hover:border-[#FF4D00]/50 hover:shadow-2xl hover:shadow-[#FF4D00]/10 group relative overflow-hidden">
      {project.isFeatured && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-black px-3 py-1 text-xs font-bold rounded-bl-lg flex items-center z-10">
          <Star className="h-3 w-3 mr-1" /> FEATURED
        </div>
      )}
      <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${project.images[0] || 'https://picsum.photos/400/200?grayscale'})` }}>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start">
            <div>
                 <p className="text-sm text-gray-400 flex items-center">
                    {project.sport}
                    {athlete?.isVerified && <CheckCircle className="h-4 w-4 ml-2 text-blue-400" title="Verified Athlete" />}
                 </p>
                 <h3 className="text-lg font-bold text-white truncate group-hover:text-[#FF4D00] transition-colors">{project.serviceType}</h3>
            </div>
            <div className="flex items-center text-lg font-bold text-green-400 bg-green-900/50 px-3 py-1 rounded-full">
                <DollarSign size={16} className="mr-1"/> {project.budget}
            </div>
        </div>
        <p className="text-sm text-gray-400 mt-2 h-10 overflow-hidden">{project.description}</p>
        <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-between items-center text-sm text-gray-400">
            <div className="flex items-center">
                <Calendar size={14} className="mr-2" />
                <span>Deadline: {new Date(project.deadline + 'T00:00:00').toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
                 {currentUser?.role === 'creator' && (
                    <Button variant="ghost" size="icon" onClick={handleSaveToggle} disabled={isSaving} className="h-8 w-8 hover:bg-neutral-700">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className={`h-4 w-4 ${isSaved ? 'text-[#FF4D00] fill-current' : 'text-gray-400'}`} />}
                    </Button>
                )}
                <span className="text-sm font-semibold text-[#FF4D00] flex items-center group-hover:underline">
                   View Project
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;