// --- 1. FRONTEND USAGE ALERT (React) ---

// utils/usageUtils.js
export const checkLimitExceeded = (usage, limit) => {
    return usage >= limit;
  };
  
  // Inside any React component (e.g. RigAvatarPage.js or MotionCapturePage.js)
  import { checkLimitExceeded } from '../utils/usageUtils';
  
  if (checkLimitExceeded(userUsage.rigging_sessions, userUsageLimit)) {
    alert("⚠️ You've hit your monthly rigging limit. Upgrade your plan to continue.");
  }
  
  
  