
// frontend/utils/checkLimit.js
export const checkRiggingLimit = async (userId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/usage/${userId}`);
      const { usage, limit, plan } = await res.json();
  
      if (usage >= limit) {
        alert(`You've hit your monthly rigging limit for the ${plan} plan. Upgrade to continue.`);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Usage check failed:', err);
      return true; // Allow by default if check fails
    }
  };