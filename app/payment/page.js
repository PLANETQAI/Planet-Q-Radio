'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Package, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUser } from '../../context/UserContext'; // Import useUser
import api from '../../lib/api'; // Import the api client

export default function PaymentPage() {
  const router = useRouter()
  const { isAuthenticated, loading: userLoading } = useUser(); // Get auth state from context
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [packages, setPackages] = useState([
    { id: "prod_SQkShxszzVfSea", name: "Small Pack", credits: 100, price: 5 },
    { id: "prod_SQkSMOMbFVZIqD", name: "Medium Pack", credits: 300, price: 12 },
    { id: "prod_SQkSemW9YYNuto", name: "Large Pack", credits: 700, price: 25 },
    { id: "prod_SQkSmmaeLkOgSY", name: "Extra Large Pack", credits: 1500, price: 45 },
  ])
  const [isClient, setIsClient] = useState(false)

  // Set client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!userLoading) { // Only fetch packages once user loading is complete
      if (!isAuthenticated) {
        router.push('/login?redirectTo=' + encodeURIComponent('/payment'))
      } else {
        fetchCreditPackages()
      }
    }
  }, [isAuthenticated, userLoading, router]) // Depend on isAuthenticated and userLoading

  const fetchCreditPackages = async () => {
    try {
      // No need to check session here, useUser hook handles it
      const response = await api.get('/api/credits-api');
      
      const data = response.data;
      if (data.packages && data.packages.length > 0) {
        setPackages(data.packages)
        setSelectedPackage(data.packages[0].id) // Select first package by default
      }
    } catch (error) {
      console.error('Error fetching credit packages:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load credit packages';
      setError(errorMessage)
      // The API interceptor will handle 401 redirects
    }
  }

  const handlePurchase = async () => {
    if (!selectedPackage) return
    
    setLoading(true)
    setError(null)
    
    try {
      // No need to check session here, useUser hook handles it
      const response = await api.post('/api/credits-api', {
        packageId: selectedPackage,
      });
      
      const data = response.data;
      
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
        return
      }
      
      // Handle direct success (should not happen with Stripe integration)
      if (data.success) {
        router.push('/dashboard?purchase=success')
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

  if (!isClient || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading payment options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-900/50 mb-6">
            <Zap className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Purchase Credits</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Get more credits to continue generating amazing music. Choose a package that fits your needs.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-8 max-w-2xl mx-auto">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {packages.map((pkg) => (
            <div 
              key={pkg.id}
              className={`p-6 rounded-xl border transition-all cursor-pointer ${
                selectedPackage === pkg.id 
                  ? 'bg-purple-900/50 border-purple-500 transform scale-[1.02] shadow-lg shadow-purple-900/30' 
                  : 'bg-slate-700/30 border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <Package className={`h-6 w-6 ${
                    selectedPackage === pkg.id ? 'text-purple-400' : 'text-gray-400'
                  }`} />
                  <h3 className="text-xl font-semibold">{pkg.name}</h3>
                </div>
                <div className="mb-6">
                  <p className="text-3xl font-bold mb-2">${pkg.price}</p>
                  <p className="text-sm text-gray-300">{pkg.credits} credits</p>
                </div>
                <div className="mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      ${(pkg.price / pkg.credits).toFixed(3)} per credit
                    </span>
                    {selectedPackage === pkg.id && (
                      <CheckCircle className="text-purple-400" size={20} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <Button 
            onClick={handlePurchase}
            disabled={loading || !selectedPackage}
            className={`w-full max-w-md py-6 text-lg font-semibold ${
              loading ? 'opacity-75' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Buy ${getPackageById(selectedPackage)?.name || 'Package'}`
            )}
          </Button>
          
          <p className="mt-4 text-sm text-gray-400">
            Secure payment processed by Stripe. Your payment information is encrypted.
          </p>
        </div>

        <div className="mt-16 max-w-3xl mx-auto bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="text-yellow-400" /> How It Works
          </h3>
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-purple-900/50 rounded-full p-1.5 mt-0.5">
                <CheckCircle className="h-4 w-4 text-purple-300" />
              </div>
              <div>
                <h4 className="font-medium">Instant Delivery</h4>
                <p className="text-sm text-gray-400">Credits are added to your account immediately after payment.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-900/50 rounded-full p-1.5 mt-0.5">
                <CheckCircle className="h-4 w-4 text-purple-300" />
              </div>
              <div>
                <h4 className="font-medium">No Subscription</h4>
                <p className="text-sm text-gray-400">Pay as you go with no recurring charges or commitments.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-900/50 rounded-full p-1.5 mt-0.5">
                <CheckCircle className="h-4 w-4 text-purple-300" />
              </div>
              <div>
                <h4 className="font-medium">Secure Payment</h4>
                <p className="text-sm text-gray-400">All transactions are encrypted and securely processed by Stripe.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
