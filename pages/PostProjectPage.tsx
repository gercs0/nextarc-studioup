
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
                <h3 className="mt-4 text-xl font-semibold text-white">Please Log In</h3>
                <p className="mt-2 text-gray-400">Only registered athletes can post requests.</p>
                <Button asChild className="mt-6">
                    <Link to="/login">Log In</Link>
                </Button>
            </div>
        );
    }

    if (currentUser.role !== 'athlete') {
         return (
            <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-lg">
                <User className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-4 text-xl font-semibold text-white">Athletes Only</h3>
                <p className="mt-2 text-gray-400">Your account is registered as a creator. To hire talent, please use an athlete account.</p>
                 <Button asChild className="mt-6" variant="outline">
                    <Link to="/browse">Browse Requests</Link>
                </Button>
            </div>
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles].slice(0, 5)); 
            
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
            addToast('You must be logged in.', 'error');
            return;
        }

        setIsUploading(true);
        addToast('Posting request...', 'info');

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

            addToast('Request posted!', 'success');
            navigate('/dashboard');

        } catch (error) {
            console.error("Submission failed:", error);
            addToast('Failed to post. Try again.', 'error');
        } finally {
            setIsUploading(false);
        }
    };
    
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2 className="font-syne text-2xl font-bold mb-6 text-white">The Basics</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Your Name</label>
                                <Input {...register("athleteName")} readOnly className="cursor-not-allowed bg-neutral-800 text-gray-500"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                                <Input {...register("email")} type="email" readOnly className="cursor-not-allowed bg-neutral-800 text-gray-500"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Instagram (optional)</label>
                                <Input {...register("instagramHandle")} placeholder="@yourhandle" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Sport</label>
                                <Select {...register("sport")}>
                                    <option value="">Select Sport</option>
                                    {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </Select>
                                {errors.sport && <p className="text-red-500 text-xs mt-1">{errors.sport.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">What do you need?</label>
                                <Select {...register("serviceType")}>
                                     <option value="">Select Service</option>
                                     {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </Select>
                                {errors.serviceType && <p className="text-red-500 text-xs mt-1">{errors.serviceType.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Budget ($)</label>
                                <Input {...register("budget", { valueAsNumber: true })} type="number" placeholder="1000"/>
                                {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Deadline</label>
                                <Input {...register("deadline")} type="date" />
                                {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                                <Textarea id="description" {...register("description")} rows={5} placeholder="Describe your vision. What kind of content do you need?"/>
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                     <div>
                        <h2 className="font-syne text-2xl font-bold mb-2 text-white">Add Visuals</h2>
                        <p className="text-gray-400 mb-6">Upload photos or videos to give creators an idea of what you want (mood board, raw footage, etc).</p>
                        <div className="border-2 border-dashed border-neutral-700 hover:border-[#FF4D00] transition-colors rounded-xl p-10 text-center bg-neutral-900/50">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-500 mb-4"/>
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <span className="bg-[#FF4D00] text-white px-4 py-2 rounded-full font-medium hover:bg-[#e04400] transition-colors">Choose Files</span>
                                <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept="image/*,video/mp4" />
                            </label>
                            <p className="text-xs text-gray-500 mt-4">PNG, JPG, MP4 up to 10MB</p>
                        </div>
                        {previews.length > 0 && (
                            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative group aspect-video rounded-lg overflow-hidden">
                                        <img src={src} alt="preview" className="w-full h-full object-cover" />
                                        <button onClick={() => removeFile(index)} className="absolute top-2 right-2 bg-black/70 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
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
                        <h2 className="font-syne text-2xl font-bold mb-6 text-white">Review Request</h2>
                         <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl space-y-4">
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Service</p>
                                    <p className="text-white font-medium">{values.serviceType}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Budget</p>
                                    <p className="text-[#FF4D00] font-bold">${values.budget}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Sport</p>
                                    <p className="text-white font-medium">{values.sport}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Deadline</p>
                                    <p className="text-white font-medium">{new Date(values.deadline + 'T00:00:00').toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-neutral-800">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Description</p>
                                <p className="text-gray-300">{values.description}</p>
                            </div>
                             {previews.length > 0 && (
                                <div className="pt-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Attachments</p>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {previews.map((src, index) => <img key={index} src={src} className="h-16 w-24 object-cover rounded-md border border-neutral-800" />)}
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
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="font-syne text-4xl md:text-5xl font-black text-white">Post a Request</h1>
                <p className="mt-2 text-lg text-gray-400">Tell us what you need. We'll notify the pros.</p>
            </div>

            <div className="bg-[#0A0A0A] border border-neutral-800 rounded-2xl p-8 shadow-2xl">
                {/* Simple Steps */}
                <div className="flex justify-between mb-8 px-4">
                    {['Details', 'Visuals', 'Review'].map((label, i) => (
                        <div key={label} className={`text-sm font-medium transition-colors ${step > i ? 'text-[#FF4D00]' : step === i + 1 ? 'text-white' : 'text-gray-600'}`}>
                            0{i+1}. {label}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {renderStepContent()}
                    <div className="mt-8 pt-6 flex justify-between">
                        <Button type="button" variant="ghost" onClick={prevStep} disabled={step === 1 || isUploading} className="text-gray-400 hover:text-white">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        {step < 3 ? (
                            <Button type="button" onClick={nextStep} disabled={isUploading}>
                                Next Step
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isUploading} className="bg-white text-black hover:bg-gray-200">
                                {isUploading ? 'Posting...' : 'Post Request'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostProjectPage;