"use client";

import CreditPurchaseModal from "@/components/credits/CreditPurchaseModal";
import { useUser } from "@/context/UserContext";
import useSubscriptions from "@/hooks/useSubscriptions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RadioSubscriptionFlow({ children }) {
  // All hooks must be called at the top level
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push(
        "/login?callbackUrl=" + encodeURIComponent(window.location.pathname)
      );
    },
  });
  const { credits: userCredits, creditsLoading, fetchUserCredits } = useUser();
  console.log("userCredits", userCredits);
  // State hooks
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState(null);
  const [radioPlan, setRadioPlan] = useState(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [subscription, setSubscription] = useState(null);

  // Custom hooks
  const {
    getSubscription,
    createSubscription,
    cancelSubscription,
    getSubscriptionPlans,
    isLoading: isSubscriptionLoading,
    error: subscriptionError,
  } = useSubscriptions();

  // Derived state
  const user = session?.user;
  const credits = user?.credits || 0;

  useEffect(() => {
    const loadCredits = async () => {
      try {
        await fetchUserCredits();
      } catch (err) {
        console.error("Failed to fetch user credits:", err);
      }
    };

    if (status === "authenticated") {
      loadCredits();
    }
  }, [status, fetchUserCredits]);

  // Fetch radio plans
  useEffect(() => {
    const fetchRadioPlan = async () => {
      try {
        const plans = await getSubscriptionPlans();
        const radioPlan = plans.find((plan) =>
          plan.name.toLowerCase().includes("radio")
        );
        setRadioPlan(radioPlan);
      } catch (err) {
        console.error("Failed to fetch radio plan:", err);
        setError("Failed to load subscription plans");
      } finally {
        setIsLoadingPlans(false);
      }
    };

    if (status === "authenticated") {
      fetchRadioPlan();
    }
  }, [getSubscriptionPlans, status]);

  // Check access
  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !radioPlan) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      try {
        const subscriptionData = await getSubscription();
        const hasActiveSubscription =
          subscriptionData?.hasActiveSubscription &&
          subscriptionData?.subscription?.planId === radioPlan.id;

        setSubscription(subscriptionData?.subscription || null);
        setHasAccess(Boolean(hasActiveSubscription));
      } catch (err) {
        console.error("Error checking subscription:", err);
        setError("Failed to check subscription status");
      } finally {
        setIsChecking(false);
      }
    };

    if (radioPlan && status === "authenticated") {
      checkAccess();
    }
  }, [user, getSubscription, radioPlan, status]);

  // Add cancel subscription handler
  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;

    if (
      window.confirm(
        "Are you sure you want to cancel your subscription? You will lose access at the end of your current billing period."
      )
    ) {
      try {
        await cancelSubscription(subscription.id);
        setHasAccess(false);
        setSubscription(null);
      } catch (err) {
        setError("Failed to cancel subscription");
      }
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      console.error("No user found");
      return null;
    }

    if (!radioPlan) {
      const errorMsg = "Radio plan not available";
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // Check if credits are loaded
    if (userCredits === null) {
      const errorMsg = "Unable to verify your credits. Please try again.";
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // Check if credits are insufficient
    if (userCredits.credits < 160) {
      console.log("Insufficient credits, showing credit modal");
      setShowCreditModal(true);
      return;
    }

    try {
      console.log("Creating subscription with plan ID:", radioPlan.id);
      const subscriptionResult = await createSubscription(radioPlan.id);
      console.log("Subscription created successfully:", subscriptionResult);

      setHasAccess(true);
      console.log("hasAccess set to true");

      // Refresh credits after subscription
      console.log("Refreshing credits...");
      await fetchUserCredits();
      console.log("Credits refreshed after subscription");
    } catch (err) {
      console.error("Subscription error:", {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
      });

      if (err.message.includes("Insufficient credits")) {
        console.log("Insufficient credits, showing credit modal");
        setShowCreditModal(true);
      } else {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to subscribe to Radio Plan";
        console.error("Subscription failed:", errorMsg);
        setError(errorMsg);
      }
    }
  };

  // Handle loading state
  if (status === "loading" || isLoadingPlans || isChecking || creditsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!radioPlan) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-red-500">
          Radio plan is currently not available. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="w-full max-w-md mx-auto bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-800">
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              Unlock PlanetQ Radio
            </h2>
            <p className="text-sm sm:text-base text-gray-300 px-2">
              Subscribe to our Radio Plan to access premium radio stations and
              exclusive content.
            </p>
          </div>

          <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg sm:text-xl font-semibold text-cyan-300 mb-3 sm:mb-4">
              Radio Plan
            </h3>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {Array.isArray(radioPlan?.features) ? (
                radioPlan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start sm:items-center text-left"
                  >
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 sm:mt-0 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-xs sm:text-sm text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 text-sm">No features available</li>
              )}
            </ul>

            <div className="flex flex-col items-center mb-4 sm:mb-6">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400">
                {radioPlan.credits || 160} Credits
              </div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1">
                Monthly
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={isSubscriptionLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium sm:font-bold py-3 px-4 sm:px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
            >
              {isSubscriptionLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Subscribe Now"
              )}
            </button>

            {error && (
              <div className="mt-3 text-red-400 text-xs sm:text-sm">
                {error}
              </div>
            )}

            {hasAccess && subscription && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <p className="text-green-400 text-sm sm:text-base font-medium">
                      Active {radioPlan?.name || "Subscription"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {subscription.autoRenew
                        ? `Auto-renews on ${new Date(
                            subscription.expiryDate
                          ).toLocaleDateString()}`
                        : `Expires on ${new Date(
                            subscription.expiryDate
                          ).toLocaleDateString()} (not renewing)`}
                    </p>
                    {subscription.expiryDate && (
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        {new Date(subscription.expiryDate) > new Date()
                          ? `Access until: ${new Date(
                              subscription.expiryDate
                            ).toLocaleDateString()}`
                          : "Subscription expired"}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isSubscriptionLoading}
                    className="w-full sm:w-auto mt-2 sm:mt-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isSubscriptionLoading ? "Processing..." : "Cancel"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        requiredCredits={radioPlan.credits || 160}
        currentCredits={credits}
      />
    </div>
  );
}
