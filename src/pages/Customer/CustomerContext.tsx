import { createContext } from 'react'

type CustomerContextType = {
  currentNoteId: string
  setCurrentNoteId: (noteId: string) => void
}
export const CustomerContext = createContext<CustomerContextType>({
  currentNoteId: '',
  setCurrentNoteId: () => {},
})
