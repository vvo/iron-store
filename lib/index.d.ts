export type StoreOptions = {
  sealed?: string;
  password: string | { id: number; password: string }[];
  ttl?: number;
};

export type Store = {
  set: <T = any>(name: string, value: T) => T;
  setFlash: <T = any>(name: string, value: T) => T;
  unset: (name: string) => void;
  get: (name?: string) => Record<string, any> | any;
  clear: () => void;
  seal: () => Promise<string>;
};

export default function ironStore(storeOptions: StoreOptions): Promise<Store>;
