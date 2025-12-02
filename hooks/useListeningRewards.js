"use client";

import { useEffect, useRef, useState } from "react";
import api from '../lib/api';
import { useUser } from "../context/UserContext"; // Import useUser

// Daily money caps per subscription plan (dollars/day)
const DAILY_DOLLAR_CAP = {
  "1m": 0.0136986301,
  "3m": 0.032876723,
  "6m": 0.0684931507,
  "12m": 0.1232876712,
};

// Convert daily cap to per-second earning
function getDollarPerSecond(planKey) {
  return DAILY_DOLLAR_CAP[planKey] / (24 * 60 * 60); // seconds in a day
}

// Determine user plan cohort from subscription
function getUserPlanKey(userCredits) {
  if (!userCredits?.credits?.isRadioSubscribed) return null;

  const now = new Date();
  const expires = new Date(userCredits.credits.radioSubscriptionExpiresAt);
  const diffMonths = (expires.getFullYear() - now.getFullYear()) * 12 + (expires.getMonth() - now.getMonth());

  if (diffMonths < 1) return "1m";
  if (diffMonths < 3) return "3m";
  if (diffMonths < 6) return "6m";
  return "12m";
}

export function useListeningRewards(showValue = true, isPlaying = false, userCredits = null) {
  const { user } = useUser(); // Use user from context
  const [rawPoints, setRawPoints] = useState(0);
  const lastTickRef = useRef(Date.now());

  // Determine per-second earning based on user plan
  const planKey = getUserPlanKey(userCredits);
  const dollarPerSecond = planKey ? getDollarPerSecond(planKey) : 0;

  // Load previous day points from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("listening_session");
    if (saved) {
      try {
        const { date, points: savedPoints } = JSON.parse(saved);
        const today = new Date().toDateString();
        setRawPoints(date === today ? savedPoints : 0);
      } catch (e) {
        console.error("Failed to parse listening_session:", e);
      }
    }
  }, []);

  // Main tracking logic
  useEffect(() => {
    if (!isPlaying || dollarPerSecond === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diffSec = (now - lastTickRef.current) / 1000;
      if (diffSec >= 1) {
        lastTickRef.current = now;

        setRawPoints((prev) => {
          const newPoints = prev + dollarPerSecond * diffSec;

          // Save periodically in localStorage
          if (Math.floor(newPoints * 1000) % 10 === 0) {
            localStorage.setItem(
              "listening_session",
              JSON.stringify({
                date: new Date().toDateString(),
                points: newPoints,
              })
            );
          }

          return newPoints;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, dollarPerSecond]);

  // Save points to backend on page unload
  useEffect(() => {
    const handleUnload = async () => {
      if (rawPoints > 0) await savePointsToDB(rawPoints);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [rawPoints]);

  // Save points to backend
  async function savePointsToDB(pointsAmount) {
    if (!user?.id) return; // Use user from context

    try {
      await api.post("/api/rewards/listening", {
        points: Math.floor(pointsAmount),
        description: "Daily radio listening reward",
        metadata: {},
      });
    } catch (err) {
      console.error("Failed to save points:", err);
    }
  }

  // Display value to user (formatted)
  const displayValue = showValue ? rawPoints.toFixed(4) : rawPoints;

  return {
    points: displayValue, // money earned
    rawPoints,            // internal accumulation
  };
}
