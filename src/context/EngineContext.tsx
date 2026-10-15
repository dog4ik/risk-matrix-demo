import type { Engine } from "mahoraga-js";
import { createContext, useContext } from "react";

export const EngineContext = createContext<Engine | undefined>(undefined);

export function useEngine() {
  const engine = useContext(EngineContext);
  if (!engine) throw new Error("useEngine must be used inside EngineContext");
  return engine;
}
