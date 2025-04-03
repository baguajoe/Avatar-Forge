

const getState = ({ getStore, getActions, setStore }) => {
	return {
	  store: {
		user: null, // Optional: for future use (like displaying account info)
		token: localStorage.getItem("token") || "", // Keep token if user refreshes
	  },
  
	  actions: {
		authenticate: async () => {
		  const token = localStorage.getItem("token");
  
		  if (!token || token.trim() === "") {
			console.warn("❌ Authentication failed: no token provided");
			return false;
		  }
  
		  try {
			const response = await fetch(`${process.env.BACKEND_URL}/api/authenticate`, {
			  method: "GET",
			  headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + token,
			  },
			});
  
			if (response.status !== 200) {
			  console.warn("❌ Authentication failed:", response.statusText, response.status);
			  return false;
			}
  
			const data = await response.json();
  
			// Optionally store user info
			setStore({ user: data.user, token });
  
			console.log("✅ Authenticated successfully");
			return true;
		  } catch (error) {
			console.error("❌ Authentication error:", error);
			return false;
		  }
		},
  
		logout: () => {
		  localStorage.removeItem("token");
		  setStore({ user: null, token: "" });
		  console.log("👋 Logged out successfully");
		},
	  },
	};
  };
  
  export default getState;
