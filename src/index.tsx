import {useState, useMemo, useEffect, createContext, useContext} from 'react';

export const WebMonetizationContext = createContext();

export const WebMonetizationProvider = ({ children }) => {
  const [isMonetizing, setIsMonetizing] = useState(false);
  const [unscaledTotal, setUnscaledTotal] = useState(0);
  const [assetScale, setAssetScale] = useState(0);
  const [assetCode, setAssetCode] = useState("");
  const scaledTotal = useMemo(() => {
    return (unscaledTotal * Math.pow(10, -assetScale)).toFixed(assetScale);
  }, [unscaledTotal, assetScale]);

  const handleStart = () => setIsMonetizing(true);

  const handleProgress = (ev) => {
    // initialize currency and scale on first progress event
    setIsMonetizing(true);
    if (unscaledTotal === 0) {
      setAssetScale(ev.detail.assetScale);
      setAssetCode(ev.detail.assetCode);
    }

    setUnscaledTotal((currentTotal) => currentTotal + Number(ev.detail.amount));
  };

  useEffect(() => {
    if (document.monetization) {
      document.monetization.addEventListener("monetizationstart", handleStart);
      document.monetization.addEventListener(
        "monetizationprogress",
        handleProgress
      );
    }
    return () => {
      if (document.monetization) {
        document.monetization.removeEventListener(
          "monetizationstart",
          handleStart
        );
        document.monetization.removeEventListener(
          "monetizationprogress",
          handleProgress
        );
      }
    };
  }, []);

  return (
    <WebMonetizationContext.Provider
      value={{
        isMonetizing,
        total: scaledTotal,
        currency: assetCode,
      }}
    >
      {children}
    </WebMonetizationContext.Provider>
  );
};

export function useWebMonetization() {
  return useContext(WebMonetizationContext);
}
