// app/payment/withdraw/page.jsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserData } from '@/hooks/useUserData';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import WithdrawForm from '../_components/WithdrawForm';

// app/payment/withdraw/page.jsx
export default function WithdrawPage() {
    const { userData, isLoading } = useUserData('/payment/withdraw');
    const [isConnecting, setIsConnecting] = useState(false);
    const router = useRouter();

    console.log("User data", userData)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!userData) {
        return null; // Redirect will happen in useUserData
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <Card className="w-full border-0 shadow-none">
                <CardHeader className="space-y-4 p-0 pb-6">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="h-8 w-8 p-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <CardTitle className="text-xl">Withdraw Funds</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {userData.stripeAccountId ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-green-500 mb-4">
                                <CheckCircle className="h-5 w-5" />
                                <span>Stripe account connected</span>
                            </div>
                            <WithdrawForm />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-gray-700">
                                Connect your Stripe account to withdraw your earnings
                            </p>
                            <Button
                                onClick={handleConnectAccount}
                                disabled={isConnecting}
                                className="w-full"
                            >
                                {isConnecting ? 'Connecting...' : 'Connect Stripe Account'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}