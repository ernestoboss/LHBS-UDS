import { useState, useEffect } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { ref, onValue, set, remove } from "firebase/database";
import { auth, db } from "./firebase";

// ── HALLS DATA ──────────────────────────────────────────────────────────────
const HALLS_RAW = [
  { id:"BS-GF-LT1",  name:"BS GF LT 1",      fullName:"Biological Sciences Ground Floor Lecture Theatre 1",   block:"Biological Sciences (BS)",      capacity:60 },
  { id:"BS-GF-LT2",  name:"BS GF LT 2",      fullName:"Biological Sciences Ground Floor Lecture Theatre 2",   block:"Biological Sciences (BS)",      capacity:54 },
  { id:"BS-GF-LT3",  name:"BS GF LT 3",      fullName:"Biological Sciences Ground Floor Lecture Theatre 3",   block:"Biological Sciences (BS)",      capacity:57 },
  { id:"BS-GF-LT4",  name:"BS GF LT 4",      fullName:"Biological Sciences Ground Floor Lecture Theatre 4",   block:"Biological Sciences (BS)",      capacity:135 },
  { id:"PS-FF-LT5",  name:"PS FF LT 5",      fullName:"Physical Sciences First Floor Lecture Theatre 5", block:"Physical Sciences (PS)",    capacity:45 },
  { id:"PS-FF-LT6",  name:"PS FF LT 6",      fullName:"Physical Sciences First Floor Lecture Theatre 6", block:"Physical Sciences (PS)",    capacity:75 },
  { id:"PS-FF-LT7",  name:"PS FF LT 7",      fullName:"Physical Sciences First Floor Lecture Theatre 7", block:"Physical Sciences (PS)",    capacity:153 },
  { id:"AG-LT8",     name:"AG LT 8",         fullName:"Agriculture Block Lecture Theatre 8",              block:"Agriculture (AG)",          capacity:60 },
  { id:"AG-LT9",     name:"AG LT 9",         fullName:"Agriculture Block Lecture Theatre 9",              block:"Agriculture (AG)",          capacity:54 },
  { id:"VS-LT10",    name:"VS LT 10",        fullName:"Veterinary Sciences Lecture Theatre 10",           block:"Veterinary Sciences (VS)",  capacity:36 },
  { id:"VS-LT11",    name:"VS LT 11",        fullName:"Veterinary Sciences Lecture Theatre 11",           block:"Veterinary Sciences (VS)",  capacity:51 },
  { id:"VS-LT12",    name:"VS LT 12",        fullName:"Veterinary Sciences Lecture Theatre 12",           block:"Veterinary Sciences (VS)",  capacity:48 },
  { id:"AUDITORIUM", name:"AUDITORIUM",      fullName:"Main Auditorium, Nyankpala Campus",                block:"Main Campus",               capacity:500 },
  { id:"LIB-LT1",    name:"LIB LT 1",        fullName:"Library Block Lecture Theatre 1",                 block:"Library (LIB)",             capacity:102 },
  { id:"LIB-LT2",    name:"LIB LT 2",        fullName:"Library Block Lecture Theatre 2",                 block:"Library (LIB)",             capacity:112 },
  { id:"LIB-LT3",    name:"LIB LT 3",        fullName:"Library Block Lecture Theatre 3",                 block:"Library (LIB)",             capacity:84 },
  { id:"GREAT-HALL-A",name:"GREAT HALL A",   fullName:"Great Hall A, Nyankpala Campus",                  block:"Great Hall",                capacity:204 },
  { id:"GREAT-HALL-B",name:"GREAT HALL B",   fullName:"Great Hall B, Nyankpala Campus",                  block:"Great Hall",                capacity:192 },
  { id:"GREAT-HALL-C",name:"GREAT HALL C",   fullName:"Great Hall C, Nyankpala Campus",                  block:"Great Hall",                capacity:192 },
  { id:"DAAD-LT1",   name:"DAAD LT 1",       fullName:"DAAD Block Lecture Theatre 1",                    block:"MEET UNIT",                      capacity:84 },
  { id:"DAAD-LT2",   name:"DAAD LT 2",       fullName:"DAAD Block Lecture Theatre 2",                    block:"MEET UNIT",                      capacity:69 },
  { id:"DAAD-LT3",   name:"DAAD LT 3",       fullName:"DAAD Block Lecture Theatre 3",                    block:"MEET UNIT",                      capacity:126 },
  { id:"KODEG-GF-LT1",name:"KODEG GF LT 1",  fullName:"KODEG Ground Floor Lecture Theatre 1",            block:"GETFUND",                     capacity:42 },
  { id:"KODEG-GF-LT2",name:"KODEG GF LT 2",  fullName:"KODEG Ground Floor Lecture Theatre 2",            block:"GETFUND",                     capacity:42 },
  { id:"KODEG-GF-LT3",name:"KODEG GF LT 3",  fullName:"KODEG Ground Floor Lecture Theatre 3",            block:"GETFUND",                     capacity:42 },
  { id:"KODEG-GF-LT4",name:"KODEG GF LT 4",  fullName:"KODEG Ground Floor Lecture Theatre 4",            block:"GETFUND",                     capacity:42 },
  { id:"KODEG-GF-LT5",name:"KODEG GF LT 5",  fullName:"KODEG Ground Floor Lecture Theatre 5",            block:"GETFUND",                     capacity:25 },
  { id:"KODEG-FF-LT1",name:"KODEG FF LT 1",  fullName:"KODEG First Floor Lecture Theatre 1",             block:"GETFUND",                     capacity:42 },
  { id:"KODEG-FF-LT2",name:"KODEG FF LT 2",  fullName:"KODEG First Floor Lecture Theatre 2",             block:"GETFUND",                     capacity:42 },
  { id:"KODEG-FF-LT3",name:"KODEG FF LT 3",  fullName:"KODEG First Floor Lecture Theatre 3",             block:"GETFUND",                     capacity:42 },
  { id:"KODEG-FF-LT4",name:"KODEG FF LT 4",  fullName:"KODEG First Floor Lecture Theatre 4",             block:"GETFUND",                     capacity:42 },
  { id:"KODEG-FF-LT5",name:"KODEG FF LT 5",  fullName:"KODEG First Floor Lecture Theatre 5",             block:"GETFUND",                     capacity:25 },
  { id:"SJ-GF-LT1A", name:"SJ GF LT 1A",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 1A",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT1B", name:"SJ GF LT 1B",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 1B",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT2A", name:"SJ GF LT 2A",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 2A",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT2B", name:"SJ GF LT 2B",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 2B",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT3A", name:"SJ GF LT 3A",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 3A",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT3B", name:"SJ GF LT 3B",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 3B",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT4A", name:"SJ GF LT 4A",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 4A",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT4B", name:"SJ GF LT 4B",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 4B",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT5A", name:"SJ GF LT 5A",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 5A",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT5B", name:"SJ GF LT 5B",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 5B",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT6A", name:"SJ GF LT 6A",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 6A",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT6B", name:"SJ GF LT 6B",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 6B",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT7A", name:"SJ GF LT 7A",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 7A",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT7B", name:"SJ GF LT 7B",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 7B",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT8A", name:"SJ GF LT 8A",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 8A",         block:"Silver Jubilee (SJ)",                  capacity:50 },
  { id:"SJ-GF-LT8B", name:"SJ GF LT 8B",    fullName:"Silver Jubilee Block Ground Floor Lecture Theatre 8B",         block:"Silver Jubilee (SJ)",                  capacity:50 },
];

function getHallCoords(id:string, block:string){
  if(block === "Biological Sciences (BS)" || block === "Physical Sciences (PS)"){
    return {lat:9.414236, lng:-0.986316};
  }
  if(block === "Agriculture (AG)"){
    return {lat:9.4153683611, lng:-0.9861966111};
  }
  if(block === "DAAD"){
    return {lat:9.412128, lng:-0.980902};
  }
  if(block === "Library (LIB)"){
    return {lat:9.413912, lng:-0.980027};
  }
  if(block === "KODEG"){
    return {lat:9.413674, lng:-0.981385};
  }
  if(block === "Silver Jubilee (SJ)"){
    return {lat:9.415292, lng:-0.985305};
  }
  if(block === "Great Hall"){
    return {lat:9.41544, lng:-0.98644};
  }
  if(block === "Main Campus" && id === "AUDITORIUM"){
    return {lat:9.412907, lng:-0.86048};
  }
  if(block === "Veterinary Sciences (VS)"){
    if(id === "VS-LT12"){
      return {lat:9.414145, lng:-0.9858345};
    }
    return {lat:9.414622, lng:-0.9857537};
  }
  return {lat:0, lng:0};
}

const HALLS = HALLS_RAW.map(h => ({ ...h, location: h.block, coords: getHallCoords(h.id, h.block) }));

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const SHORT_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

type Hall = { id:string; name:string; fullName:string; block:string; location:string; coords:{lat:number;lng:number}; capacity:number; };
type RecurringBooking = { id:number; hallId:string; day:string; startTime:string; endTime:string; label:string; };
type DailyBooking = { id:number; hallId:string; date:string; startTime:string; endTime:string; label:string; };
type BookingForm = { date:string; startTime:string; endTime:string; label:string; };
type RecurringForm = { hallId:string; day:string; startTime:string; endTime:string; label:string; };
type ToastState = { msg:string; type:"success"|"error"|"warn"; };
type NewBooking = Omit<DailyBooking, "id">;
type BookingPassword = { value:string; updatedAt:number; };

function toMins(t: string){ const [h,m]=(t||"00:00").split(":").map(Number); return h*60+m; }
function fromMins(m: number){ return `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`; }
function nowMins(){ const n=new Date(); return n.getHours()*60+n.getMinutes(); }
function todayStr(){ return new Date().toISOString().split("T")[0]; }
function generateBookingPassword(){ return String(Math.floor(100000 + Math.random() * 900000)); }
function isAdminPath(){ return window.location.pathname.replace(/\/$/,"").endsWith("/admin"); }
function appHomePath(){ return import.meta.env.BASE_URL || "/"; }

type StarredBookings = Record<string, boolean>;
function makeStarKey(type: "recurring" | "daily", id: number){
  return `${type}-${id}`;
}
function loadStarredBookings(){
  try {
    const raw = window.localStorage.getItem("lhbs-starred");
    return raw ? JSON.parse(raw) as StarredBookings : {};
  } catch {
    return {};
  }
}
function saveStarredBookings(bookings: StarredBookings){
  try {
    window.localStorage.setItem("lhbs-starred", JSON.stringify(bookings));
  } catch {
    // ignore storage failures
  }
}

function getHallStatus(hallId: string, recurringBookings: RecurringBooking[], dailyBookings: DailyBooking[]){
  const now = nowMins();
  const todayDay = DAYS[new Date().getDay()];
  const today = todayStr();

  const allSlots = [
    ...recurringBookings.filter(b=>b.hallId===hallId && b.day===todayDay).map(b=>({...b,type:"recurring"})),
    ...dailyBookings.filter(b=>b.hallId===hallId && b.date===today).map(b=>({...b,type:"daily"})),
  ].sort((a,b)=>toMins(a.startTime)-toMins(b.startTime));

  const active = allSlots.find(b=>toMins(b.startTime)<=now && toMins(b.endTime)>now);
  if(active){
    const remaining = toMins(active.endTime)-now;
    const h=Math.floor(remaining/60), m=remaining%60;
    return {
      occupied:true,
      label:`Occupied — free in ${h>0?h+"h ":""}${m}m`,
      booking:active,
      freeAt:active.endTime,
    };
  }
  const next = allSlots.find(b=>toMins(b.startTime)>now);
  if(next){
    const until = toMins(next.startTime)-now;
    const h=Math.floor(until/60), m=until%60;
    return {
      occupied:false,
      label:`Free for ${h>0?h+"h ":""}${m}m (until ${next.startTime})`,
      booking:null,
      nextAt:next.startTime,
    };
  }
  return { occupied:false, label:"Free all day", booking:null, nextAt:null };
}

function hasConflict(hallId: string, startTime: string, endTime: string, date: string, recurringBookings: RecurringBooking[], dailyBookings: DailyBooking[], excludeId: number | null = null){
  const day = DAYS[new Date(date+"T12:00:00").getDay()];
  const slots=[
    ...recurringBookings.filter(b=>b.hallId===hallId&&b.day===day&&b.id!==excludeId),
    ...dailyBookings.filter(b=>b.hallId===hallId&&b.date===date&&b.id!==excludeId),
  ];
  const s=toMins(startTime), e=toMins(endTime);
  return slots.some(b=>s<toMins(b.endTime)&&e>toMins(b.startTime));
}

// ── THEME ───────────────────────────────────────────────────────────────────
function useTheme(){
  const [dark,setDark]=useState<boolean>(()=>{
    try {
      const stored = window.localStorage.getItem("lhbs-theme");
      return stored === "light" ? false : true;
    } catch {
      return true;
    }
  });

  useEffect(()=>{
    try {
      window.localStorage.setItem("lhbs-theme", dark ? "dark" : "light");
    } catch {
      // ignore storage write failures
    }
  },[dark]);

  const toggle=()=>setDark(d=>!d);
  const t={
    bg: dark?"#0d0f14":"#f0f2f7",
    surface: dark?"#161a24":"#ffffff",
    surface2: dark?"#1e2333":"#f8f9fc",
    border: dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",
    text: dark?"#e8eaf0":"#111827",
    textSub: dark?"#8892a4":"#6b7280",
    textHint: dark?"#4a5568":"#9ca3af",
    navBg: dark?"rgba(13,15,20,0.94)":"rgba(240,242,247,0.94)",
    cardHover: dark?"rgba(79,156,249,0.06)":"rgba(59,130,246,0.05)",
    inputBg: dark?"rgba(255,255,255,0.04)":"#ffffff",
    inputBorder: dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.15)",
    green: dark?"#22c55e":"#16a34a",
    greenBg: dark?"rgba(34,197,94,0.1)":"rgba(22,163,74,0.08)",
    greenBorder: dark?"rgba(34,197,94,0.25)":"rgba(22,163,74,0.2)",
    red: dark?"#ef4444":"#dc2626",
    redBg: dark?"rgba(239,68,68,0.1)":"rgba(220,38,38,0.08)",
    redBorder: dark?"rgba(239,68,68,0.25)":"rgba(220,38,38,0.2)",
    amber: "#f59e0b",
    amberBg: dark?"rgba(245,158,11,0.1)":"rgba(245,158,11,0.08)",
    blue: "#3b82f6",
    blueBg: dark?"rgba(59,130,246,0.1)":"rgba(59,130,246,0.08)",
    blueBorder: dark?"rgba(59,130,246,0.3)":"rgba(59,130,246,0.2)",
    accent: "#3b82f6",
    dark,
  };
  return {t,toggle,dark};
}

// ── NOTIFICATION TOAST ───────────────────────────────────────────────────────
function Toast({msg,type,t}: {msg:string; type: ToastState['type']; t:any}){
  const bg = type==="error"?"#dc2626":type==="warn"?"#d97706":"#16a34a";
  return (
    <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,padding:"13px 20px",borderRadius:12,
      background:bg,color:"#fff",fontSize:14,fontWeight:600,maxWidth:320,boxShadow:"0 8px 32px rgba(0,0,0,0.35)",
      animation:"slideIn 0.3s ease"}}>
      {msg}
    </div>
  );
}

// ── HALL DETAIL MODAL ────────────────────────────────────────────────────────
function HallDetail({hall,recurringBookings,dailyBookings,onClose,onBook,t,starredBookings,onToggleStar}: {hall: Hall; recurringBookings: RecurringBooking[]; dailyBookings: DailyBooking[]; onClose: ()=>void; onBook:(hall:Hall)=>void; t:any; starredBookings: StarredBookings; onToggleStar:(type:"recurring"|"daily",id:number)=>void}){
  const status=getHallStatus(hall.id,recurringBookings,dailyBookings);
  const openDirections=()=>{
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hall.coords.lat},${hall.coords.lng}`;
    window.open(url, "_blank");
  };
  const todayDay=DAYS[new Date().getDay()];
  const today=todayStr();
  const recurring=recurringBookings.filter(b=>b.hallId===hall.id).sort((a,b)=>DAYS.indexOf(a.day)-DAYS.indexOf(b.day)||toMins(a.startTime)-toMins(b.startTime));
  const todayDaily=dailyBookings.filter(b=>b.hallId===hall.id&&b.date===today);
  return(
    <div className="lhbs-modal-overlay" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div className="lhbs-modal" style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:20,padding:28,width:"100%",maxWidth:520,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontWeight:800,fontSize:20,color:t.text,fontFamily:"'Playfair Display',serif"}}>{hall.name}</div>
            <div style={{color:t.textSub,fontSize:13,marginTop:3}}>{hall.fullName}</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:t.textSub,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        <div className="lhbs-detail-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
          {[["Location",hall.location],["Capacity",`${hall.capacity} seats`],["Status",status.occupied?"Occupied":"Available"]].map(([k,v])=>(
            <div key={k} style={{background:t.surface2,borderRadius:10,padding:"10px 14px"}}>
              <div style={{fontSize:11,color:t.textHint,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>{k}</div>
              <div style={{fontSize:13,fontWeight:700,color:k==="Status"?(status.occupied?t.red:t.green):t.text,display:"flex",alignItems:"center",justifyContent:k==="Location"?"space-between":"flex-start",gap:10}}>
                <span>{v}</span>
                {k==="Location"&&(
                  <button onClick={openDirections} style={{background:"transparent",border:"none",color:t.blue,fontSize:18,cursor:"pointer"}} aria-label="Get directions to hall">📍</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{background:status.occupied?t.redBg:t.greenBg,border:`1px solid ${status.occupied?t.redBorder:t.greenBorder}`,borderRadius:10,padding:"10px 14px",marginBottom:20,fontSize:14,color:status.occupied?t.red:t.green,fontWeight:600}}>
          {status.label}
        </div>
        {recurring.length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:t.textSub,textTransform:"uppercase",letterSpacing:"0.05em"}}>Recurring Schedule</div>
              <div style={{fontSize:11,color:t.textHint}}>Star to get alerts</div>
            </div>
            {recurring.map(b=>{
              const starred = starredBookings[makeStarKey("recurring",b.id)];
              return (
                <div key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:t.surface2,borderRadius:8,marginBottom:6,fontSize:13}}>
                  <span style={{color:t.text,fontWeight:600}}>{b.day}</span>
                  <span style={{color:t.textSub}}>{b.startTime} – {b.endTime}</span>
                  <span style={{color:t.textHint,fontSize:12}}>{b.label||"Class"}</span>
                  <button onClick={()=>onToggleStar("recurring",b.id)} style={{background:"transparent",border:"none",color:starred?"#fbbf24":t.textSub,fontSize:18,cursor:"pointer"}} aria-label={starred?"Unsubscribe":"Subscribe"}>
                    {starred?"★":"☆"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {todayDaily.length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:t.textSub,textTransform:"uppercase",letterSpacing:"0.05em"}}>Today's Extra Bookings</div>
              <div style={{fontSize:11,color:t.textHint}}>Star to get alerts</div>
            </div>
            {todayDaily.map(b=>{
              const starred = starredBookings[makeStarKey("daily",b.id)];
              return (
                <div key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:t.amberBg,border:`1px solid rgba(245,158,11,0.2)`,borderRadius:8,marginBottom:6,fontSize:13}}>
                  <span style={{color:t.text,fontWeight:600}}>{b.startTime} – {b.endTime}</span>
                  <span style={{color:t.textSub}}>{b.label||"Daily booking"}</span>
                  <span style={{color:t.amber,fontSize:11,fontWeight:600}}>TODAY</span>
                  <button onClick={()=>onToggleStar("daily",b.id)} style={{background:"transparent",border:"none",color:starred?"#fbbf24":t.textSub,fontSize:18,cursor:"pointer"}} aria-label={starred?"Unsubscribe":"Subscribe"}>
                    {starred?"★":"☆"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <button onClick={()=>onBook(hall)} style={{width:"100%",padding:"12px",borderRadius:12,background:"linear-gradient(135deg,#3b82f6,#2563eb)",color:"#fff",border:"none",fontSize:15,fontWeight:700,cursor:"pointer"}}>
          Book This Hall
        </button>
      </div>
    </div>
  );
}

// ── BOOK MODAL ────────────────────────────────────────────────────────────────
function BookModal({hall,recurringBookings,dailyBookings,bookingPassword,onConfirm,onClose,t}: {hall: Hall; recurringBookings: RecurringBooking[]; dailyBookings: DailyBooking[]; bookingPassword: string; onConfirm:(booking: NewBooking)=>void; onClose:()=>void; t:any}){
  const [step,setStep]=useState<"form"|"confirm">("form");
  const [form,setForm]=useState<BookingForm>({date:todayStr(),startTime:"",endTime:"",label:""});
  const [formError,setFormError]=useState("");
  const [password,setPassword]=useState("");
  const [passwordError,setPasswordError]=useState("");

  function checkForm(){
    setFormError("");
    if(!form.startTime||!form.endTime){setFormError("Please set start and end times.");return;}
    if(toMins(form.startTime)>=toMins(form.endTime)){setFormError("End time must be after start time.");return;}
    if(hasConflict(hall.id,form.startTime,form.endTime,form.date,recurringBookings,dailyBookings)){
      setFormError("This hall is already booked for that time. Please choose a different slot.");return;
    }
    setStep("confirm");
  }
  function confirm(){
    setPasswordError("");
    if(!bookingPassword){
      setPasswordError("Please take password from admin.");
      return;
    }
    if(password.trim() !== bookingPassword){
      setPasswordError("Incorrect booking password.");
      return;
    }
    onConfirm({hallId:hall.id,date:form.date,startTime:form.startTime,endTime:form.endTime,label:form.label||"Class"});
    onClose();
  }

  return(
    <div className="lhbs-modal-overlay" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div className="lhbs-modal" style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:20,padding:28,width:"100%",maxWidth:400}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontWeight:800,fontSize:18,color:t.text,fontFamily:"'Playfair Display',serif"}}>
            {step==="form"?`Book ${hall.name}`:"Confirm Booking"}
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:t.textSub,fontSize:22,cursor:"pointer"}}>×</button>
        </div>

        {step==="form"&&(
          <>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:t.textSub,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>Date</label>
              <input type="date" value={form.date} min={todayStr()} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                style={{width:"100%",padding:"11px 14px",borderRadius:10,background:t.inputBg,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:14,boxSizing:"border-box",outline:"none"}}/>
            </div>
            <div className="lhbs-form-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {([["startTime","Start Time"],["endTime","End Time"]] as Array<[keyof BookingForm,string]>).map(([k,lbl])=>( 



                <div key={k}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:t.textSub,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{lbl}</label>
                  <input type="time" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    style={{width:"100%",padding:"11px 14px",borderRadius:10,background:t.inputBg,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:14,boxSizing:"border-box",outline:"none"}}/>
                </div>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:t.textSub,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>Purpose / Label</label>
              <input type="text" placeholder="e.g. CS301 Lecture" value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))}
                style={{width:"100%",padding:"11px 14px",borderRadius:10,background:t.inputBg,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:14,boxSizing:"border-box",outline:"none"}}/>
            </div>
            {formError&&<div style={{color:t.red,fontSize:13,marginBottom:10,padding:"8px 12px",background:t.redBg,borderRadius:8}}>{formError}</div>}
            <button onClick={checkForm} style={{width:"100%",padding:"12px",borderRadius:12,background:"linear-gradient(135deg,#3b82f6,#2563eb)",color:"#fff",border:"none",fontSize:15,fontWeight:700,cursor:"pointer"}}>
              Next →
            </button>
          </>
        )}

        {step==="confirm"&&(
          <>
            <div style={{background:t.surface2,borderRadius:12,padding:16,marginBottom:20}}>
              <div style={{fontSize:13,color:t.textSub,marginBottom:8}}>Booking Summary</div>
              {[["Hall",hall.name],["Date",form.date],["Time",`${form.startTime} – ${form.endTime}`],["Purpose",form.label||"Class"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${t.border}`,fontSize:14}}>
                  <span style={{color:t.textSub}}>{k}</span><span style={{color:t.text,fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:t.textSub,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>Booking Password</label>
              <input type="password" placeholder="Enter admin-generated password" value={password} onChange={e=>setPassword(e.target.value)}
                style={{width:"100%",padding:"11px 14px",borderRadius:10,background:t.inputBg,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:14,boxSizing:"border-box",outline:"none"}}/>
              {passwordError&&<div style={{color:t.red,fontSize:13,marginTop:8,padding:"8px 12px",background:t.redBg,borderRadius:8}}>{passwordError}</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <button onClick={onClose} style={{padding:"12px",borderRadius:12,background:"transparent",border:`1px solid ${t.border}`,color:t.textSub,fontSize:14,fontWeight:600,cursor:"pointer"}}>Cancel</button>
              <button onClick={confirm} style={{padding:"12px",borderRadius:12,background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:"pointer"}}>Confirm Booking</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({
  recurringBookings,
  dailyBookings,
  onAddRecurring,
  onRemoveRecurring,
  onRemoveDaily,
  bookingPassword,
  onGenerateBookingPassword,
  user,
  onLogout,
  t,
}: {
  recurringBookings: RecurringBooking[];
  dailyBookings: DailyBooking[];
  onAddRecurring: (booking: RecurringBooking)=>void;
  onRemoveRecurring: (id:number)=>void;
  onRemoveDaily: (id:number)=>void;
  bookingPassword: BookingPassword | null;
  onGenerateBookingPassword: ()=>void;
  user: User | null;
  onLogout: ()=>void;
  t:any;
}){
  const [tab,setTab]=useState("recurring");
  const [rForm,setRForm]=useState<RecurringForm>({hallId:"",day:"Monday",startTime:"",endTime:"",label:""});
  const [rError,setRError]=useState("");
  const [loginEmail,setLoginEmail]=useState("");
  const [loginPassword,setLoginPassword]=useState("");
  const [loginError,setLoginError]=useState("");
  const [loginLoading,setLoginLoading]=useState(false);

  async function loginAdmin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err: any) {
      setLoginError(err.message || "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  }

  function addRecurring(){
    setRError("");
    if(!rForm.hallId||!rForm.startTime||!rForm.endTime){setRError("Fill all fields.");return;}
    if(toMins(rForm.startTime)>=toMins(rForm.endTime)){setRError("End must be after start.");return;}
    const conflict=recurringBookings.some(b=>b.hallId===rForm.hallId&&b.day===rForm.day&&toMins(rForm.startTime)<toMins(b.endTime)&&toMins(rForm.endTime)>toMins(b.startTime));
    if(conflict){setRError("Conflict with existing recurring booking.");return;}
    onAddRecurring({id:Date.now(),...rForm,label:rForm.label||"Class"});
    setRForm({hallId:"",day:"Monday",startTime:"",endTime:"",label:""});
  }

  function removeRecurring(id: number){ onRemoveRecurring(id); }
  function removeDaily(id: number){ onRemoveDaily(id); }

  if(!user) return(
    <div className="lhbs-admin-login" style={{maxWidth:400,margin:"4rem auto",padding:"0 1rem"}}>
      <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:20,padding:28}}>
        <div style={{fontWeight:800,fontSize:22,color:t.text,fontFamily:"'Playfair Display',serif",marginBottom:6}}>Admin Login</div>
        <div style={{color:t.textSub,fontSize:13,marginBottom:20}}>Sign in with your admin account to manage bookings.</div>
        <form onSubmit={loginAdmin}>
          <input type="email" placeholder="Admin email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}
            style={{width:"100%",padding:"12px 14px",borderRadius:10,background:t.inputBg,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:14,boxSizing:"border-box",outline:"none",marginBottom:10}}/>
          <input type="password" placeholder="Password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)}
            style={{width:"100%",padding:"12px 14px",borderRadius:10,background:t.inputBg,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:14,boxSizing:"border-box",outline:"none",marginBottom:10}}/>
          {loginError&&<div style={{color:t.red,fontSize:13,marginBottom:10}}>{loginError}</div>}
          <button type="submit" disabled={loginLoading} style={{width:"100%",padding:"12px",borderRadius:12,background:"linear-gradient(135deg,#3b82f6,#2563eb)",color:"#fff",border:"none",fontSize:15,fontWeight:700,cursor:loginLoading?"not-allowed":"pointer"}}>
            {loginLoading?"Signing in...":"Sign in"}
          </button>
        </form>
      </div>
    </div>
  );

  return(
    <div className="lhbs-admin-page" style={{maxWidth:1040,margin:"0 auto",padding:"2rem 1rem"}}>
      <div className="lhbs-admin-header" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,marginBottom:22,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:t.textSub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Admin Workspace</div>
          <div style={{fontWeight:800,fontSize:28,color:t.text,fontFamily:"'Playfair Display',serif",marginBottom:5}}>Booking Control Center</div>
          <div style={{color:t.textSub,fontSize:14,lineHeight:1.6}}>Manage recurring schedules, daily reservations, and the booking password.</div>
        </div>
        <button onClick={onLogout} style={{padding:"10px 16px",borderRadius:10,background:t.surface,border:`1px solid ${t.border}`,color:t.textSub,fontSize:13,fontWeight:700,cursor:"pointer"}}>
          Sign out
        </button>
      </div>

      <div className="lhbs-admin-password-panel" style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:16,padding:20,marginBottom:18,display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",flexWrap:"wrap",boxShadow:"0 18px 60px rgba(0,0,0,0.08)"}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:t.textSub,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Booking Password</div>
          <div style={{fontSize:28,fontWeight:800,color:t.text,letterSpacing:"0.08em"}}>{bookingPassword?.value || "Not set"}</div>
          <div style={{fontSize:12,color:t.textHint,marginTop:4}}>
            Users must enter this password before a hall booking is saved.
          </div>
        </div>
        <button onClick={onGenerateBookingPassword} style={{padding:"11px 18px",borderRadius:10,background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:"pointer"}}>
          Generate New Password
        </button>
      </div>

      <div className="lhbs-admin-tabs" style={{display:"flex",gap:8,marginBottom:22,flexWrap:"wrap",padding:6,background:t.surface,border:`1px solid ${t.border}`,borderRadius:14}}>
        {[['recurring','🔄 Recurring'],['daily','📅 Daily'],['halls','🏛 All Halls']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{padding:"9px 16px",borderRadius:10,border:`1px solid ${tab===id?"#3b82f6":"transparent"}`,background:tab===id?"rgba(59,130,246,0.12)":"transparent",color:tab===id?"#60a5fa":t.textSub,fontWeight:tab===id?700:600,fontSize:14,cursor:"pointer",flex:"1 1 150px"}}>
            {lbl}
          </button>
        ))}
      </div>


      {tab==="recurring"&&(
        <div>
          <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:16,padding:22,marginBottom:20}}>
            <div style={{fontSize:16,fontWeight:800,color:t.text,marginBottom:4}}>Add Recurring Booking</div>
            <div style={{fontSize:13,color:t.textSub,marginBottom:16}}>Create a weekly timetable slot for a hall.</div>
            <div className="lhbs-admin-form-grid" style={{display:"grid",gridTemplateColumns:"minmax(220px,2fr) repeat(4,minmax(120px,1fr))",gap:10,alignItems:"end"}}>
              <div>
                <label style={{display:"block",fontSize:11,color:t.textSub,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>Hall</label>
                <select value={rForm.hallId} onChange={e=>setRForm(f=>({...f,hallId:e.target.value}))}
                  style={{width:"100%",padding:"10px 12px",borderRadius:8,background:t.surface2,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:13,outline:"none"}}>
                  <option value="">— Select Hall —</option>
                  {HALLS.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,color:t.textSub,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>Day</label>
                <select value={rForm.day} onChange={e=>setRForm(f=>({...f,day:e.target.value}))}
                  style={{width:"100%",padding:"10px 12px",borderRadius:8,background:t.surface2,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:13,outline:"none"}}>
                  {DAYS.slice(1,6).map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,color:t.textSub,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>Start</label>
                <input type="time" value={rForm.startTime} onChange={e=>setRForm(f=>({...f,startTime:e.target.value}))}
                  style={{width:"100%",padding:"10px 12px",borderRadius:8,background:t.surface2,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,color:t.textSub,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>End</label>
                <input type="time" value={rForm.endTime} onChange={e=>setRForm(f=>({...f,endTime:e.target.value}))}
                  style={{width:"100%",padding:"10px 12px",borderRadius:8,background:t.surface2,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,color:t.textSub,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>Label</label>
                <input type="text" placeholder="Class" value={rForm.label} onChange={e=>setRForm(f=>({...f,label:e.target.value}))}
                  style={{width:"100%",padding:"10px 12px",borderRadius:8,background:t.surface2,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
            {rError&&<div style={{color:t.red,fontSize:13,marginTop:10,padding:"8px 12px",background:t.redBg,borderRadius:8}}>{rError}</div>}
            <button onClick={addRecurring} style={{marginTop:14,padding:"10px 22px",borderRadius:10,background:"linear-gradient(135deg,#3b82f6,#2563eb)",color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:"pointer"}}>
              + Add Recurring
            </button>
          </div>
          {recurringBookings.length===0&&<div style={{color:t.textSub,fontSize:14,textAlign:"center",padding:"2rem 0"}}>No recurring bookings yet.</div>}
          {recurringBookings.sort((a,b)=>HALLS.findIndex(h=>h.id===a.hallId)-HALLS.findIndex(h=>h.id===b.hallId)).map(b=>{
            const hall=HALLS.find(h=>h.id===b.hallId);
            return(
              <div className="lhbs-admin-list-row" key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,padding:"14px 16px",background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,marginBottom:8}}>
                <div>
                  <span style={{fontWeight:700,fontSize:14,color:t.text}}>{hall?.name}</span>
                  <span style={{color:t.textSub,fontSize:13,margin:"0 10px"}}>·</span>
                  <span style={{color:t.textSub,fontSize:13}}>{b.day} · {b.startTime}–{b.endTime}</span>
                  <span style={{color:t.textHint,fontSize:12,marginLeft:8}}>{b.label}</span>
                </div>
                <button onClick={()=>removeRecurring(b.id)} style={{padding:"5px 12px",borderRadius:8,background:t.redBg,border:`1px solid ${t.redBorder}`,color:t.red,fontSize:12,fontWeight:600,cursor:"pointer"}}>Remove</button>
              </div>
            );
          })}
        </div>
      )}

      {tab==="daily"&&(
        <div>
          <div style={{fontWeight:700,fontSize:14,color:t.textSub,marginBottom:16}}>Daily bookings made by users. These auto-expire after the booking time elapses.</div>
          {dailyBookings.length===0&&<div style={{color:t.textSub,fontSize:14,textAlign:"center",padding:"2rem 0"}}>No daily bookings.</div>}
          {dailyBookings.map(b=>{
            const hall=HALLS.find(h=>h.id===b.hallId);
            return(
              <div className="lhbs-admin-list-row" key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,padding:"14px 16px",background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,marginBottom:8}}>
                <div>
                  <span style={{fontWeight:700,fontSize:14,color:t.text}}>{hall?.name}</span>
                  <span style={{color:t.textSub,fontSize:13,margin:"0 10px"}}>·</span>
                  <span style={{color:t.textSub,fontSize:13}}>{b.date} · {b.startTime}–{b.endTime}</span>
                  <span style={{color:t.textHint,fontSize:12,marginLeft:8}}>{b.label}</span>
                </div>
                <button onClick={()=>removeDaily(b.id)} style={{padding:"5px 12px",borderRadius:8,background:t.redBg,border:`1px solid ${t.redBorder}`,color:t.red,fontSize:12,fontWeight:600,cursor:"pointer"}}>Cancel</button>
              </div>
            );
          })}
        </div>
      )}

      {tab==="halls"&&(
        <div className="lhbs-admin-halls-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
          {HALLS.map(h=>{
            const todayDay=DAYS[new Date().getDay()];
            const today=todayStr();
            const rCount=recurringBookings.filter(b=>b.hallId===h.id).length;
            const dCount=dailyBookings.filter(b=>b.hallId===h.id&&b.date===today).length;
            const status=getHallStatus(h.id,recurringBookings,dailyBookings);
            return(
              <div key={h.id} style={{background:t.surface,border:`1px solid ${status.occupied?t.redBorder:t.border}`,borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontWeight:700,fontSize:13,color:t.text,marginBottom:3}}>{h.name}</div>
                <div style={{fontSize:11,color:t.textSub,marginBottom:8}}>{h.location}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:status.occupied?t.redBg:t.greenBg,color:status.occupied?t.red:t.green,fontWeight:600}}>
                    {status.occupied?"Occupied":"Free"}
                  </span>
                  {rCount>0&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:t.blueBg,color:"#60a5fa",fontWeight:600}}>{rCount} recurring</span>}
                  {dCount>0&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:t.amberBg,color:t.amber,fontWeight:600}}>{dCount} today</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── HALL CARD ────────────────────────────────────────────────────────────────
function HallCard({hall,recurringBookings,dailyBookings,onDetail,onBook,t,tick}: {hall: Hall; recurringBookings: RecurringBooking[]; dailyBookings: DailyBooking[]; onDetail:(hall:Hall)=>void; onBook:(hall:Hall)=>void; t:any; tick:number}){
  const status=getHallStatus(hall.id,recurringBookings,dailyBookings);
  const occ=status.occupied;
  return(
    <div
      onClick={()=>onDetail(hall)}
      style={{background:t.surface,border:`1.5px solid ${occ?t.redBorder:t.greenBorder}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",transition:"all 0.2s",position:"relative",overflow:"hidden"}}
    >
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:occ?"#ef4444":"#22c55e",borderRadius:"14px 14px 0 0"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{fontWeight:800,fontSize:13,color:t.text,letterSpacing:"0.01em"}}>{hall.name}</div>
        <div style={{width:8,height:8,borderRadius:"50%",background:occ?"#ef4444":"#22c55e",flexShrink:0,marginTop:3}}/>
      </div>
      <div style={{fontSize:11,color:t.textSub,marginBottom:8,lineHeight:1.4}}>📍 {hall.location}</div>
      <div style={{fontSize:12,color:occ?t.red:t.green,fontWeight:600,lineHeight:1.4}}>{status.label}</div>
      {status.booking&&(
        <div style={{marginTop:6,fontSize:11,color:t.textHint}}>{status.booking.label} · ends {status.booking.endTime}</div>
      )}
      <button
        onClick={e=>{e.stopPropagation();onBook(hall);}}
        style={{marginTop:10,width:"100%",padding:"7px",borderRadius:8,background:"transparent",border:`1px solid ${t.border}`,color:t.textSub,fontSize:12,fontWeight:600,cursor:"pointer"}}>
        Book
      </button>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const {t,toggle,dark}=useTheme();
  const [page,setPage]=useState<"home"|"admin">(()=>isAdminPath() ? "admin" : "home");
  const [recurringBookings,setRecurringBookings]=useState<RecurringBooking[]>([]);
  const [dailyBookings,setDailyBookings]=useState<DailyBooking[]>([]);
  const [starredBookings,setStarredBookings]=useState<StarredBookings>(()=>loadStarredBookings());
  const [bookingPassword,setBookingPassword]=useState<BookingPassword | null>(null);
  const [user,setUser]=useState<User | null>(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [detailHall,setDetailHall]=useState<Hall | null>(null);
  const [bookHall,setBookHall]=useState<Hall | null>(null);
  const [toast,setToast]=useState<ToastState | null>(null);
  const [tick,setTick]=useState<number>(0);
  const [notifiedMap,setNotifiedMap]=useState<Record<string,boolean>>({});
  const [mobileNav,setMobileNav]=useState<boolean>(false);
  const [statusFilter,setStatusFilter]=useState<"all"|"available"|"occupied">("all");
  const [hallSearch,setHallSearch]=useState("");

  useEffect(()=>{
    const syncPageFromPath = () => setPage(isAdminPath() ? "admin" : "home");
    window.addEventListener("popstate",syncPageFromPath);
    return()=>window.removeEventListener("popstate",syncPageFromPath);
  },[]);

  useEffect(()=>onAuthStateChanged(auth,user=>{
    setUser(user);
    setAuthLoading(false);
  }),[]);

  useEffect(()=>{
    saveStarredBookings(starredBookings);
  },[starredBookings]);

  useEffect(()=>{
    const recurringRef = ref(db,"recurringBookings");
    return onValue(recurringRef,snapshot=>{
      const raw = snapshot.val() || {};
      const items = raw && typeof raw === "object" ? Object.values(raw) as RecurringBooking[] : [];
      setRecurringBookings(items);
    });
  },[]);

  useEffect(()=>{
    const dailyRef = ref(db,"dailyBookings");
    return onValue(dailyRef,snapshot=>{
      const raw = snapshot.val() || {};
      const items = raw && typeof raw === "object" ? Object.values(raw) as DailyBooking[] : [];
      setDailyBookings(items);
    });
  },[]);

  useEffect(()=>{
    const passwordRef = ref(db,"bookingPassword");
    return onValue(passwordRef,snapshot=>{
      setBookingPassword(snapshot.val() as BookingPassword | null);
    });
  },[]);

  function saveDailyBooking(booking: DailyBooking){
    set(ref(db,`dailyBookings/${booking.id}`),booking);
  }

  function saveRecurringBooking(booking: RecurringBooking){
    set(ref(db,`recurringBookings/${booking.id}`),booking);
  }

  function deleteRecurringBooking(id:number){
    remove(ref(db,`recurringBookings/${id}`));
  }

  function deleteDailyBooking(id:number){
    remove(ref(db,`dailyBookings/${id}`));
  }

  function saveBookingPassword(){
    set(ref(db,"bookingPassword"),{ value: generateBookingPassword(), updatedAt: Date.now() });
    showToast("New booking password generated.");
  }

  function handleLogout(){
    signOut(auth).catch(()=>{});
  }

  function handleBookRequest(hall: Hall){
    setBookHall(hall);
  }

  function requestNotificationPermission(){
    if(typeof Notification === "undefined" || !("permission" in Notification)) return;
    if(Notification.permission === "default"){
      Notification.requestPermission();
    }
  }

  function toggleStar(type: "recurring" | "daily", id: number){
    const key = makeStarKey(type,id);
    const currentlyStarred = !!starredBookings[key];
    setStarredBookings(prev=>{
      const next = {...prev};
      if(next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
    if(currentlyStarred){
      showToast("Unsubscribed from notifications for this booking.","warn");
    } else {
      requestNotificationPermission();
      showToast("Subscribed to notifications for this booking.");
    }
  }

  function navigateHome(){
    window.history.pushState(null,"",appHomePath());
    setPage("home");
  }

  // Clock tick every 30s to refresh statuses
  useEffect(()=>{
    const id=setInterval(()=>setTick(x=>x+1),30000);
    return()=>clearInterval(id);
  },[]);

  // Expire old daily bookings
  useEffect(()=>{
    const now=nowMins();
    const today=todayStr();
    dailyBookings.forEach(b=>{
      if(b.date<today || (b.date===today&&toMins(b.endTime)<=now)){
        remove(ref(db,`dailyBookings/${b.id}`));
      }
    });
  },[tick,dailyBookings]);

  function maybeNotifyUser(msg:string,type:ToastState['type'],bookingType:"recurring"|"daily",bookingId:number){
    showToast(msg,type);
    const starKey = makeStarKey(bookingType,bookingId);
    if(!starredBookings[starKey]) return;
    if(typeof Notification !== "undefined" && Notification.permission === "granted"){
      new Notification("LHBS Notification", { body: msg });
    }
  }

  // Notifications: 10min before + on end
  useEffect(()=>{
    const now=nowMins();
    const todayDay=DAYS[new Date().getDay()];
    const today=todayStr();
    const allBookings=[
      ...recurringBookings.filter(b=>b.day===todayDay).map(b=>({...b,date:today,bookingType:"recurring" as const})),
      ...dailyBookings.filter(b=>b.date===today).map(b=>({...b,bookingType:"daily" as const})),
    ];
    allBookings.forEach(b=>{
      const start=toMins(b.startTime);
      const end=toMins(b.endTime);
      const hall=HALLS.find(h=>h.id===b.hallId);
      const keyPre=`${b.id}-pre`;
      const keyEnd=`${b.id}-end`;
      if(!notifiedMap[keyPre]&&now>=start-10&&now<start){
        setNotifiedMap(m=>({...m,[keyPre]:true}));
        maybeNotifyUser(`⏰ ${hall?.name}: class starts in ${start-now} min!`,`warn`,b.bookingType,b.id);
      }
      if(!notifiedMap[keyEnd]&&now>=end&&now<end+2){
        setNotifiedMap(m=>({...m,[keyEnd]:true}));
        maybeNotifyUser(`✅ ${hall?.name}: class ended. Hall is now free.`,`success`,b.bookingType,b.id);
      }
    });
  },[tick,recurringBookings,dailyBookings,notifiedMap,starredBookings]);

  function showToast(msg:string,type:ToastState['type']="success"){
    setToast({msg,type});
    setTimeout(()=>setToast(null),4500);
  }

  function handleConfirmBooking(booking: NewBooking){
    const newBooking: DailyBooking = {id: Date.now(), ...booking};
    setDailyBookings(prev=>[...prev,newBooking]);
    saveDailyBooking(newBooking);
    showToast(`✅ ${HALLS.find(h=>h.id===booking.hallId)?.name} booked for ${booking.startTime}–${booking.endTime}`);
  }

  const searchTerm=hallSearch.trim().toLowerCase();
  const searchedHalls=searchTerm
    ? HALLS.filter(h=>`${h.name} ${h.fullName} ${h.location} ${h.id}`.toLowerCase().includes(searchTerm))
    : HALLS;
  const occupiedAll=HALLS.filter(h=>getHallStatus(h.id,recurringBookings,dailyBookings).occupied);
  const availableAll=HALLS.filter(h=>!getHallStatus(h.id,recurringBookings,dailyBookings).occupied);
  const occupied=searchedHalls.filter(h=>getHallStatus(h.id,recurringBookings,dailyBookings).occupied);
  const available=searchedHalls.filter(h=>!getHallStatus(h.id,recurringBookings,dailyBookings).occupied);
  const filteredHalls=statusFilter==="all"?searchedHalls:statusFilter==="available"?available:occupied;
  const stats=[
    {icon:"🟢",count:available.length,label:"Available Now",filter:"available",color:t.green,bg:t.greenBg},
    {icon:"🔴",count:occupied.length,label:"In Use",filter:"occupied",color:t.red,bg:t.redBg},
    {icon:"🏛",count:HALLS.length,label:"Total Halls",filter:"all",color:t.blue,bg:t.blueBg},
  ] as const;

  return(
    <div className="lhbs-app" style={{minHeight:"100vh",background:t.bg,color:t.text,fontFamily:"'DM Sans','Segoe UI',sans-serif",transition:"background 0.3s,color 0.3s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html, body, #root {min-height:100%;}
        input[type=date]::-webkit-calendar-picker-indicator,
        input[type=time]::-webkit-calendar-picker-indicator{filter:${dark?"invert(1)":"none"};opacity:0.5;}
        ::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(128,128,128,0.3);border-radius:3px;}
        @keyframes slideIn{from{transform:translateX(40px);opacity:0;}to{transform:translateX(0);opacity:1;}}
        @keyframes pulseGreen{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4);}50%{box-shadow:0 0 0 8px rgba(34,197,94,0);}}
        .lhbs-app nav {flex-wrap:wrap;gap:0.75rem;}
        .lhbs-app .lhbs-nav-actions {display:flex;align-items:center;flex-wrap:wrap;gap:0.75rem;justify-content:flex-end;}
        .lhbs-app .lhbs-stats {display:flex;flex-wrap:wrap;justify-content:center;gap:1rem;}
        .lhbs-app .lhbs-stat-card {min-width:180px;flex:1 1 180px;}
        .lhbs-app .lhbs-grid {display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;}
        .lhbs-app .lhbs-form-grid {display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;}
        .lhbs-app .lhbs-modal-overlay {padding:16px;}
        .lhbs-app .lhbs-modal {width:100%;max-width:420px;margin:0 1rem;}
        .lhbs-app .lhbs-detail-grid {display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}
        .lhbs-app .lhbs-admin-page {padding:2rem 1rem;max-width:900px;margin:0 auto;}
        .lhbs-app .lhbs-admin-login {max-width:400px;margin:4rem auto;padding:0 1rem;}
        .lhbs-app .lhbs-admin-form-grid {grid-template-columns:minmax(220px,2fr) repeat(4,minmax(120px,1fr));}
        .lhbs-app .lhbs-admin-list-row > div:first-child {min-width:0;}
        .lhbs-app .lhbs-admin-list-row button {flex-shrink:0;}
        @media (max-width: 900px) {
          .lhbs-app nav {justify-content:space-between;}
          .lhbs-app nav > div:first-child {width:auto;text-align:left;}
          .lhbs-app .lhbs-nav-actions {justify-content:flex-end;width:auto;}
          .lhbs-app .lhbs-hero p {max-width:90%;margin:0 auto;}
          .lhbs-app .lhbs-admin-page {padding:1.5rem 1rem;}
          .lhbs-app .lhbs-admin-form-grid {grid-template-columns:repeat(2,minmax(0,1fr)) !important;}
        }
        @media (max-width: 640px) {
          .lhbs-app nav {height:auto;min-height:60px;padding:0.75rem 1rem;align-items:center;justify-content:space-between;gap:0.75rem;}
          .lhbs-app nav > div:first-child {flex:1 1 auto;min-width:0;}
          .lhbs-app nav > div:last-child {width:auto;justify-content:flex-end;flex:0 0 auto;}
          .lhbs-app .lhbs-hero {padding:1rem 0;}
          .lhbs-app .lhbs-grid {grid-template-columns:1fr;}
          .lhbs-app .lhbs-form-grid {grid-template-columns:1fr;}
          .lhbs-app .lhbs-modal {max-width:100%;border-radius:18px;}
          .lhbs-app .lhbs-detail-grid {grid-template-columns:1fr;}
          .lhbs-app .lhbs-admin-login {padding:0 1rem;}
          .lhbs-app .lhbs-admin-page {padding:1rem;}
          .lhbs-app .lhbs-stat-card {min-width:100%;}
          .lhbs-app .lhbs-admin-header,
          .lhbs-app .lhbs-admin-password-panel,
          .lhbs-app .lhbs-admin-list-row {align-items:stretch !important;}
          .lhbs-app .lhbs-admin-header > *,
          .lhbs-app .lhbs-admin-password-panel > *,
          .lhbs-app .lhbs-admin-list-row > * {width:100%;}
          .lhbs-app .lhbs-admin-form-grid,
          .lhbs-app .lhbs-admin-halls-grid {grid-template-columns:1fr !important;}
          .lhbs-app .lhbs-admin-list-row {flex-direction:column;}
          .lhbs-app .lhbs-admin-list-row button,
          .lhbs-app .lhbs-admin-password-panel button,
          .lhbs-app .lhbs-admin-header button {width:100%;}
        }
      `}</style>

      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:200,background:t.navBg,backdropFilter:"blur(14px)",borderBottom:`1px solid ${t.border}`,height:60,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1.5rem"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:19,color:t.text,cursor:"pointer"}} onClick={navigateHome}>
          LHBS <span style={{color:"#3b82f6"}}>·</span> UDS
          <span style={{fontSize:11,color:t.textSub,fontFamily:"'DM Sans',sans-serif",fontWeight:400,marginLeft:8}}>Nyankpala</span>
        </div>
        <div className="lhbs-nav-actions" style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={toggle} style={{width:38,height:38,borderRadius:10,border:`1px solid ${t.border}`,background:t.surface2,color:t.textSub,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {dark?"☀️":"🌙"}
          </button>
        </div>
      </nav>

      {page==="admin"?(
        <AdminPage
          recurringBookings={recurringBookings}
          dailyBookings={dailyBookings}
          onAddRecurring={saveRecurringBooking}
          onRemoveRecurring={deleteRecurringBooking}
          onRemoveDaily={deleteDailyBooking}
          bookingPassword={bookingPassword}
          onGenerateBookingPassword={saveBookingPassword}
          user={user}
          onLogout={handleLogout}
          t={t}
        />
      ):(
        <div style={{maxWidth:1200,margin:"0 auto",padding:"2rem 1rem"}}>
          {/* Hero */}
          <div className="lhbs-hero" style={{textAlign:"center",marginBottom:"2.5rem",padding:"1rem 0"}}>
            <div style={{display:"inline-block",padding:"5px 16px",borderRadius:20,background:t.blueBg,border:`1px solid ${t.blueBorder}`,color:"#60a5fa",fontSize:12,fontWeight:600,marginBottom:14,letterSpacing:"0.05em"}}>
              🎓 UNIVERSITY FOR DEVELOPMENT STUDIES · NYANKPALA CAMPUS
            </div>
            <h1 style={{fontSize:"clamp(1.8rem,4vw,2.8rem)",fontWeight:800,fontFamily:"'Playfair Display',serif",lineHeight:1.2,marginBottom:10,color:t.text}}>
              Lecture Hall Booking System
            </h1>
            <p style={{color:t.textSub,fontSize:15,lineHeight:1.7,maxWidth:520,margin:"0 auto 1.5rem"}}>
              Real-time availability across all 46 lecture halls. Admins can sign in and manage bookings securely.
            </p>
            <div className="lhbs-stats" style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap"}}>
              {stats.map(s=>(
                <button key={s.label} onClick={()=>setStatusFilter(s.filter)}
                  style={{padding:"12px 20px",borderRadius:14,background:s.bg,display:"flex",alignItems:"center",gap:10,border:statusFilter===s.filter?`2px solid ${s.color}`:"2px solid transparent",cursor:"pointer",transition:"all 0.2s"}}>
                  <span style={{fontSize:18}}>{s.icon}</span>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:22,fontWeight:800,color:s.color,lineHeight:1}}>{s.count}</div>
                    <div style={{fontSize:12,color:t.textSub}}>{s.label}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{maxWidth:520,margin:"1.25rem auto 0",position:"relative"}}>
              <input
                type="search"
                value={hallSearch}
                onChange={e=>setHallSearch(e.target.value)}
                placeholder="Search hall by name, location, or code"
                aria-label="Search halls"
                style={{width:"100%",padding:"13px 44px 13px 16px",borderRadius:12,background:t.inputBg,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:14,boxSizing:"border-box",outline:"none",boxShadow:"0 10px 30px rgba(0,0,0,0.08)"}}
              />
              {hallSearch&&(
                <button
                  onClick={()=>setHallSearch("")}
                  aria-label="Clear hall search"
                  style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",width:30,height:30,borderRadius:8,border:"none",background:t.surface2,color:t.textSub,fontSize:16,cursor:"pointer"}}>
                  ×
                </button>
              )}
            </div>
          </div>

          {statusFilter==="all" ? (
            <>
              {/* Available Halls */}
              <div style={{marginBottom:"2.5rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:"#22c55e",animation:"pulseGreen 2s infinite"}}/>
                  <h2 style={{fontSize:18,fontWeight:800,color:t.text}}>Available Halls</h2>
                  <span style={{padding:"2px 10px",borderRadius:20,background:t.greenBg,color:t.green,fontSize:12,fontWeight:700}}>{available.length}</span>
                </div>
                {available.length===0&&(
                  <div style={{textAlign:"center",padding:"2rem",color:t.textSub,fontSize:14,background:t.surface,borderRadius:14,border:`1px solid ${t.border}`}}>All halls are currently in use.</div>
                )}
                <div className="lhbs-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"10px"}}>
                  {available.map(h=>(
                    <HallCard key={h.id} hall={h} recurringBookings={recurringBookings} dailyBookings={dailyBookings}
                      onDetail={setDetailHall} onBook={handleBookRequest} t={t} tick={tick}/>
                  ))}
                </div>
              </div>

              {/* Booked Halls */}
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:"#ef4444"}}/>
                  <h2 style={{fontSize:18,fontWeight:800,color:t.text}}>Booked / Occupied Halls</h2>
                  <span style={{padding:"2px 10px",borderRadius:20,background:t.redBg,color:t.red,fontSize:12,fontWeight:700}}>{occupied.length}</span>
                </div>
                {occupied.length===0&&(
                  <div style={{textAlign:"center",padding:"2rem",color:t.textSub,fontSize:14,background:t.surface,borderRadius:14,border:`1px solid ${t.border}`}}>No halls currently occupied.</div>
                )}
                <div className="lhbs-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"10px"}}>
                  {occupied.map(h=>(
                    <HallCard key={h.id} hall={h} recurringBookings={recurringBookings} dailyBookings={dailyBookings}
                      onDetail={setDetailHall} onBook={handleBookRequest} t={t} tick={tick}/>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{marginBottom:"2.5rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:statusFilter==="available"?"#22c55e":"#ef4444"}}/>
                <h2 style={{fontSize:18,fontWeight:800,color:t.text}}>{statusFilter==="available"?"Available Halls":"Occupied Halls"}</h2>
                <span style={{padding:"2px 10px",borderRadius:20,background:statusFilter==="available"?t.greenBg:t.redBg,color:statusFilter==="available"?t.green:t.red,fontSize:12,fontWeight:700}}>{filteredHalls.length}</span>
              </div>
              {filteredHalls.length===0&&(
                <div style={{textAlign:"center",padding:"2rem",color:t.textSub,fontSize:14,background:t.surface,borderRadius:14,border:`1px solid ${t.border}`}}>
                  {statusFilter==="available"?"All halls are currently in use.":"No halls are currently occupied."}
                </div>
              )}
              <div className="lhbs-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"10px"}}>
                {filteredHalls.map(h=>(
                  <HallCard key={h.id} hall={h} recurringBookings={recurringBookings} dailyBookings={dailyBookings}
                    onDetail={setDetailHall} onBook={handleBookRequest} t={t} tick={tick}/>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {detailHall&&(
        <HallDetail hall={detailHall} recurringBookings={recurringBookings} dailyBookings={dailyBookings}
          onClose={()=>setDetailHall(null)} onBook={h=>{setDetailHall(null);handleBookRequest(h);}} t={t}
          starredBookings={starredBookings} onToggleStar={toggleStar} />
      )}
      {bookHall&&(
        <BookModal hall={bookHall} recurringBookings={recurringBookings} dailyBookings={dailyBookings}
          bookingPassword={bookingPassword?.value || ""} onConfirm={handleConfirmBooking} onClose={()=>setBookHall(null)} t={t}/>
      )}
      {toast&&<Toast msg={toast.msg} type={toast.type} t={t}/>}

      <footer style={{borderTop:`1px solid ${t.border}`,marginTop:"4rem",padding:"1.5rem",textAlign:"center",color:t.textHint,fontSize:13}}>
        Lecture Hall Booking System · University for Development Studies, Nyankpala · 2026 · Dong Ernest (CSC/0040/22)
      </footer>
    </div>
  );
}
