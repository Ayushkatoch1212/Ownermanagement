"use client";
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useSession } from "next-auth/react";
import { useAppTheme } from "@/components/theme-context";
export default function Header({onMenu}:{onMenu:()=>void}){const {data}=useSession();const {mode,setMode}=useAppTheme();return <AppBar position="sticky" color="inherit" elevation={0} sx={{borderBottom:"1px solid",borderColor:"divider"}}><Toolbar><IconButton onClick={onMenu} sx={{display:{md:"none"},mr:1}}><MenuIcon/></IconButton><Box sx={{flex:1}}><Typography fontWeight={700}>{data?.user?.name||"Admin"}</Typography><Typography variant="caption" color="text.secondary">PG Management</Typography></Box><Tooltip title="Notifications"><IconButton><NotificationsNoneIcon/></IconButton></Tooltip><IconButton onClick={()=>setMode(mode==="light"?"dark":"light")}>{mode==="light"?<DarkModeIcon/>:<LightModeIcon/>}</IconButton><Avatar sx={{ml:1,width:34,height:34}}>{data?.user?.name?.[0]?.toUpperCase()||"A"}</Avatar></Toolbar></AppBar>}
