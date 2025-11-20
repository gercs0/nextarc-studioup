
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useToast } from '../hooks/useToast';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { sendDiscordNotification } from '../services/discordService';
import { incrementCounter } from '../services/countersService';
import { SPORT_OPTIONS, SERVICE_OPTIONS } from '../constants';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { UploadCloud, X, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const projectSchema = z.object({
  athleteName: z.string().min(2, "Name is required"),
  instagramHandle: z.string().optional(),
  email: z.string().email("Invalid email address"),
  sport: z.string().min(1, "Please select a sport"),
  serviceType: z.string().min(1, "Please select a service"),
  budget: z.number().min(1, "Budget must be at least $1"),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const PostProjectPage: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    
    const { addProject } = useProjects();
    const { addToast } = useToast();

    const { register, handleSubmit, formState: { errors }, trigger, getValues, setValue } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        mode: 'onChange',
    });
    
    useEffect(() => {
        if(currentUser) {
            setValue('athleteName', currentUser.name);
            setValue('email', currentUser.email);
        }
    }, [currentUser, setValue]);

    if (!currentUser) {
         return (
            <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-lg">
                <User className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-4 text-xl font-semibold text-white">Please Log In to Post a Project</h3>
                <p className="mt-2 text-gray-400">Only registered athletes can create new project briefs.</p>
                <Button asChild className="mt-6">
                    <Link to="/login">Log In or Sign Up</Link>
                </Button>
            </div>
        );
    }

    if (currentUser.role !== 'athlete') {
         return (
            <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-lg">
                <User className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-4 text-xl font-semibold text-white">Only Athletes Can Post Projects</h3>
                <p className="mt-2 text-gray-400">Your account is registered as a creator. To post a project, please use an athlete account.</p>
                 <Button asChild className="mt-6" variant="outline">
                    <Link to="/browse">Browse Projects</Link>
                </Button>
            </div>
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles].slice(0, 5)); // Limit to 5 files
            
            const newPreviews = newFiles.map(file => URL.createObjectURL(file as Blob));
            setPreviews(prev => [...prev, ...newPreviews].slice(0, 5));
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const nextStep = async () => {
        const isValid = await trigger();
        if (isValid) {
            setStep(prev => prev + 1);
        }
    };

    const prevStep = () => setStep(prev => prev - 1);

    const onSubmit: SubmitHandler<ProjectFormData> = async (data) => {
        if (!currentUser) {
            addToast('You must be logged in to post a project.', 'error');
            return;
        }

        setIsUploading(true);
        addToast('Submitting your project...', 'info');

        try {
            const imageUrls = await Promise.all(files.map(file => uploadToCloudinary(file)));
            
            const newProjectData = {
                ...data,
                images: imageUrls,
                ownerId: currentUser.id,
            };
            const tempId = `proj_${Date.now()}`;
            addProject(newProjectData);
            
            await sendDiscordNotification({...newProjectData, id: tempId });

            await Promise.all([
                incrementCounter('projects'),
            ]);

            addToast('Project posted successfully!', 'success');
            navigate('/dashboard');

        } catch (error) {
            console.error("Project submission failed:", error);
            addToast('Failed to post project. Please try again.', 'error');
        } finally {
            setIsUploading(false);
        }
    };
    
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Project Details</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Name</label>
                                <Input {...register("athleteName")} placeholder="Michael Jordan" readOnly className="cursor-not-allowed bg-neutral-800"/>
                                {errors.athleteName && <p className="text-red-500 text-xs mt-1">{errors.athleteName.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <Input {...register("email")} placeholder="athlete@example.com" type="email" readOnly className="cursor-not-allowed bg-neutral-800"/>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Instagram Handle (optional)</label>
                                <Input {...register("instagramHandle")} placeholder="@yourhandle" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Sport</label>
                                <Select {...register("sport")}>
                                    <option value="">Select a sport</option>
                                    {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </Select>
                                {errors.sport && <p className="text-red-500 text-xs mt-1">{errors.sport.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Service Needed</label>
                                <Select {...register("serviceType")}>
                                     <option value="">Select a service</option>
                                     {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </Select>
                                {errors.serviceType && <p className="text-red-500 text-xs mt-1">{errors.serviceType.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Budget ($)</label>
                                <Input {...register("budget", { valueAsNumber: true })} type="number" placeholder="1000"/>
                                {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Deadline</label>
                                <Input {...register("deadline")} type="date" />
                                {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium mb-1">Project Brief</label>
                                <Textarea id="description" {...register("description")} rows={5} placeholder="Describe your vision, content style, and any specific requirements."/>
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                     <div>
                        <h2 className="text-2xl font-bold mb-4">Upload Media</h2>
                        <p className="text-gray-400 mb-4">Add up to 5 images or short video clips for reference (e.g., mood board, existing footage).</p>
                        <div className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400"/>
                            <label htmlFor="file-upload" className="mt-4 cursor-pointer font-semibold text-[#FF4D00] hover:text-[#FF4D00]/90">
                                <span>Upload files</span>
                                <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept="image/*,video/mp4" />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>
                        {previews.length > 0 && (
                            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative group">
                                        <img src={src} alt="preview" className="h-24 w-full object-cover rounded-md" />
                                        <button onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 3:
                const values = getValues();
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Review & Submit</h2>
                         <div className="space-y-4 bg-neutral-900/50 p-6 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <p><strong>Athlete:</strong> {values.athleteName}</p>
                                <p><strong>Sport:</strong> {values.sport}</p>
                                <p><strong>Service:</strong> {values.serviceType}</p>
                                <p><strong>Budget:</strong> ${values.budget}</p>
                                <p><strong>Deadline:</strong> {new Date(values.deadline + 'T00:00:00').toLocaleDateString()}</p>
                            </div>
                             <p><strong>Description:</strong> {values.description}</p>
                             {previews.length > 0 && (
                                <div>
                                    <strong>Media:</strong>
                                    <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
                                        {previews.map((src, index) => <img key={index} src={src} className="h-16 w-full object-cover rounded-md" />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black tracking-tighter text-white">Post a Project</h1>
                <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-400">Bring your vision to life. Fill out the details below to attract top creators.</p>
            </div>

            <div className="max-w-4xl mx-auto bg-neutral-900 border border-neutral-800 rounded-lg p-8">
                {/* Progress Bar */}
                <div className="mb-8">
                     <div className="flex justify-between items-center mb-2">
                         <span className={`w-1/3 text-center text-sm ${step >= 1 ? 'text-white' : 'text-gray-500'}`}>Details</span>
                         <span className={`w-1/3 text-center text-sm ${step >= 2 ? 'text-white' : 'text-gray-500'}`}>Media</span>
                         <span className={`w-1/3 text-center text-sm ${step >= 3 ? 'text-white' : 'text-gray-500'}`}>Review</span>
                     </div>
                     <div className="relative h-1 bg-neutral-700 rounded-full">
                        <div className="absolute top-0 left-0 h-1 bg-[#FF4D00] rounded-full transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }}></div>
                     </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {renderStepContent()}
                    <div className="mt-8 pt-6 border-t border-neutral-700 flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1 || isUploading}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        {step < 3 ? (
                            <Button type="button" onClick={nextStep} disabled={isUploading}>
                                Next
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isUploading}>
                                {isUploading ? 'Submitting...' : 'Confirm & Post'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostProjectPage;
