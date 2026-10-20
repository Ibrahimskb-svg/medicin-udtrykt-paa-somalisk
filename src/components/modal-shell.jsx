"use client";
import { useEffect, useId, useLayoutEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), audio[controls], [tabindex]:not([tabindex="-1"])';

export const LANG_THEME = {
  so: { primary:"#0B7A70", soft:"#F0FDFA", border:"#99f6e4", tagBg:"linear-gradient(135deg,#f0fdfa,#e0f2fe)" },
  da: { primary:"#2563EB", soft:"#EFF6FF", border:"#bfdbfe", tagBg:"linear-gradient(135deg,#eff6ff,#dbeafe)" },
  en: { primary:"#92400E", soft:"#FEF3C7", border:"#92400E", tagBg:"linear-gradient(135deg,#d4a373,#c8843a)" },
  ar: { primary:"#C2410C", soft:"#FFF7ED", border:"#F97316", tagBg:"linear-gradient(135deg,#fed7aa,#fb923c)" },
};

export function ModalShell({title,iconEl,onClose,children,isRtl,wide,closeLabel}){
  const titleId = useId();
  const dialogRef = useRef(null);
  // Hver kalder sender onClose som en ny inline-pil ved hvert render (fx
  // onClose={() => changeModalTab(null)}) — det er helt normalt og fint for
  // en almindelig prop, men fokus-fælde-effekten nedenfor må IKKE køre igen
  // bare fordi onClose skiftede reference. Den skal kun sætte/gendanne fokus
  // ved selve åbning/lukning af modalen, ikke ved ethvert re-render af
  // sidebagved (fx fordi en anden del af siden opdaterer sin egen state,
  // mens modalen er åben) — ellers hopper fokus tilbage til modalens første
  // felt hver gang noget andet på siden re-renderer, hvilket ødelægger
  // tastatur-/skærmlæser-navigation midt i brugen af modalen. onCloseRef
  // holder altid den nyeste onClose uden selv at udløse effekten igen.
  const onCloseRef = useRef(onClose);
  useLayoutEffect(()=>{
    onCloseRef.current = onClose;
  });
  useEffect(()=>{
    // Fokus-fælde: tastatur-/skærmlæserbrugere må ikke kunne Tab'e ud af en
    // åben modal og ind i siden bagved den — og fokus skal gå tilbage til
    // den knap der åbnede modalen, når den lukkes igen, ellers mister man
    // sin plads i siden.
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    const focusables = dialog ? Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)) : [];
    (focusables[0] || dialog)?.focus();

    const onKey=(e)=>{
      if(e.key==="Escape"){onCloseRef.current();return;}
      if(e.key!=="Tab" || !dialog) return;
      const items = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el)=>el.offsetParent !== null);
      if(items.length===0) return;
      const first = items[0];
      const last = items[items.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    };
    document.addEventListener("keydown",onKey);
    document.body.style.overflow="hidden";
    return()=>{
      document.removeEventListener("keydown",onKey);
      document.body.style.overflow="";
      if(previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  },[]);
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0",background:"rgba(0,0,0,0.52)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}
      className="sm:items-center sm:p-4">
      <div ref={dialogRef} tabIndex={-1} onClick={(e)=>e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby={titleId} style={{background:"#f8fafc",borderRadius:"28px 28px 0 0",width:"100%",maxWidth:wide?"660px":"560px",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.22)",direction:isRtl?"rtl":"ltr",outline:"none"}}
        className="sm:rounded-[28px] sm:shadow-[0_40px_100px_rgba(0,0,0,0.28)]">
        <div style={{background:"var(--heroBg)",borderRadius:"28px 28px 0 0",padding:"18px 20px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}
          className="sm:rounded-t-[28px]">
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            {iconEl}
            <span id={titleId} style={{color:"#fff",fontWeight:800,fontSize:"16px",letterSpacing:"-0.01em"}}>{title}</span>
          </div>
          <button type="button" onClick={onClose} aria-label={closeLabel||"Luk"} className="hover-lift" style={{background:"rgba(255,255,255,0.18)",border:"none",borderRadius:"50%",width:44,height:44,cursor:"pointer",color:"#fff",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,minWidth:44,minHeight:44}}>✕</button>
        </div>
        <div style={{padding:"20px 20px 32px"}}>{children}</div>
      </div>
    </div>
  );
}
