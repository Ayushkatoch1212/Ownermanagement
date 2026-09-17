"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Divider, Button } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssessmentIcon from "@mui/icons-material/Assessment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut } from "next-auth/react";
const items=[["/dashboard","Dashboard",DashboardIcon],["/pgs","PGs",ApartmentIcon],["/rooms","Rooms",MeetingRoomIcon],["/students","Students",PeopleIcon],["/payments","Payments",PaymentsIcon],["/billing","Monthly Billing",ReceiptLongIcon],["/expenses","Expenses",ReceiptLongIcon],["/reports","Reports",AssessmentIcon],["/reminders","Reminders",NotificationsIcon],["/settings","Settings",SettingsIcon]] as const;
export default function Sidebar({open,onClose}:{open:boolean;onClose:()=>void}){const path=usePathname();return <Drawer variant="permanent" sx={{display:{xs:"none",md:"block"},width:250,"& .MuiDrawer-paper":{width:250,boxSizing:"border-box",borderRight:"1px solid",borderColor:"divider"}}}><SidebarContent path={path}/></Drawer>}
function SidebarContent({path}:{path:string}){return <Box sx={{height:"100%",display:"flex",flexDirection:"column"}}><Box sx={{p:3}}><Typography variant="h6" fontWeight={800}>PG Manager</Typography><Typography variant="caption" color="text.secondary">Admin Console</Typography></Box><Divider/ ><List sx={{px:1.5,flex:1}}>{items.map(([href,label,Icon])=><ListItemButton component={Link} href={href} selected={path===href||path.startsWith(href+"/")} key={href} sx={{mb:.5}}><ListItemIcon sx={{minWidth:38}}><Icon fontSize="small"/></ListItemIcon><ListItemText primary={label}/></ListItemButton>)}</List><Box sx={{p:2}}><Button fullWidth startIcon={<LogoutIcon/>} onClick={()=>signOut({callbackUrl:"/login"})}>Logout</Button></Box></Box>}
