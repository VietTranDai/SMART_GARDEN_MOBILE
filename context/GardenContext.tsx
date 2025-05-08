import React, { createContext, useContext, useState, useCallback } from "react";

// Define context type
interface GardenContextType {
  selectedGardenId: number | null;
  setSelectedGardenId: (id: number | null) => void;
  selectGarden: (id: number) => void;
}

// Create context with default values
const GardenContext = createContext<GardenContextType>({
  selectedGardenId: null,
  setSelectedGardenId: () => {},
  selectGarden: () => {},
});

// Create provider component
export const GardenProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedGardenId, setSelectedGardenId] = useState<number | null>(null);

  // Callback for selecting garden
  const selectGarden = useCallback((id: number) => {
    setSelectedGardenId(id);
  }, []);

  return (
    <GardenContext.Provider
      value={{ selectedGardenId, setSelectedGardenId, selectGarden }}
    >
      {children}
    </GardenContext.Provider>
  );
};

// Custom hook to use garden context
export const useGardenContext = () => useContext(GardenContext);

export default GardenContext;
