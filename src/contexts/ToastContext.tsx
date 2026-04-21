import React, { createContext, useContext, useState, useCallback } from 'react'
import { ToastMessage } from '../types'
import { v4 as uuidv4 } from 'uuid'

interface ToastContextType {
  messages: ToastMessage[]
  addToast: (message: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const addToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = uuidv4()
    setMessages(prev => [...prev, { ...message, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ messages, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  
  return {
    ...context,
    success: (message: string, duration?: number) => 
      context.addToast({ type: 'success', message, duration }),
    error: (message: string, duration?: number) => 
      context.addToast({ type: 'error', message, duration }),
    info: (message: string, duration?: number) => 
      context.addToast({ type: 'info', message, duration })
  }
}