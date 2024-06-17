import { useState } from "react"
import { UserContext, UserContextType } from "./UserContext"


const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [username, setUsername] = useState<string | null>(null);
    const [imageLink, setImageLink] = useState<string | null>(null);
  
    const contextValue: UserContextType = {
      username,
      setUsername,
      imageLink,
      setImageLink
    };
  
    return (
      <UserContext.Provider value={contextValue}>
        {children}
      </UserContext.Provider>
    );
  };
  
  export default AppContextProvider