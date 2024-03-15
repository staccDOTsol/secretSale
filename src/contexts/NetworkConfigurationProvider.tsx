import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useState,
} from 'react';

export interface NetworkConfigurationState {
    networkConfiguration: string;
    setNetworkConfiguration(networkConfiguration: string): void;
}

export const NetworkConfigurationContext = createContext<NetworkConfigurationState>({} as NetworkConfigurationState);

export function useNetworkConfiguration(): NetworkConfigurationState {
    return useContext(NetworkConfigurationContext);
}

export const NetworkConfigurationProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [networkConfiguration, setNetworkConfiguration] = useState("mainnet-beta")

    return (
        <NetworkConfigurationContext.Provider value={{ networkConfiguration, setNetworkConfiguration }}>{children}</NetworkConfigurationContext.Provider>
    );
};