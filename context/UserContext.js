'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../lib/api'; // Import the new api client

// Create a context object
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // To check for token on initial load

  const [isOpen, setOpen] = useState(false);
  const [credits, setCredits] = useState(null);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsError, setCreditsError] = useState(null);
  const [songs, setSongs] = useState([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [songsError, setSongsError] = useState(null);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedToken = localStorage.getItem('token');
      console.log('UserContext: Initializing. Stored token:', storedToken ? 'Found' : 'Not found');
      if (storedToken) {
        setToken(storedToken);
        try {
          console.log('UserContext: Attempting to fetch user data from /api/user/me');
          const { data } = await api.get('/api/user/me');
          setUser(data);
          console.log('UserContext: Successfully fetched user data:', data);
        } catch (error) {
          console.error("UserContext: Failed to fetch user on load", error);
          // Only clear token and redirect if it's a 401 Unauthorized error
          if (error.response?.status === 401) {
            console.log('UserContext: 401 received, clearing token and redirecting to login.');
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            window.location.href = '/login'; // Redirect to login
          } else {
            // For other errors (e.g., 400 Bad Request), keep the token but set user to null.
            // This allows subsequent API calls to still try the token, and the interceptor
            // will catch a 401 if it's truly invalid.
            console.log('UserContext: Non-401 error received, keeping token but user is null.');
            setUser(null);
          }
        }
      }
      setLoading(false);
      console.log('UserContext: Loading finished.');
    };
    loadUserFromStorage();
  }, []);

  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(userData);
    console.log('UserContext: User logged in. Token saved to localStorage.');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    console.log('UserContext: User logged out. Token removed from localStorage.');
    window.location.href = '/login';
  };

  const close = () => {
    setOpen(false);
  };

  const openHandler = () => {
    setOpen(true);
  };

  const fetchUserCredits = useCallback(async () => {
    if (!token) {
        setCredits(null);
        return null;
    }
    setCreditsLoading(true);
    setCreditsError(null);
    try {
      const { data } = await api.get('/api/credits-api');
      setCredits(data);
      return data;
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCreditsError(error.message || 'Failed to load credits. Please try again.');
      // The interceptor will handle 401s
      if (error.response?.status !== 401) {
        setCredits(null);
      }
      throw error;
    } finally {
      setCreditsLoading(false);
    }
  }, [token]);

  const fetchUserSongs = useCallback(async (provider = 'suno') => {
    if (!token) {
        setSongs([]);
        return [];
    }
    setSongsLoading(true);
    setSongsError(null);
    try {
      const { data } = await api.get('/api/songs');
      
      if (data.songs && Array.isArray(data.songs)) {
        const filteredSongs = data.songs
          .filter(song => song.provider === provider || song.tags?.includes(`provider:${provider}`))
          .map(song => ({
              id: song.id,
              title: song.title || 'Untitled Song',
              audioUrl: song.audioUrl || song.song_path,
              song_path: song.song_path || song.audioUrl,
              lyrics: song.lyrics,
              coverImageUrl: song.thumbnailUrl || song.coverImageUrl || song.image_path,
              image_path: song.image_path || song.coverImageUrl || song.thumbnailUrl,
              duration: song.duration || 0,
              createdAt: song.createdAt,
              isForSale: Boolean(song.isForSale),
              provider: song.provider || provider,
              prompt: song.prompt,
              style: song.style || song.tags?.find(tag => tag.startsWith('style:'))?.split(':')[1],
              tempo: song.tempo || song.tags?.find(tag => tag.startsWith('tempo:'))?.split(':')[1],
              mood: song.mood || song.tags?.find(tag => tag.startsWith('mood:'))?.split(':')[1],
              status: song.status || 'completed'
            }));
        setSongs(filteredSongs);
        return filteredSongs;
      }
      setSongs([]);
      return [];
    } catch (error) {
      console.error('Error fetching songs:', error);
      setSongsError(error.message);
      return [];
    } finally {
      setSongsLoading(false);
    }
  }, [token]);

  const value = {
    // Auth state and functions
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,

    // Existing state and functions
    isOpen,
    open: openHandler,
    close,
    credits,
    creditsLoading,
    creditsError,
    fetchUserCredits,
    songs,
    songsLoading,
    songsError,
    fetchUserSongs
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for accessing the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
