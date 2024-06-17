import { createContext } from 'react'

export interface UserContextType {
  username: string | null;
  setUsername: (name: string | null) => void;
  imageLink: string | null;
  setImageLink: (link: string | null) => void;
}

const initialContext: UserContextType = {
  username: null,
  setUsername: () => {},
  imageLink: null,
  setImageLink: () => {}
}

export const UserContext = createContext<UserContextType>(initialContext)


