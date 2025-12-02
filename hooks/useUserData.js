// hooks/useUserData.js
import { useUser } from '../context/UserContext';

/**
 * @deprecated This hook is deprecated. Please use `useUser` from `UserContext` directly.
 * This hook is now a wrapper around `useUser` for backward compatibility.
 */
export function useUserData() {
    const { 
        user, 
        loading, 
        error, 
        fetchUserCredits, 
    } = useUser();

    // The `updateUserCredits` function in the old hook updated local state.
    // The new equivalent is to trigger a refetch of the user's credits.
    const updateUserCredits = () => {
        return fetchUserCredits();
    };

    // The old hook had a `refreshUserData` function. We'll map this to refetching credits.
    const refreshUserData = () => {
        return fetchUserCredits();
    };

    return {
        userData: user,
        isLoading: loading,
        error,
        refreshUserData: refreshUserData,
        updateUserCredits: updateUserCredits
    };
}
