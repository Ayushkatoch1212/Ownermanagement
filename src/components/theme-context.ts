"use client";
import { createContext, useContext } from "react";
export const AppContext=createContext<{mode:"light"|"dark";setMode:(m:"light"|"dark")=>void}>({mode:"light",setMode:()=>{}});
export const useAppTheme=()=>useContext(AppContext);
