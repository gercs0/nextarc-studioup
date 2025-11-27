
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../hooks/useToast';
import { User } from '../types';
import { Button } from '../components/ui/Button';
import { UserCheck, Users, Clock, LogOut } from 'lucide-react';

const AdminPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { getAllUsers, verifyCreator } = useAuth();
    const { addNotification } = useNotifications();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            addToast('Failed to load users.', 'error');
        } finally {
            setLoading(false);
        }
    }, [getAllUsers, addToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleLogout = () => {
        localStorage.removeItem('isAdminAuthenticated');
        addToast('Logged out from admin panel.', 'info');
        navigate('/login?admin=true');
    };

    const handleVerify = async (userId: string) => {
        try {
            await verifyCreator(userId);
            addToast('Creator verified successfully!', 'success');
            addNotification(
                userId,
                'Congratulations! You have been verified as a Professional Creator. Your profile now features the Verified badge.',
                '/creator/' + userId
            );
            setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, verified: true } : u));
        } catch (error) {
            addToast('Failed to verify creator.', 'error');
        }
    };

    const pendingCreators = users.filter(u => u.role === 'creator' && !u.verified);
    const allUsersSorted = [...users].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 relative">
                <h1 className="text-4xl font-black tracking-tighter text-white">Admin Dashboard</h1>
                <p className="mt-2 text-lg text-gray-400">Manage verified badges and view user database.</p>
                <div className="absolute top-0 right-0">
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </Button>
                </div>
            </div>

            {/* Pending Verifications */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Clock className="mr-3 h-6 w-6 text-yellow-400" /> Pending Badge Requests
                </h2>
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg">
                    {loading ? (
                        <p className="p-6 text-gray-400">Loading...</p>
                    ) : pendingCreators.length > 0 ? (
                        <ul className="divide-y divide-neutral-800">
                            {pendingCreators.map(creator => (
                                <li key={creator.id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-white">{creator.name}</p>
                                        <p className="text-sm text-gray-400">{creator.email}</p>
                                    </div>
                                    <Button size="sm" onClick={() => handleVerify(creator.id)}>
                                        <UserCheck className="mr-2 h-4 w-4" /> Grant Verified Badge
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-6 text-gray-400 italic">No pending verifications.</p>
                    )}
                </div>
            </div>

            {/* All Users Table */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Users className="mr-3 h-6 w-6" /> All Users
                </h2>
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-800">
                        <thead className="bg-neutral-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Profile</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {allUsersSorted.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 capitalize">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {user.verified ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">
                                                Verified Pro
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-800 text-gray-400">
                                                Standard
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {user.role === 'creator' ? (
                                             <Link to={`/creator/${user.id}`} className="text-[#FF4D00] hover:underline">
                                                View Profile
                                            </Link>
                                        ) : (
                                            <span className="text-gray-500">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
