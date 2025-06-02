// Mock NetInfo for environments where the native module isn't available
const NetInfoMock = {
    configure: () => {},
    addEventListener: (callback: any) => {
      setTimeout(() => {
        callback({
          isConnected: true,
          isInternetReachable: true,
        });
      }, 0);
      return () => {};
    },
    fetch: () => Promise.resolve({ isConnected: true, isInternetReachable: true }),
  };
  
  export class NetworkMonitor {
    private isConnected = true;
    private listeners: Array<(isConnected: boolean) => void> = [];
    private unsubscribe?: () => void;
    private NetInfo: any;
  
    constructor() {
      this.initializeNetInfo();
      this.setupNetworkListener();
    }
  
    private initializeNetInfo() {
      try {
        this.NetInfo = require("@react-native-community/netinfo").default;
      } catch (error) {
        console.warn("NetInfo not available, using mock implementation");
        this.NetInfo = NetInfoMock;
      }
    }
  
    private setupNetworkListener() {
      try {
        this.NetInfo.configure({
          reachabilityUrl: process.env.EXPO_PUBLIC_API_URL || 'https://www.google.com',
          reachabilityTest: async (response: any) => response.status === 200,
          reachabilityLongTimeout: 30 * 1000,
          reachabilityShortTimeout: 5 * 1000,
          reachabilityRequestTimeout: 15 * 1000,
        });
  
        this.unsubscribe = this.NetInfo.addEventListener((state: any) => {
          const wasConnected = this.isConnected;
          this.isConnected = 
            state?.isConnected !== false && state?.isInternetReachable !== false;
  
          if (wasConnected !== this.isConnected) {
            this.notifyListeners(this.isConnected);
          }
        });
      } catch (err) {
        console.warn("Failed to configure NetInfo, assuming connected");
      }
    }
  
    getConnectionStatus(): boolean {
      return this.isConnected;
    }
  
    addListener(callback: (isConnected: boolean) => void): () => void {
      this.listeners.push(callback);
      
      // Return unsubscribe function
      return () => {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      };
    }
  
    private notifyListeners(isConnected: boolean) {
      this.listeners.forEach(listener => {
        try {
          listener(isConnected);
        } catch (error) {
          console.error("Error in network listener:", error);
        }
      });
    }
  
    cleanup() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this.listeners = [];
    }
  
    // Testing utilities
    __testing__ = {
      setConnectionStatus: (status: boolean) => {
        this.isConnected = status;
        this.notifyListeners(status);
      },
      getListenersCount: () => this.listeners.length,
    };
  }