'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  NORMAL_CREDIT_PACKAGES,
  RADIO_SUBSCRIPTION_PLANS,
  SUBSCRIPTION_PLANS
} from '@/lib/stripe_package'
import { CheckCircle, Loader2, Package, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import api from '../../lib/api'; // Import the api client
import { useUser } from '../../context/UserContext'; // Import useUser

const CreditPurchaseModal = ({ 
  isOpen, 
  onClose, 
  creditsNeeded = 0,
  creditType = 'normal',
  onSuccess = () => {} 
}) => {
  const router = useRouter()
  const { isAuthenticated, loading: userLoading } = useUser(); // Get auth state from context
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [packages, setPackages] = useState([])
  const [isLoading, setIsLoading] = useState(false) // This seems redundant with 'loading' state

  // Set available packages based on credit type
  useEffect(() => {
    if (!isOpen) return
    
    try {
      let availablePackages = []
      
      if (creditType === 'normal') {
        availablePackages = NORMAL_CREDIT_PACKAGES
      } else if (creditType === 'radio') {
        availablePackages = RADIO_SUBSCRIPTION_PLANS
      } else if (creditType === 'subscription') {
        availablePackages = SUBSCRIPTION_PLANS
      }
      
      setPackages(availablePackages)
      
      // Auto-select the first package by default
      if (availablePackages.length > 0) {
        // For radio subscriptions, try to find a suitable package based on credits needed
        if (creditsNeeded > 0) {
          const suitablePackage = availablePackages.find(pkg => pkg.credits >= creditsNeeded)
          setSelectedPackage(suitablePackage ? suitablePackage.id : availablePackages[0].id)
        } else {
          setSelectedPackage(availablePackages[0].id)
        }
      }
    } catch (error) {
      console.error('Error setting up packages:', error)
      setError('Failed to load packages. Please try again.')
    }
  }, [isOpen, creditType, creditsNeeded])

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    setLoading(true);
    setError(null);
    
    // Check authentication status using UserContext
    if (!userLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push('/login?redirectTo=' + encodeURIComponent(window.location.pathname));
      setLoading(false); // Ensure loading state is reset
      return;
    }
    
    try {
      // Verify the selected package exists
      const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
      if (!selectedPkg) {
        throw new Error('Selected package not found');
      }
      
      // Prepare the request body with required fields
      const requestBody = {
        packageId: selectedPackage,
        creditType: creditType
      };
      
      // Process the purchase using the api client
      const response = await api.post('/api/credits-api', requestBody);
      
      const data = response.data;
      
      // Check if we got a Stripe checkout URL
      if (data.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        // Use window.location for a full page redirect to Stripe
        window.location.href = data.url;
        return;
      }
      
      // Handle direct success (should not happen with Stripe integration)
      if (data.success) {
        onSuccess(data);
        onClose();
      }
    } catch (error) {
      console.error('Purchase error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to process purchase';
      setError(errorMessage)
      // The API interceptor will handle 401 redirects
    } finally {
      setLoading(false)
    }
  }

  const getPackageById = (id) => {
    return packages.find(pkg => pkg.id === id) || null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-slate-800 to-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-yellow-400" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {creditsNeeded > 0 ? (
              <>You need <span className="font-bold text-yellow-400">{creditsNeeded}</span> more credits to complete this operation.</>
            ) : (
              <>Purchase additional credits to generate more music.</>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {userLoading || isLoading ? ( // Use userLoading here as well
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No credit packages available</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 py-4">
            {packages.map((pkg) => (
              <div 
                key={pkg.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedPackage === pkg.id 
                    ? 'bg-purple-900/50 border-purple-500' 
                    : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className={`${selectedPackage === pkg.id ? 'text-purple-400' : 'text-gray-400'}`} />
                    <div>
                      <h3 className="font-medium">{pkg.name}</h3>
                      <p className="text-sm text-gray-300">
                        {creditType === 'radio' 
                          ? `${pkg.interval_count} Months` || '1 month' 
                          : `${pkg.credits} Planet Q Coins`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">${pkg.price}</span>
                    {selectedPackage === pkg.id && (
                      <CheckCircle className="text-purple-400" size={18} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 p-2 rounded-md text-sm text-red-300">
            {error}
          </div>
        )}
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto border-slate-600 bg-gray-500 hover:bg-slate-700 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePurchase}
            disabled={!selectedPackage || loading || userLoading} // Disable if user is still loading
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Purchase</span>
                {selectedPackage && (
                  <span>${getPackageById(selectedPackage)?.price}</span>
                )}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreditPurchaseModal
