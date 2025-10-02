interface SnapOptions {
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}

interface Snap {
  pay: (token: string, options?: SnapOptions) => void;
}

interface Window {
  snap: Snap;
}

declare const snap: Snap;
