import { createContext, useContext } from 'react'

/* The create desk's context and its empty master — their own file so
   `useCreateDesk.jsx` exports only a component and keeps fast refresh
   (the react-refresh rule, same reason `navHidden.js` exists in kol-shell). */
export const EMPTY_MASTER = { inputs: [null, null, null], fx: [], sends: {}, opacity: 100 }
export const CreateDeskContext = createContext(null)
export const useCreateDesk = () => useContext(CreateDeskContext)
