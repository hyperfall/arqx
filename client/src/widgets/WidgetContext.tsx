import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { WidgetContext } from './registry';

interface WidgetContextProviderProps {
  inputs: Record<string, File | undefined>;
  onInputChange?: (id: string, file: File | undefined) => void;
  children: React.ReactNode;
}

const WidgetContextContext = createContext<WidgetContext | null>(null);

export function WidgetContextProvider({ inputs, onInputChange, children }: WidgetContextProviderProps) {
  const [sessionState, setSessionState] = useState<Record<string, any>>({});
  const eventListeners = useRef<Record<string, ((payload: any) => void)[]>>({});

  const getInput = useCallback((id: string) => {
    return inputs[id];
  }, [inputs]);

  const onInputChangeCallback = useCallback((id: string, cb: (file?: File) => void) => {
    // Set up input change subscription
    const unsubscribe = () => {
      // This would be implemented with proper event subscription in a real app
    };
    
    // Call immediately with current value
    cb(inputs[id]);
    
    return unsubscribe;
  }, [inputs]);

  const getState = useCallback(<T = any>(key: string, fallback: T): T => {
    return sessionState[key] !== undefined ? sessionState[key] : fallback;
  }, [sessionState]);

  const setState = useCallback((key: string, value: any) => {
    setSessionState(prev => ({ ...prev, [key]: value }));
  }, []);

  const emit = useCallback((event: string, payload?: any) => {
    const listeners = eventListeners.current[event] || [];
    listeners.forEach(listener => listener(payload));
  }, []);

  const on = useCallback((event: string, cb: (payload: any) => void) => {
    if (!eventListeners.current[event]) {
      eventListeners.current[event] = [];
    }
    eventListeners.current[event].push(cb);

    return () => {
      const listeners = eventListeners.current[event];
      if (listeners) {
        const index = listeners.indexOf(cb);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }, []);

  const contextValue: WidgetContext = {
    getInput,
    onInputChange: onInputChangeCallback,
    getState,
    setState,
    emit,
    on,
  };

  return (
    <WidgetContextContext.Provider value={contextValue}>
      {children}
    </WidgetContextContext.Provider>
  );
}

export function useWidgetContext(): WidgetContext {
  const context = useContext(WidgetContextContext);
  if (!context) {
    throw new Error('useWidgetContext must be used within a WidgetContextProvider');
  }
  return context;
}