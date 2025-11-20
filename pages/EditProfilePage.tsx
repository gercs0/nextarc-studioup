
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCreators } from '../hooks/useCreators';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { UploadCloud, X, Loader2, User } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { fileToBase64 } from '../lib/utils';
import { Select } from '../components/ui/Select';

const profileSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  bio: z.string().max(300, "Bio cannot exceed 300 characters").optional(),
  availability: z.string(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const availabilityOptions = ['Available', 'Booked Up', 'On Vacation'];

const EditProfilePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { getCreatorById, updateCreatorProfile, updateAvailability } = useCreators();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const creatorProfile = currentUser ? getCreatorById(currentUser.id) : null;

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (creatorProfile) {
            setValue('username', creatorProfile.username);
            setValue('bio', creatorProfile.bio);
            setValue('availability', creatorProfile.availability || 'Available');
            setPreview(creatorProfile.profilePictureUrl);
        }
    }, [creatorProfile, setValue]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            const base64Preview = await fileToBase64(selectedFile);
            setPreview(base64Preview);
        }
    };

    const removeFile = () => {
        setFile(null);
        setPreview(creatorProfile?.profilePictureUrl || null);
    };

    const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
        if (!currentUser || !creatorProfile) {
            addToast('You must be logged in as a creator.', 'error');
            return;
        }

        setIsSubmitting(true);
        addToast('Updating profile...', 'info');

        try {
            let newProfilePictureUrl = creatorProfile.profilePictureUrl;
            if (file) {
                newProfilePictureUrl = await uploadToCloudinary(file);
            }

            const profileUpdateData = {
                username: data.username,
                bio: data.bio,
                profilePictureUrl: newProfilePictureUrl,
            };

            updateCreatorProfile(currentUser.id, profileUpdateData);
            updateAvailability(currentUser.id, data.availability);
            
            addToast('Profile updated successfully!', 'success');
            navigate(`/creator/${currentUser.id}`);
        } catch (error) {
            console.error("Profile update failed:", error);
            addToast('Failed to update profile. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (!currentUser || currentUser.role !== 'creator') {
        return (
            <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-lg">
                <User className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-4 text-xl font-semibold text-white">Access Denied</h3>
                <p className="mt-2 text-gray-400">Only verified creators can edit their profile.</p>
                <Button asChild className="mt-6">
                    <Link to="/browse">Browse Projects</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
             <div className="text-center mb-12">
                <h1 className="text-4xl font-black tracking-tighter text-white">Edit Your Profile</h1>
                <p className="mt-2 text-lg text-gray-400">Craft your public persona. This is what athletes will see.</p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <img src={preview || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt="Profile" className="h-24 w-24 rounded-full object-cover bg-neutral-700" />
                            {file && (
                                <button type="button" onClick={removeFile} className="absolute -top-1 -right-1 bg-red-600 rounded-full p-1 text-white">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <div>
                             <label htmlFor="pfp-upload" className="cursor-pointer">
                                <Button asChild variant="outline">
                                   <span>
                                     <UploadCloud className="mr-2 h-4 w-4" /> Change Picture
                                   </span>
                                </Button>
                                <input id="pfp-upload" name="pfp-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                            </label>
                            <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB.</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                            <Input id="username" {...register("username")} placeholder="Your professional name" />
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="availability" className="block text-sm font-medium text-gray-300 mb-1">Availability Status</label>
                            <Select id="availability" {...register("availability")}>
                                {availabilityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </Select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                        <Textarea id="bio" {...register("bio")} rows={5} placeholder="Tell athletes about your skills, experience, and what makes you stand out." />
                        {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
                    </div>
                     <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfilePage;
