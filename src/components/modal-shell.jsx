"use client";
import { useEffect } from "react";

export const LANG_THEME = {
  so: { primary:"#0D9488", soft:"#F0FDFA", border:"#99f6e4", tagBg:"linear-gradient(135deg,#f0fdfa,#e0f2fe)" },
  da: { primary:"#2563EB", soft:"#EFF6FF", border:"#bfdbfe", tagBg:"linear-gradient(135deg,#eff6ff,#dbeafe)" },
  en: { primary:"#92400E", soft:"#FEF3C7", border:"#92400E", tagBg:"linear-gradient(135deg,#d4a373,#c8843a)" },
  ar: { primary:"#D97706", soft:"#FFF7ED", border:"#F97316", tagBg:"linear-gradient(135deg,#fed7aa,#fb923c)" },
};

export function ModalShell({title,iconEl,onClose,children,isRtl,wide}){
  useEffect(()=>{
    const onKey=(e)=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",onKey);
    document.body.style.overflow="hidden";
    return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow="";};
  },[onClose]);
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0",background:"rgba(0,0,0,0.52)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}
      className="sm:items-center sm:p-4">
      <div onClick={(e)=>e.stopPropagation()} style={{background:"#f8fafc",borderRadius:"28px 28px 0 0",width:"100%",maxWidth:wide?"660px":"560px",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.22)",direction:isRtl?"rtl":"ltr"}}
        className="sm:rounded-[28px] sm:shadow-[0_40px_100px_rgba(0,0,0,0.28)]">
        <div style={{background:"var(--heroBg)",borderRadius:"28px 28px 0 0",padding:"18px 20px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}
          className="sm:rounded-t-[28px]">
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            {iconEl}
            <span style={{color:"#fff",fontWeight:800,fontSize:"16px",letterSpacing:"-0.01em"}}>{title}</span>
          </div>
          <button type="button" onClick={onClose} style={{background:"rgba(255,255,255,0.18)",border:"none",borderRadius:"50%",width:44,height:44,cursor:"pointer",color:"#fff",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,minWidth:44,minHeight:44}}>✕</button>
        </div>
        <div style={{padding:"20px 20px 32px"}}>{children}</div>
      </div>
    </div>
  );
}
