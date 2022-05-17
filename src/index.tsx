import React, {
  useState,
  useMemo,
  useEffect,
  createContext,
  useContext,
} from 'react';

type AssetCode = string;

type WMContextProps = {
  isMonetizing: boolean;
  total: number;
  currency: AssetCode;
};

type WMProviderProps = {
  children: any;
};

type WMPolyfillDocument = Document & {
  monetization: any;
};

export const WebMonetizationContext = createContext({} as WMContextProps);

export const WebMonetizationProvider = ({ children }: WMProviderProps) => {
  const [isMonetizing, setIsMonetizing] = useState(false);
  const [unscaledTotal, setUnscaledTotal] = useState(0);
  const [assetScale, setAssetScale] = useState(0);
  const [assetCode, setAssetCode] = useState('');
  const scaledTotal = useMemo(() => {
    return parseFloat(
      (unscaledTotal * Math.pow(10, -assetScale)).toFixed(assetScale)
    );
  }, [unscaledTotal, assetScale]);

  const handleStart = () => setIsMonetizing(true);

  const handleProgress = (ev: any) => {
    // initialize currency and scale on first progress event
    setIsMonetizing(true);
    if (unscaledTotal === 0) {
      setAssetScale(ev.detail.assetScale);
      setAssetCode(ev.detail.assetCode);
    }

    setUnscaledTotal(currentTotal => currentTotal + Number(ev.detail.amount));
  };

  useEffect(() => {
    const wmdocument = document as WMPolyfillDocument;
    if (wmdocument.monetization) {
      wmdocument.monetization.addEventListener(
        'monetizationstart',
        handleStart
      );
      wmdocument.monetization.addEventListener(
        'monetizationprogress',
        handleProgress
      );
    }
    return () => {
      if (wmdocument.monetization) {
        wmdocument.monetization.removeEventListener(
          'monetizationstart',
          handleStart
        );
        wmdocument.monetization.removeEventListener(
          'monetizationprogress',
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