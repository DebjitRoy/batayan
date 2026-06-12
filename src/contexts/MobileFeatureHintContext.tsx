import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const MobileFeatureHintContext = createContext<number>(-1);

interface MobileFeatureHintProviderProps {
  children: ReactNode;
}

export function MobileFeatureHintProvider({ children }: MobileFeatureHintProviderProps) {
  const location = useLocation();
  const [hintStep, setHintStep] = useState(-1);

  useEffect(() => {
    let isActive = true;
    setHintStep(-1);

    const navTimer = window.setTimeout(() => {
      if (isActive) setHintStep(0);
    }, 220);

    const fontTimer = window.setTimeout(() => {
      if (isActive) setHintStep(1);
    }, 520);

    const searchTimer = window.setTimeout(() => {
      if (isActive) setHintStep(2);
    }, 820);

    const stopTimer = window.setTimeout(() => {
      if (isActive) setHintStep(-1);
    }, 5000);

    return () => {
      isActive = false;
      window.clearTimeout(navTimer);
      window.clearTimeout(fontTimer);
      window.clearTimeout(searchTimer);
      window.clearTimeout(stopTimer);
    };
  }, [location.pathname]);

  return <MobileFeatureHintContext.Provider value={hintStep}>{children}</MobileFeatureHintContext.Provider>;
}

export function useMobileFeatureHint() {
  return useContext(MobileFeatureHintContext);
}
