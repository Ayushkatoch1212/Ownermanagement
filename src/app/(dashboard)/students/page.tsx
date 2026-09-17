"use client";
import { useEffect, useState } from "react"; import { Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Grid, MenuItem, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material"; import AddIcon from "@mui/icons-material/Add"; 
import StatusChip from "@/components/StatusChip";
// import { StatusChip } from "@/components/StatusChip";

export default function Students() {
     const [data, setData] = useState<any[]>([]),
      [pgs, setPgs] = useState<any[]>([]), 
      [rooms, setRooms] = useState<any[]>([]),
       [open, setOpen] = useState(false); 
       const [v, setV] = useState<any>({ pgId: "", roomId: "", name: "", phone: "", email: "", registrationNumber: "", guardianName: "", guardianPhone: "", college: "", bedNumber: "", joiningDate: new Date().toISOString().slice(0, 10), monthlyRent: 7000, securityDeposit: 7000, securityDepositPaid: 0, status: "active", notes: "" });
        async function load() { 
            setData((await (await fetch("/api/students")).json()).data || []) }
             useEffect(() => { load(); fetch("/api/pgs").then(r => r.json()).then(x => setPgs(x.data || []));
                 fetch("/api/rooms").then(r => r.json()).then(x => setRooms(x.data || [])) }, []);
                  const roomOptions = rooms.filter(r => !v.pgId || String(r.pgId?._id || r.pgId) === String(v.pgId));
                   async function save() { const r = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) }); const x = await r.json(); 
                   if (!r.ok) alert(x.message); else { setOpen(false); load() } } return <Box><Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}><Box>
                    <Typography variant="h4" fontWeight={800}>Students</Typography>
                    <Typography color="text.secondary">Tenants, rooms and deposits.</Typography>
                    </Box><Button variant="contained" startIcon={<AddIcon />} 
                    onClick={() => setOpen(true)}>Add Student</Button></Box><Card variant="outlined">
                        <CardContent><Table><TableHead><TableRow><TableCell>Name</TableCell>
                        <TableCell>PG</TableCell><TableCell>Room</TableCell><TableCell>Rent</TableCell>
                        <TableCell>Status</TableCell></TableRow></TableHead>
                        <TableBody>{data.map(s => <TableRow key={s._id}><TableCell>
                            <b>{s.name}</b><br /><Typography variant="caption">{s.phone}</Typography>
                            </TableCell><TableCell>{s.pgId?.name}</TableCell><TableCell>{s.roomId?.roomNumber}</TableCell>
                            <TableCell>₹{s.monthlyRent}</TableCell><TableCell><StatusChip status={s.status} /></TableCell>
                            </TableRow>)}</TableBody></Table></CardContent></Card><Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md"><DialogTitle>Add Student</DialogTitle><DialogContent sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, pt: 2 }}><TextField select label="PG" value={v.pgId} onChange={e => setV({ ...v, pgId: e.target.value, roomId: "" })}>{pgs.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}</TextField><TextField select label="Room" value={v.roomId} onChange={e => setV({ ...v, roomId: e.target.value })}>{roomOptions.map(r => <MenuItem key={r._id} value={r._id}>Room {r.roomNumber} ({r.availableBeds} beds)</MenuItem>)}</TextField>{[["name", "Full name"], ["phone", "Phone"], ["email", "Email"], ["registrationNumber", "Registration number"], ["guardianName", "Guardian name"], ["guardianPhone", "Guardian phone"], ["college", "College"], ["bedNumber", "Bed number"]].map(([k, l]) => <TextField key={k} label={l} value={v[k]} onChange={e => setV({ ...v, [k]: e.target.value })} />)}<TextField type="date" label="Joining date" InputLabelProps={{ shrink: true }} value={v.joiningDate} onChange={e => setV({ ...v, joiningDate: e.target.value })} /><TextField type="number" label="Monthly rent" value={v.monthlyRent} onChange={e => setV({ ...v, monthlyRent: Number(e.target.value) })} /><TextField type="number" label="Security deposit" value={v.securityDeposit} onChange={e => setV({ ...v, securityDeposit: Number(e.target.value) })} /><TextField type="number" label="Deposit paid" value={v.securityDepositPaid} onChange={e => setV({ ...v, securityDepositPaid: Number(e.target.value) })} /></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions></Dialog></Box> }

