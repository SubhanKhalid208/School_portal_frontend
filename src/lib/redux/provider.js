'use client'; // ✅ Ye line lazmi hai kyunki Provider client-side par kaam karta hai

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './store';

export default function ReduxProvider({ children }) {
  // Store ko useRef mein rakha jata hai taake page re-render par store reset na ho
  const storeRef = useRef();
  
  if (!storeRef.current) {
    // Pehli baar store yahan create hoga
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}