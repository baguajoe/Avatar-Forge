const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			
		},
		actions: {
			authenticate: async()=> {
				let token=localStorage.getItem("token")
				if (!token || token == undefined||token.trim()==""){
					console.log ("authentication failed due to no token provided")
					return false
				}
				let response = await fetch(process.env.BACKEND_URL+"/api/authenticate",{
					method:"GET",
					headers:{
						"Content-Type":"application/json",
					Authorization:"Bearer "+token
					}
				})
				if (response.status !=200){
					console.log("authentication failed due to the following error",response.statusText,response.status)
					return false
				} else {
					return true
				}
			}
		}
	};
};

export default getState;  