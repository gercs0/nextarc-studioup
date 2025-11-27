
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCreators } from '../hooks/useCreators';
import { useAuth } from '../hooks/useAuth';
import Rating from '../components/ui/Rating';
import { Button } from '../components/ui/Button';
import { ArrowLeft, MessageSquare, Briefcase, CheckCircle, Loader2 } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { cn, calculateLeague } from '../lib/utils';
import { LeagueBadge } from '../components/ui/LeagueBadge';

const AvailabilityIndicator: React.FC<{ availability?: string }> = ({ availability }) => {
    const statusStyles: { [key: string]: { text: string; bg: string; dot: string } } = {
        'Available': { text: 'text-green-400', bg: 'bg-green-900/50', dot: 'bg-green-500' },
        'Booked Up': { text: 'text-yellow-400', bg: 'bg-yellow-900/50', dot: 'bg-yellow-500' },
        'On Vacation': { text: 'text-gray-400', bg: 'bg-neutral-700/50', dot: 'bg-gray-500' },
    };

    const style = statusStyles[availability || ''] || statusStyles['On Vacation'];

    return (
        <div className={cn("inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium", style.bg, style.text)}>
            <div className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
            {availability}
        </div>
    );
};

const CreatorProfilePage: React.FC = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const navigate = useNavigate();
  const { getCreatorById, loading: creatorsLoading } = useCreators();
  const { getUserById, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  
  const richCreatorProfile = creatorId ? getCreatorById(creatorId) : undefined;
  const userAsCreator = creatorId ? getUserById(creatorId) : undefined;

  const isLoading = creatorsLoading || authLoading || projectsLoading;

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-[#FF4D00]" />
        </div>
    );
  }

  const creatorExists = richCreatorProfile || (userAsCreator && userAsCreator.role === 'creator');

  const completedProjectsCount = creatorId ? projects.filter(p => 
      p.status === 'completed' && 
      p.acceptedOfferId && 
      p.offers.find(o => o.id === p.acceptedOfferId)?.creatorId === creatorId
  ).length : 0;

  if (!creatorExists) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">Creator not found</h1>
        <p className="mt-6 text-base leading-7 text-gray-300">Sorry, we couldn’t find a creator with that ID.</p>
        <div className="mt-10">
          <Button asChild>
            <Link to="/browse">Browse Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  const displayProfile = richCreatorProfile 
    ? {
        ...richCreatorProfile,
        league: calculateLeague(richCreatorProfile)
      }
    : {
        username: userAsCreator!.name,
        profilePictureUrl: `https://i.pravatar.cc/150?u=${userAsCreator!.id}`,
        rating: 0,
        ratingsCount: 0,
        bio: 'This creator has not set up their bio yet.',
        reviews: [],
        portfolio: [],
        availability: 'Available',
        isPro: false,
        league: 'Rookie' as const
      };

  return (
    <div>
      <div className="mb-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8 md:flex md:space-x-8">
        <div className="md:w-1/3 text-center md:text-left">
          <img 
            src={displayProfile.profilePictureUrl} 
            alt={displayProfile.username} 
            className="w-40 h-40 rounded-full mx-auto md:mx-0 object-cover border-4 border-neutral-700 bg-neutral-700"
          />
          <h1 className="text-3xl font-bold text-white mt-4 flex items-center justify-center md:justify-start gap-3">
              {displayProfile.username}
          </h1>
          <div className="mt-2 flex flex-col md:flex-row gap-2 items-center md:items-start">
             <LeagueBadge league={displayProfile.league} />
             <AvailabilityIndicator availability={displayProfile.availability} />
          </div>

          <div className="mt-4 flex items-center justify-center md:justify-start space-x-2">
            <Rating value={displayProfile.rating} readonly={true} />
            <span className="text-gray-400">({displayProfile.ratingsCount} ratings)</span>
          </div>
           <div className="mt-4 flex justify-center md:justify-start gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{completedProjectsCount} Projects Completed</span>
                </div>
            </div>
        </div>
        <div className="md:w-2/3 mt-8 md:mt-0">
          <h2 className="text-2xl font-semibold text-[#FF4D00]">Bio</h2>
          <p className="text-gray-300 mt-2 text-lg">{displayProfile.bio}</p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <Briefcase className="mr-3 h-6 w-6" /> Portfolio
        </h2>
        {displayProfile.portfolio.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayProfile.portfolio.map(item => (
                    <div key={item.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden group">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-white">{item.title}</h3>
                            <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
             <div className="text-center py-12 border-2 border-dashed border-neutral-800 rounded-lg">
                  <Briefcase className="mx-auto h-10 w-10 text-gray-500" />
                  <h3 className="mt-4 text-lg font-semibold text-white">Portfolio is Empty</h3>
                  <p className="mt-1 text-gray-400">This creator has not added any portfolio items yet.</p>
              </div>
        )}
      </div>
      
      <div className="mt-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Project History & Reviews</h2>
          {displayProfile.reviews.length > 0 ? (
              <div className="space-y-6">
                  {displayProfile.reviews.map(review => (
                      <div key={review.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                          <div className="flex justify-between items-start">
                              <div>
                                 <h3 className="font-bold text-lg text-white">{review.projectName}</h3>
                                 <p className="text-sm text-gray-400">by {review.athleteName}</p>
                              </div>
                              <Rating value={review.rating} readonly={true} size={20} />
                          </div>
                          <p className="mt-4 text-gray-300 italic">"{review.comment}"</p>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="text-center py-12 border-2 border-dashed border-neutral-800 rounded-lg">
                  <MessageSquare className="mx-auto h-10 w-10 text-gray-500" />
                  <h3 className="mt-4 text-lg font-semibold text-white">No Reviews Yet</h3>
                  <p className="mt-1 text-gray-400">This creator hasn't completed any projects on NextArc yet.</p>
              </div>
          )}
      </div>

    </div>
  );
};

export default CreatorProfilePage;