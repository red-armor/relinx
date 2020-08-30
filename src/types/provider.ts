import { FC } from 'react';

export interface ProviderProps {
  store: object;
  children: FC;
  namespace: string;
  useProxy: boolean;
  useRelinkMode: boolean;
  strictMode: boolean;
}
