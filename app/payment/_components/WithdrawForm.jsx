// app/payment/_components/WithdrawForm.jsx
'use client';

import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

const POINTS_TO_DOLLARS = 0.01; // 100 points = $1.00
const MIN_WITHDRAWAL_POINTS = 100; // $1.00 minimum

export default function WithdrawForm() {
    const { userData } = useUserData();
    const router = useRouter();
    const [points, setPoints] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Get the most recent reward by createdAt
    const latestReward = userData?.rewards
        ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

    const availablePoints = latestReward?.points || 0;
    const pointsToDollars = (pts) => (pts * POINTS_TO_DOLLARS).toFixed(2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const pointsNum = parseInt(points, 10);
        
        if (pointsNum < MIN_WITHDRAWAL_POINTS || pointsNum > availablePoints) {
            toast.error(`You can withdraw between ${MIN_WITHDRAWAL_POINTS} and ${availablePoints} points`);
            return;
        }

        if (!latestReward) {
            toast.error('No rewards available');
            return;
        }

        setIsLoading(true);
        
        try {
            await api.post('/api/payments/withdraw', { 
                amount: pointsNum,
                rewardId: latestReward.id
            });

            toast.success(`Successfully withdrew ${pointsNum} points (${pointsToDollars(pointsNum)})`);
            setPoints('');
            router.refresh();
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to process withdrawal';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!userData) return <div>Loading...</div>;

    if (!latestReward) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No rewards available for withdrawal.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">
                    Points to Withdraw (100 points = $1.00)
                </label>
                <div className="flex space-x-2">
                    <input
                        type="number"
                        min={MIN_WITHDRAWAL_POINTS}
                        max={availablePoints}
                        value={points}
                        onChange={(e) => setPoints(e.target.value ? parseInt(e.target.value, 10) : '')}
                        placeholder={`Min ${MIN_WITHDRAWAL_POINTS} points`}
                        className="flex-1 px-3 py-2 border rounded-md"
                        required
                    />
                    <span className="flex items-center px-3 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                        = ${points ? pointsToDollars(points) : '0.00'}
                    </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                    Available: {availablePoints} points (${pointsToDollars(availablePoints)})
                    {latestReward.description && (
                        <div className="text-xs text-green-600 mt-1">
                            Reward: {latestReward.description} (Created: {new Date(latestReward.createdAt).toLocaleDateString()})
                        </div>
                    )}
                </div>
            </div>
            
            <Button 
                type="submit" 
                disabled={isLoading || !points || points < MIN_WITHDRAWAL_POINTS || points > availablePoints}
                className="w-full"
            >
                {isLoading ? 'Processing...' : `Withdraw ${points || 0} points ($${points ? pointsToDollars(points) : '0.00'})`}
            </Button>
        </form>
    );
}