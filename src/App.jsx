import { useState, useEffect, useRef, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const C={bg:"#06101c",panel:"#0b1a2e",elevated:"#0f2244",border:"#1a3a6a",borderHi:"#2a5aaa",cream:"#e8f4ff",muted:"#5a8aaa",dim:"#2e5070",blue:"#4db8ff",blueLt:"#a0d8ff",red:"#ff4d4d",redBg:"#3a0a0a",redBdr:"#881a1a",amber:"#f5a623",amberBg:"#3a1e00",amberBdr:"#8a4a00",green:"#10d99a",greenBg:"#002a1a",greenBdr:"#046a46",orange:"#ff7a30",orangeBg:"#3a1200",orangeBdr:"#882a00",purple:"#a78bfa",purpleBg:"#160d40",purpleBdr:"#4a1d9a"};
const SS={CRITICAL:{bg:"#3a0a0a",bdr:"#ff4d4d",text:"#ffaaaa"},HIGH:{bg:"#3a1200",bdr:"#ff7a30",text:"#ffc09a"},MEDIUM:{bg:"#3a1e00",bdr:"#f5a623",text:"#ffd080"},LOW:{bg:"#002a1a",bdr:"#10d99a",text:"#70f0c0"},INFO:{bg:"#06152e",bdr:"#4db8ff",text:"#a0d8ff"},WARN:{bg:"#3a1e00",bdr:"#f5a623",text:"#ffd080"},ERROR:{bg:"#3a0a0a",bdr:"#ff4d4d",text:"#ffaaaa"}};
const ENVS={healthcare:{label:"Healthcare",clr:"#22d3ee",desc:"HIPAA · Epic EHR · HL7 · FHIR · DICOM"},enterprise:{label:"Enterprise",clr:"#f5a623",desc:"NIST CSF · Windows AD · Firewall · DLP · AV"},government:{label:"Government",clr:"#a78bfa",desc:"FISMA · Classified · IDS/IPS · PKI/CAC · VPN"},fintech:{label:"FinTech",clr:"#22c55e",desc:"PCI-DSS · SWIFT · Trading · Fraud Detection"}};
const NAV=[{id:"dash",l:"Dashboard"},{id:"logs",l:"Log Viewer"},{id:"rules",l:"Alert Rules"},{id:"inc",l:"Incidents"},{id:"intel",l:"Threat Intel"},{id:"cfg",l:"Settings"},{id:"help",l:"Guide"},{id:"scenarios",l:"Scenarios"}];
const NAVIC={dash:"◈",logs:"≡",rules:"⚡",inc:"◉",intel:"◎",cfg:"⚙",help:"?",scenarios:"▶"};

function genLog(envs,n){
  const active=Object.keys(envs).filter(k=>envs[k]);
  if(!active.length)return null;
  const env=active[Math.floor(Math.random()*active.length)];
  const u=["jsmith","adavis","mlee","bwilson","cjohnson","rthomas"][Math.floor(Math.random()*6)];
  const ip=`10.${Math.floor(Math.random()*4)}.${Math.floor(Math.random()*253)+1}.${Math.floor(Math.random()*253)+1}`;
  const ext=`${[45,198,203,91][Math.floor(Math.random()*4)]}.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}`;
  const port=[22,80,443,3389,8080,1433,3306][Math.floor(Math.random()*7)];
  const r=Math.random();
  const lv=r<0.55?"INFO":r<0.75?"WARN":r<0.9?"ERROR":"CRITICAL";
  const bad=lv!=="INFO";
  const tpls={
    healthcare:[
      {src:"Epic EHR",host:"EHR-PROD-01",msg:`User ${u} accessed patient record MRN-${100000+Math.floor(Math.random()*899999)} from ${ip}`},
      {src:"HL7 Gateway",host:"HL7-GW-01",msg:`ADT^A01 admit message received for patient P-${Math.floor(Math.random()*9999)}`},
      {src:"FHIR API",host:"FHIR-SRV-01",msg:`GET /Patient/${Math.floor(Math.random()*9999)} 200 OK from ${ip}`},
      {src:"Windows Auth",host:`CLINICAL-WS-${Math.floor(Math.random()*50)+1}`,msg:`${bad?"FAILED":"Successful"} login for ${u} - event ${bad?"4625":"4624"}`},
      {src:"HIPAA Audit",host:"COMPLIANCE-01",msg:`${bad?"Bulk export of "+(Math.floor(Math.random()*500)+50)+" patient records by "+u+" flagged for review":"Routine access by "+u+" - 1 record"}`},
    ],
    enterprise:[
      {src:"Windows Sec",host:`DESKTOP-${Math.floor(Math.random()*999)}`,msg:`${bad?"Account failed to log on":"Account logged on"} - Account: ${u}@corp.local - Logon Type: ${[2,3,10][Math.floor(Math.random()*3)]}`},
      {src:"Firewall",host:"FW-CORE-01",msg:`${bad?"DENY":"ALLOW"} TCP ${ip}:${Math.floor(Math.random()*60000)+1024} -> ${ext}:${port} - policy:INTERNET_OUT`},
      {src:"DNS Server",host:"DNS-01",msg:`Query: ${bad?["malware-c2.xyz","suspicious-domain.ru"][Math.floor(Math.random()*2)]:"updates.microsoft.com"} from ${ip} - ${bad?"NXDOMAIN":"NOERROR"}`},
      {src:"Endpoint AV",host:`LAPTOP-${Math.floor(Math.random()*999)}`,msg:`${bad?`Malware detected: Trojan.GenericKD.${Math.floor(Math.random()*99999)} in C:\\Users\\${u}\\Downloads\\invoice.exe`:"Scheduled scan: 0 threats found"}`},
      {src:"DLP Gateway",host:"DLP-GW-01",msg:`${bad?`Policy violation: ${u} attempted to exfiltrate ${Math.floor(Math.random()*50)+1}MB via email`:"Email scan pass - no violations"}`},
      {src:"Active Dir",host:"DC-01",msg:`${["User account created","Password reset","Group membership change","Admin privilege granted"][Math.floor(Math.random()*4)]} - ${u}`},
    ],
    government:[
      {src:"FISMA Audit",host:"CLASNET-01",msg:`${bad?"Unauthorized":"Authorized"} access by ${u} to classified system SYS-${["ALPHA","BRAVO","CHARLIE","DELTA"][Math.floor(Math.random()*4)]}-${Math.floor(Math.random()*9)+1}`},
      {src:"IDS/IPS",host:"PERIM-SENSOR-01",msg:`${bad?`Potential intrusion attempt from ${ext} - Snort SID-${Math.floor(Math.random()*9999)+1000} - port ${port}`:`Normal traffic from ${ip} monitored`}`},
      {src:"PKI/CAC",host:"PKI-ROOT-CA",msg:`Certificate ${bad?"revocation":"issuance"}: SN ${Math.random().toString(16).slice(2,10).toUpperCase()} - CN=${u.toUpperCase()},OU=PERSONNEL,O=DOD`},
      {src:"VPN Gateway",host:"VPN-GW-01",msg:`${bad?"Unauthorized":"Authorized"} VPN from ${ext} - ${u} - ${bad?"certificate mismatch":"session established"}`},
      {src:"SIEM Engine",host:"SIEM-CORE",msg:`Correlated ${Math.floor(Math.random()*5)+2} events from ${ip} - potential ${["lateral movement","privilege escalation","exfiltration"][Math.floor(Math.random()*3)]} pattern`},
    ],
    fintech:[
      {src:"PCI Monitor", host:"PCI-GW-01",    msg:`${bad?"Suspicious card activity":"Routine transaction"}: ${u} - ${(Math.random()*9000+100).toFixed(2)} - card ending ${Math.floor(Math.random()*9000)+1000} - ${bad?"merchant flagged for review":"approved"}`},
      {src:"SWIFT GW",    host:"SWIFT-GW-01",  msg:`${bad?"Anomalous":"Authorized"} MT103 transfer: ${(Math.random()*900000+10000).toFixed(0)} - ${u} - ${bad?"unusual routing detected - possible BEC":"standard correspondent processing"}`},
      {src:"Fraud Engine",host:"FRAUD-SRV-01", msg:`${bad?`ALERT: Card skimming pattern - ${Math.floor(Math.random()*12)+3} rapid transactions across ${Math.floor(Math.random()*5)+2} merchants`:"Transaction velocity normal"} - card ending ${Math.floor(Math.random()*9000)+1000}`},
      {src:"Trading Sys", host:"TRADE-SRV-01", msg:`${bad?"Suspicious order pattern":"Normal activity"}: ${u} - ${bad?`${Math.floor(Math.random()*500)+100} orders/sec - possible spoofing`:`${Math.floor(Math.random()*50)+5} standard orders processed`}`},
      {src:"KYC/AML",     host:"KYC-SRV-01",   msg:`${bad?"AML flag - structuring pattern":"Verification pass"}: ${u} - ${bad?`${Math.floor(Math.random()*8)+3} sub-threshold deposits over ${Math.floor(Math.random()*5)+2} days`:"risk score within acceptable range"}`},
      {src:"HSM Gateway", host:"HSM-GW-01",    msg:`${bad?"CVV mismatch detected":"PIN verified"}: card ending ${Math.floor(Math.random()*9000)+1000} - ${bad?`${Math.floor(Math.random()*5)+2} failed attempts - POS terminal ${Math.floor(Math.random()*999)+100}`:`terminal ${Math.floor(Math.random()*999)+100} - ${u}`}`},
    ],
  };
  const tp=tpls[env][Math.floor(Math.random()*tpls[env].length)];
  return{id:`LOG-${String(n).padStart(6,"0")}`,timestamp:new Date().toISOString(),level:lv,env,source:tp.src,host:tp.host,message:tp.msg};
}

const INIT_RULES=[
  {id:"R01",name:"Brute Force Login",pattern:"FAILED login|Account failed to log on",sev:"HIGH",mitre:"T1110",hits:0,on:true},
  {id:"R02",name:"PHI Bulk Export",pattern:"Bulk export.*patient records",sev:"CRITICAL",mitre:"T1530",hits:0,on:true},
  {id:"R03",name:"Malware Detected",pattern:"Malware detected",sev:"CRITICAL",mitre:"T1204",hits:0,on:true},
  {id:"R04",name:"Malicious DNS Query",pattern:"malware-c2\\.xyz|suspicious-domain",sev:"HIGH",mitre:"T1071.004",hits:0,on:true},
  {id:"R05",name:"Classified System Access",pattern:"Unauthorized.*access.*classified|Unauthorized.*VPN",sev:"HIGH",mitre:"T1078",hits:0,on:true},
  {id:"R06",name:"Firewall DENY Spike",pattern:"DENY TCP",sev:"MEDIUM",mitre:"T1046",hits:0,on:true},
  {id:"R07",name:"VPN Cert Mismatch",pattern:"certificate mismatch",sev:"HIGH",mitre:"T1133",hits:0,on:true},
  {id:"R08",name:"IDS Intrusion Alert",pattern:"Potential intrusion attempt",sev:"CRITICAL",mitre:"T1595",hits:0,on:true},
  {id:"R09",name:"DLP Exfil Attempt",pattern:"attempted to exfiltrate",sev:"HIGH",mitre:"T1048",hits:0,on:true},
  {id:"R10",name:"Privilege Escalation",pattern:"Admin privilege granted|privilege escalation",sev:"MEDIUM",mitre:"T1098",hits:0,on:true},
  {id:"R11",name:"Card Skimming Pattern",pattern:"Card skimming pattern|CVV mismatch|rapid transactions",sev:"CRITICAL",mitre:"T1056.002",hits:0,on:true},
  {id:"R12",name:"SWIFT Transfer Anomaly",pattern:"Anomalous.*MT103|unusual routing|AML flag",sev:"CRITICAL",mitre:"T1657",hits:0,on:true},
];
const INTEL=[
  {id:"I1",type:"IP",value:"45.33.32.156",conf:90,sev:"CRITICAL",tags:["C2","Mirai","botnet"],src:"AlienVault OTX",seen:"2026-05-08"},
  {id:"I2",type:"DOMAIN",value:"malware-c2.xyz",conf:95,sev:"CRITICAL",tags:["C2","TA505"],src:"Emerging Threats",seen:"2026-05-09"},
  {id:"I3",type:"DOMAIN",value:"suspicious-domain.ru",conf:85,sev:"HIGH",tags:["APT","CozyBear"],src:"CISA AIS",seen:"2026-05-07"},
  {id:"I4",type:"IP",value:"198.51.100.47",conf:75,sev:"HIGH",tags:["Scanner","Shodan"],src:"GreyNoise",seen:"2026-05-06"},
  {id:"I5",type:"HASH",value:"a3f2c1d4e5b678901234...",conf:99,sev:"CRITICAL",tags:["Ransomware","LockBit"],src:"VirusTotal",seen:"2026-05-09"},
  {id:"I6",type:"IP",value:"203.0.113.88",conf:70,sev:"MEDIUM",tags:["TOR exit","anonymizer"],src:"Spamhaus",seen:"2026-05-05"},
  {id:"I7",type:"IP",value:"91.108.4.236",conf:88,sev:"HIGH",tags:["Magecart","card skimming","FinTech fraud"],src:"FS-ISAC",seen:"2026-05-08"},
  {id:"I8",type:"DOMAIN",value:"swift-verify-secure.net",conf:93,sev:"CRITICAL",tags:["SWIFT fraud","BEC","wire fraud"],src:"FS-ISAC",seen:"2026-05-09"},
];

const SCENARIOS=[
  {
    id:"ransomware",name:"Ransomware Kill Chain",env:"enterprise",duration:"~65 sec",
    desc:"Full ransomware intrusion via phishing email — delivery, macro execution, credential theft, lateral movement, file encryption, and exfiltration.",
    mitre:["T1566","T1059","T1003","T1486","T1490","T1048"],
    steps:[
      {delay:0,     level:"WARN",    env:"enterprise",source:"Email Gateway", host:"MAIL-GW-01",    msg:"Suspicious attachment blocked: jsmith@corp.local - Q2-Invoice.xlsm - macro-enabled document flagged by sandbox"},
      {delay:5000,  level:"WARN",    env:"enterprise",source:"Endpoint AV",   host:"LAPTOP-042",    msg:"User jsmith opened quarantined attachment Q2-Invoice.xlsm - macro execution attempted - user bypassed warning"},
      {delay:12000, level:"ERROR",   env:"enterprise",source:"Endpoint AV",   host:"LAPTOP-042",    msg:"Malware detected: Trojan.Downloader.Agent in C:\\Users\\jsmith\\AppData\\Temp\\svchost32.exe - quarantine failed"},
      {delay:21000, level:"ERROR",   env:"enterprise",source:"Windows Sec",   host:"DC-01",         msg:"Account failed to log on - Account: administrator@corp.local - Logon Type: 3 - source: 10.1.0.42 - event 4625"},
      {delay:31000, level:"WARN",    env:"enterprise",source:"Firewall",      host:"FW-CORE-01",    msg:"DENY TCP 10.1.0.42:4444 -> 45.33.32.156:443 - policy:INTERNET_OUT - C2 callback attempt blocked"},
      {delay:43000, level:"CRITICAL",env:"enterprise",source:"Endpoint AV",   host:"DESKTOP-042",   msg:"Malware detected: Ransomware.Ryuk-variant - encrypting C:\\Users\\jsmith\\ - 847 files locked - extension .ryuk appended"},
      {delay:53000, level:"CRITICAL",env:"enterprise",source:"Windows Sec",   host:"DESKTOP-042",   msg:"Admin privilege granted - SYSTEM escalated from jsmith - privilege escalation via CVE-2021-34527 PrintNightmare"},
      {delay:63000, level:"CRITICAL",env:"enterprise",source:"DLP Gateway",   host:"DLP-GW-01",     msg:"Policy violation: jsmith attempted to exfiltrate 2.3GB encrypted archive via HTTPS to 45.33.32.156"},
    ],
  },
  {
    id:"insider",name:"Insider Threat",env:"healthcare",duration:"~52 sec",
    desc:"Malicious insider exfiltrates patient PHI — off-hours access escalates to bulk exports, DLP violations, and repeated unauthorized mass data transfers.",
    mitre:["T1078","T1530","T1048","T1110"],
    steps:[
      {delay:0,     level:"WARN",    env:"healthcare",source:"Epic EHR",     host:"EHR-PROD-01",   msg:"User adavis accessed 14 patient records MRN-449800 through MRN-449814 from 10.3.12.45 - off-hours access 02:14 AM"},
      {delay:8000,  level:"WARN",    env:"healthcare",source:"HIPAA Audit",  host:"COMPLIANCE-01", msg:"Unusual access pattern: adavis - 69 distinct patient records in 4 minutes - velocity threshold exceeded"},
      {delay:18000, level:"CRITICAL",env:"healthcare",source:"HIPAA Audit",  host:"COMPLIANCE-01", msg:"Bulk export of 312 patient records by adavis flagged for review - exported to C:\\Users\\adavis\\Desktop\\records.xlsx"},
      {delay:28000, level:"ERROR",   env:"healthcare",source:"DLP Gateway",  host:"DLP-GW-01",     msg:"Policy violation: adavis attempted to exfiltrate 847MB patient data via email to personal-adavis@gmail.com"},
      {delay:38000, level:"ERROR",   env:"healthcare",source:"Windows Auth", host:"CLINICAL-WS-07",msg:"FAILED login for adavis - event 4625 - 7 consecutive failures from 10.3.12.45 - account lockout triggered"},
      {delay:50000, level:"CRITICAL",env:"healthcare",source:"HIPAA Audit",  host:"COMPLIANCE-01", msg:"Bulk export of 1247 patient records by adavis flagged for review - second mass export in 2 hours - escalating to compliance"},
    ],
  },
  {
    id:"apt",name:"APT Financial Heist",env:"government",duration:"~75 sec",
    desc:"Nation-state APT compromises classified infrastructure and pivots to financial systems — VPN breach, lateral movement, SWIFT fraud, card skimming, and AML evasion in one coordinated campaign.",
    mitre:["T1133","T1595","T1078","T1021","T1657","T1056.002","T1048"],
    steps:[
      {delay:0,     level:"ERROR",   env:"government",source:"VPN Gateway",  host:"VPN-GW-01",      msg:"Unauthorized VPN from 91.108.4.236 - rthomas - certificate mismatch - 3 failed attempts in 90 seconds"},
      {delay:10000, level:"CRITICAL",env:"government",source:"IDS/IPS",      host:"PERIM-SENSOR-01",msg:"Potential intrusion attempt from 91.108.4.236 - Snort SID-2405637 - port 443 sweep - Cozy Bear TTPs observed"},
      {delay:22000, level:"CRITICAL",env:"government",source:"FISMA Audit",  host:"CLASNET-01",     msg:"Unauthorized access by rthomas to classified system SYS-DELTA-3 - anomalous time - clearance level: SECRET"},
      {delay:33000, level:"WARN",    env:"government",source:"SIEM Engine",  host:"SIEM-CORE",      msg:"Correlated 7 events from 91.108.4.236 - potential lateral movement pattern - 4 internal hosts contacted"},
      {delay:45000, level:"CRITICAL",env:"fintech",   source:"SWIFT GW",     host:"SWIFT-GW-01",    msg:"Anomalous MT103 transfer: $4750000 - rthomas - unusual routing detected - possible BEC - flagged for review"},
      {delay:55000, level:"CRITICAL",env:"fintech",   source:"Fraud Engine", host:"FRAUD-SRV-01",   msg:"ALERT: Card skimming pattern - 11 rapid transactions across 4 merchants - card ending 7829 - source 91.108.4.236"},
      {delay:65000, level:"CRITICAL",env:"government",source:"DLP Gateway",  host:"DLP-GW-01",      msg:"Policy violation: rthomas attempted to exfiltrate 3.2GB financial records via SFTP to 91.108.4.236"},
      {delay:73000, level:"ERROR",   env:"fintech",   source:"KYC/AML",      host:"KYC-SRV-01",     msg:"AML flag - structuring pattern: rthomas - 7 sub-threshold deposits over 3 days - regulatory reporting required"},
    ],
  },
];
const AI_URL=typeof window!=="undefined"&&!window.location.hostname.includes("claude.ai")?"/.netlify/functions/ai-proxy":"https://api.anthropic.com/v1/messages";
async function callAI(messages,sys){
  const r=await fetch(AI_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-3-5-sonnet-20241022",max_tokens:1000,system:sys||"You are a senior SOC analyst. Be concise, technical, and actionable.",messages})});
  if(!r.ok)throw new Error(`HTTP ${r.status}`);
  const d=await r.json();
  return d.content?.find(b=>b.type==="text")?.text||"";
}

const ft=ts=>new Date(ts).toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"});
const fd=ts=>new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric"});

function SevBadge({s,sm}){
  const st=SS[s]||SS.INFO;
  return <span style={{fontSize:sm?9:10,fontWeight:700,padding:sm?"1px 5px":"2px 8px",borderRadius:3,background:st.bg,color:st.text,border:`1px solid ${st.bdr}`,letterSpacing:"0.04em",whiteSpace:"nowrap"}}>{s}</span>;
}

export default function App(){
  const [page,setPage]=useState("dash");
  const [logs,setLogs]=useState([]);
  const [alerts,setAlerts]=useState([]);
  const [incidents,setIncidents]=useState([]);
  const [rules,setRules]=useState(INIT_RULES);
  const [envs,setEnvs]=useState({healthcare:true,enterprise:true,government:false});
  const [running,setRunning]=useState(true);
  const [speed,setSpeed]=useState(1500);
  const [logF,setLogF]=useState({level:"ALL",search:"",env:"ALL"});
  const [selId,setSelId]=useState(null);
  const [aiLoad,setAiLoad]=useState({});
  const [aiRes,setAiRes]=useState({});
  const [altF,setAltF]=useState("ALL");
  const [sideOpen,setSideOpen]=useState(true);
  const [tl,setTl]=useState(()=>Array.from({length:12},(_,i)=>({t:`-${(11-i)*5}m`,ev:0,al:0})));
  const logN=useRef(1),altN=useRef(1),incN=useRef(1),rulesRef=useRef(rules),timerRef=useRef(null);
  useEffect(()=>{rulesRef.current=rules;},[rules]);

  const push=useCallback(()=>{
    const log=genLog(envs,logN.current++);
    if(!log)return;
    setLogs(p=>[log,...p].slice(0,500));
    setTl(p=>{const n=[...p];n[11]={...n[11],ev:n[11].ev+1};return n;});
    const matched=rulesRef.current.filter(r=>r.on&&new RegExp(r.pattern,"i").test(log.message));
    if(!matched.length)return;
    setRules(p=>p.map(r=>matched.find(m=>m.id===r.id)?{...r,hits:r.hits+1}:r));
    const newAlts=matched.map(r=>({id:`ALT-${String(altN.current++).padStart(4,"0")}`,timestamp:log.timestamp,ruleName:r.name,ruleId:r.id,sev:r.sev,mitre:r.mitre,src:log.source,host:log.host,env:log.env,msg:log.message,status:"OPEN"}));
    setAlerts(p=>[...newAlts,...p].slice(0,300));
    setTl(p=>{const n=[...p];n[11]={...n[11],al:n[11].al+matched.length};return n;});
    newAlts.filter(a=>a.sev==="CRITICAL"||a.sev==="HIGH").forEach(alt=>{
      setIncidents(p=>{
        const ex=p.find(i=>i.status==="OPEN"&&i.env===alt.env&&i.alts.length<6);
        if(ex)return p.map(i=>i.id===ex.id?{...i,alts:[...i.alts,alt],updated:alt.timestamp}:i);
        return[{id:`INC-${String(incN.current++).padStart(4,"0")}`,title:`${alt.sev} Cluster - ${ENVS[alt.env]?.label||alt.env}`,sev:alt.sev,status:"OPEN",env:alt.env,alts:[alt],created:alt.timestamp,updated:alt.timestamp,analysis:null},...p].slice(0,50);
      });
    });
  },[envs]);

  useEffect(()=>{
    clearInterval(timerRef.current);
    if(running)timerRef.current=setInterval(push,speed);
    return()=>clearInterval(timerRef.current);
  },[running,speed,push]);
  useEffect(()=>{const t=setInterval(()=>setTl(p=>[...p.slice(1),{t:"now",ev:0,al:0}]),30000);return()=>clearInterval(t);},[]);

  const crit=alerts.filter(a=>a.sev==="CRITICAL"&&a.status==="OPEN").length;
  const M={total:logs.length,openAlts:alerts.filter(a=>a.status==="OPEN").length,openInc:incidents.filter(i=>i.status==="OPEN").length,crit,bySev:["CRITICAL","HIGH","MEDIUM","LOW"].map(s=>({name:s,v:alerts.filter(a=>a.sev===s).length}))};

  const analyzeInc=async(inc)=>{
    setAiLoad(p=>({...p,[inc.id]:true}));
    try{const sum=inc.alts.map(a=>`[${a.sev}] ${a.ruleName}: ${a.msg}`).join("\n");const txt=await callAI([{role:"user",content:`Analyze this security incident:\nEnvironment: ${inc.env}\nAlerts:\n${sum}\n\nProvide:\n1. Threat assessment (2-3 sentences)\n2. Likely attack stage/pattern\n3. Three immediate recommended actions\n4. Overall risk: CRITICAL/HIGH/MEDIUM/LOW`}],"You are a senior SOC analyst. Be concise, technical, actionable. No preamble.");setIncidents(p=>p.map(i=>i.id===inc.id?{...i,analysis:txt}:i));}
    catch(e){setIncidents(p=>p.map(i=>i.id===inc.id?{...i,analysis:`Error: ${e.message}`}:i));}
    setAiLoad(p=>({...p,[inc.id]:false}));
  };
  const enrichIOC=async(ioc)=>{
    setAiRes(p=>({...p,[ioc.id]:"..."}));
    try{const txt=await callAI([{role:"user",content:`Threat intel for IOC:\nType: ${ioc.type}\nValue: ${ioc.value}\nTags: ${ioc.tags.join(", ")}\nSource: ${ioc.src}\n\nProvide: threat actor, common TTPs, two defensive actions. 3-4 sentences max.`}],"You are a CTI analyst. Be factual and concise.");setAiRes(p=>({...p,[ioc.id]:txt}));}
    catch(e){setAiRes(p=>({...p,[ioc.id]:`Error: ${e.message}`}));}
  };

  const filtLogs=logs.filter(l=>{if(logF.level!=="ALL"&&l.level!==logF.level)return false;if(logF.env!=="ALL"&&l.env!==logF.env)return false;if(logF.search&&!l.message.toLowerCase().includes(logF.search.toLowerCase())&&!l.source.toLowerCase().includes(logF.search.toLowerCase()))return false;return true;});
  const filtAlts=alerts.filter(a=>altF==="ALL"||a.sev===altF);
  const curInc=selId?incidents.find(i=>i.id===selId)||incidents[0]:incidents[0];

  return(
    <div style={{display:"flex",height:"100vh",background:C.bg,color:C.cream,fontFamily:"'JetBrains Mono',ui-monospace,monospace",fontSize:12,overflow:"hidden"}}>
      <div style={{width:sideOpen?192:46,flexShrink:0,background:C.panel,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",transition:"width 0.18s",overflow:"hidden"}}>
        <div style={{padding:"13px 11px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:25,height:25,background:"linear-gradient(135deg,#1a5aaa,#4db8ff)",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0,boxShadow:"0 0 8px #4db8ff66"}}>S</div>
          {sideOpen&&<div><div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:12,letterSpacing:"0.07em"}}>SENTINEL</div><div style={{fontSize:8,color:C.muted,letterSpacing:"0.14em"}}>SIEM PLATFORM</div></div>}
        </div>
        <nav style={{flex:1,padding:"5px 0",overflowY:"auto"}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setPage(n.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 11px",background:page===n.id?C.elevated:"transparent",border:"none",borderLeft:`2px solid ${page===n.id?C.blue:"transparent"}`,color:page===n.id?C.cream:C.muted,cursor:"pointer",textAlign:"left",fontSize:11,fontWeight:page===n.id?600:400,transition:"all 0.12s",whiteSpace:"nowrap"}}>
              <span style={{fontSize:13,width:20,textAlign:"center",flexShrink:0}}>{NAVIC[n.id]}</span>
              {sideOpen&&<span>{n.l}</span>}
            </button>
          ))}
        </nav>
        {sideOpen&&<div style={{padding:"9px 11px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:running?C.green:"#444",boxShadow:running?`0 0 4px ${C.green}`:"none"}}/>
            <span style={{fontSize:8,color:C.muted,letterSpacing:"0.1em"}}>{running?"LIVE":"PAUSED"}</span>
          </div>
          <div style={{fontSize:8,color:C.dim}}>{Object.entries(envs).filter(([,v])=>v).map(([k])=>ENVS[k].label).join(" · ")||"No env active"}</div>
        </div>}
        <button onClick={()=>setSideOpen(p=>!p)} style={{padding:"8px",background:"transparent",border:"none",borderTop:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",fontSize:10,flexShrink:0}}>{sideOpen?"◄":"►"}</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"8px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.panel,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:700,letterSpacing:"0.04em"}}>{NAV.find(n=>n.id===page)?.l}</span>
            {crit>0&&<span style={{fontSize:8,padding:"2px 7px",background:C.redBg,color:"#fca5a5",border:`1px solid ${C.red}`,borderRadius:3,fontWeight:700,letterSpacing:"0.06em",animation:"pulse 1.5s infinite"}}>! {crit} CRITICAL</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:9,color:C.dim}}>{new Date().toLocaleTimeString()}</span>
            <button title="Export incidents as JSON" onClick={()=>{const b=new Blob([JSON.stringify(incidents,null,2)],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`sentinel-incidents-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(u);}} style={{padding:"3px 9px",background:"transparent",border:`1px solid ${C.blue}55`,color:C.blue,borderRadius:3,cursor:"pointer",fontSize:9,fontWeight:600}}>↓ INC</button>
            <button title="Export logs as CSV" onClick={()=>{const hdr="Timestamp,Level,Env,Host,Source,Message";const rows=logs.map(l=>[l.timestamp,l.level,l.env,l.host,l.source,`"${l.message.replace(/"/g,'""')}"`].join(","));const b=new Blob([[hdr,...rows].join("\n")],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`sentinel-logs-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(u);}} style={{padding:"3px 9px",background:"transparent",border:`1px solid ${C.blue}55`,color:C.blue,borderRadius:3,cursor:"pointer",fontSize:9,fontWeight:600}}>↓ LOGS</button>
            <button onClick={()=>setRunning(p=>!p)} style={{padding:"3px 10px",background:"transparent",border:`1px solid ${running?C.green:C.red}`,color:running?C.green:C.red,borderRadius:3,cursor:"pointer",fontSize:9,fontWeight:600}}>{running?"Pause":"Resume"}</button>
          </div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:14}}>
          {page==="dash"&&<DashView M={M} tl={tl} alerts={alerts} C={C}/>}
          {page==="logs"&&<LogsView logs={filtLogs} f={logF} setF={setLogF} C={C}/>}
          {page==="rules"&&<RulesView rules={rules} setRules={setRules} alerts={filtAlts} altF={altF} setAltF={setAltF} C={C}/>}
          {page==="inc"&&<IncsView incidents={incidents} setIncidents={setIncidents} curInc={curInc} setSelId={setSelId} analyze={analyzeInc} aiLoad={aiLoad} C={C}/>}
          {page==="intel"&&<IntelView intel={INTEL} enrichIOC={enrichIOC} aiRes={aiRes} C={C}/>}
          {page==="cfg"&&<CfgView envs={envs} setEnvs={setEnvs} speed={speed} setSpeed={setSpeed} running={running} setRunning={setRunning} C={C}/>}
          {page==="help"&&<HelpView C={C}/>}
          {page==="scenarios"&&<ScenarioView setLogs={setLogs} setAlerts={setAlerts} setIncidents={setIncidents} setRules={setRules} setTl={setTl} logN={logN} altN={altN} incN={incN} rulesRef={rulesRef} C={C}/>}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}button:focus{outline:none}`}</style>
    </div>
  );
}

function DashView({M,tl,alerts,C}){
  const PC=["#ff4d4d","#ff7a30","#f5a623","#10d99a"];
  const stat=(lbl,val,col)=>(
    <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:5,padding:"12px 14px",flex:1,minWidth:100}}>
      <div style={{fontSize:8,color:C.muted,letterSpacing:"0.12em",marginBottom:5}}>{lbl}</div>
      <div style={{fontSize:24,fontWeight:700,color:col||C.cream,fontFamily:"Georgia,serif"}}>{val}</div>
    </div>
  );
  return(
    <div>
      <div style={{display:"flex",gap:9,marginBottom:14,flexWrap:"wrap"}}>
        {stat("TOTAL EVENTS",M.total,C.blueLt)}
        {stat("OPEN ALERTS",M.openAlts,M.openAlts>0?C.red:C.green)}
        {stat("OPEN INCIDENTS",M.openInc,M.openInc>0?C.amber:C.green)}
        {stat("CRITICAL",M.crit,M.crit>0?"#ffaaaa":C.green)}
      </div>
      <div style={{display:"flex",gap:9,marginBottom:14,flexWrap:"wrap"}}>
        <div style={{flex:2,minWidth:240,background:C.panel,border:`1px solid ${C.border}`,borderRadius:5,padding:12}}>
          <div style={{fontSize:8,color:C.muted,letterSpacing:"0.12em",marginBottom:9}}>EVENT TIMELINE</div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={tl} barGap={1} barCategoryGap="18%">
              <XAxis dataKey="t" tick={{fontSize:7,fill:C.muted}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:7,fill:C.muted}} axisLine={false} tickLine={false} width={20}/>
              <Tooltip contentStyle={{background:C.elevated,border:`1px solid ${C.border}`,borderRadius:3,fontSize:9,color:C.cream}} cursor={{fill:C.elevated+"88"}}/>
              <Bar dataKey="ev" name="Events" fill={C.blue} opacity={0.55} radius={[2,2,0,0]}/>
              <Bar dataKey="al" name="Alerts" fill={C.red} opacity={0.9} radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{flex:1,minWidth:150,background:C.panel,border:`1px solid ${C.border}`,borderRadius:5,padding:12}}>
          <div style={{fontSize:8,color:C.muted,letterSpacing:"0.12em",marginBottom:9}}>ALERTS BY SEVERITY</div>
          <ResponsiveContainer width="100%" height={110}>
            <PieChart>
              <Pie data={M.bySev.filter(d=>d.v>0)} dataKey="v" nameKey="name" cx="50%" cy="50%" outerRadius={44} innerRadius={24}>
                {M.bySev.filter(d=>d.v>0).map((_,i)=><Cell key={i} fill={PC[i]}/>)}
              </Pie>
              <Tooltip contentStyle={{background:C.elevated,border:`1px solid ${C.border}`,borderRadius:3,fontSize:9,color:C.cream}} itemStyle={{color:C.cream}} labelStyle={{color:C.blueLt}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{fontSize:7,color:C.cream,display:"flex",flexWrap:"wrap",gap:"3px 7px",justifyContent:"center",marginTop:3}}>
            {M.bySev.filter(d=>d.v>0).map((d,i)=><span key={i}><span style={{color:PC[i]}}>■</span> {d.name}:{d.v}</span>)}
          </div>
        </div>
      </div>
      <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:5,padding:12}}>
        <div style={{fontSize:8,color:C.muted,letterSpacing:"0.12em",marginBottom:9}}>RECENT ALERTS</div>
        {alerts.slice(0,8).map(a=>{const st=SS[a.sev]||SS.INFO;return(
          <div key={a.id} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 9px",borderRadius:3,marginBottom:3,background:C.elevated,borderLeft:`2px solid ${st.bdr}`}}>
            <SevBadge s={a.sev} sm/><span style={{flex:1,color:C.cream,fontSize:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.ruleName}</span>
            <span style={{color:C.muted,fontSize:9,whiteSpace:"nowrap"}}>{a.host}</span>
            <span style={{color:C.dim,fontSize:9,flexShrink:0}}>{ft(a.timestamp)}</span>
          </div>
        );})}
        {!alerts.length&&<div style={{color:C.dim,textAlign:"center",padding:20,fontSize:11}}>Simulation starting - logs incoming...</div>}
      </div>
    </div>
  );
}

function LogsView({logs,f,setF,C}){
  const lc=l=>({INFO:C.blueLt,WARN:C.amber,ERROR:C.orange,CRITICAL:"#ffaaaa"}[l]||C.cream);
  return(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 98px)"}}>
      <div style={{display:"flex",gap:7,marginBottom:9,flexWrap:"wrap",alignItems:"center"}}>
        <input placeholder="Search logs..." value={f.search} onChange={e=>setF(p=>({...p,search:e.target.value}))} style={{flex:1,minWidth:130,padding:"4px 8px",background:C.elevated,border:`1px solid ${C.border}`,borderRadius:3,color:C.cream,fontSize:10,outline:"none"}}/>
        {["ALL","INFO","WARN","ERROR","CRITICAL"].map(lv=>(
          <button key={lv} onClick={()=>setF(p=>({...p,level:lv}))} style={{padding:"3px 8px",background:f.level===lv?C.elevated:"transparent",border:`1px solid ${f.level===lv?C.borderHi:C.border}`,color:f.level===lv?C.cream:C.muted,borderRadius:3,cursor:"pointer",fontSize:8,fontWeight:f.level===lv?700:400}}>{lv}</button>
        ))}
        {["ALL","healthcare","enterprise","government"].map(e=>(
          <button key={e} onClick={()=>setF(p=>({...p,env:e}))} style={{padding:"3px 7px",background:f.env===e?C.elevated:"transparent",border:`1px solid ${f.env===e?C.borderHi:C.border}`,color:f.env===e?C.cream:C.muted,borderRadius:3,cursor:"pointer",fontSize:8}}>{e==="ALL"?"ALL":e}</button>
        ))}
        <span style={{fontSize:8,color:C.muted,marginLeft:"auto"}}>{logs.length} events</span>
      </div>
      <div style={{flex:1,overflow:"auto",background:C.panel,border:`1px solid ${C.border}`,borderRadius:5}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["TIME","LVL","ENV","HOST","SOURCE","MESSAGE"].map(hd=>(
            <th key={hd} style={{padding:"6px 9px",textAlign:"left",fontSize:7,letterSpacing:"0.12em",color:C.muted,fontWeight:600,background:C.panel,position:"sticky",top:0,whiteSpace:"nowrap",borderBottom:`1px solid ${C.border}`}}>{hd}</th>
          ))}</tr></thead>
          <tbody>
            {logs.slice(0,200).map(l=>(
              <tr key={l.id} style={{borderBottom:`1px solid ${C.border}22`}} onMouseEnter={e=>e.currentTarget.style.background=C.elevated} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"3px 9px",color:C.dim,whiteSpace:"nowrap",fontSize:9}}>{ft(l.timestamp)}</td>
                <td style={{padding:"3px 7px"}}><span style={{fontSize:8,fontWeight:700,color:lc(l.level)}}>{l.level}</span></td>
                <td style={{padding:"3px 7px",fontSize:9,color:ENVS[l.env]?.clr||C.muted}}>{l.env?.[0]?.toUpperCase()||"?"}</td>
                <td style={{padding:"3px 7px",fontSize:9,color:C.blueLt,whiteSpace:"nowrap"}}>{l.host}</td>
                <td style={{padding:"3px 7px",fontSize:9,color:C.muted,whiteSpace:"nowrap"}}>{l.source}</td>
                <td style={{padding:"3px 9px",fontSize:10,color:l.level==="CRITICAL"?"#ffaaaa":l.level==="ERROR"?"#ffc09a":C.cream,maxWidth:320,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!logs.length&&<div style={{textAlign:"center",padding:40,color:C.dim}}>No matching logs</div>}
      </div>
    </div>
  );
}

function RulesView({rules,setRules,alerts,altF,setAltF,C}){
  return(
    <div style={{display:"flex",gap:12,height:"calc(100vh - 98px)"}}>
      <div style={{flex:1,overflow:"auto"}}>
        <div style={{fontSize:8,color:C.muted,letterSpacing:"0.12em",marginBottom:9}}>DETECTION RULES ({rules.length})</div>
        {rules.map(r=>{const st=SS[r.sev]||SS.INFO;return(
          <div key={r.id} style={{background:C.panel,border:`1px solid ${r.on?C.border:"#141c14"}`,borderRadius:4,padding:"9px 11px",marginBottom:6,opacity:r.on?1:0.4,borderLeft:`2px solid ${st.bdr}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
              <SevBadge s={r.sev} sm/><span style={{fontWeight:600,fontSize:10,color:C.cream,flex:1}}>{r.name}</span>
              <span style={{fontSize:7,color:C.blue,padding:"1px 5px",border:`1px solid ${C.blue}44`,borderRadius:3}}>{r.mitre}</span>
              <span style={{fontSize:8,color:C.muted}}>{r.hits}</span>
              <button onClick={()=>setRules(p=>p.map(x=>x.id===r.id?{...x,on:!x.on}:x))} style={{padding:"2px 8px",background:r.on?C.greenBg:"transparent",border:`1px solid ${r.on?C.green:"#444"}`,color:r.on?C.green:"#555",borderRadius:3,cursor:"pointer",fontSize:8,fontWeight:700}}>{r.on?"ON":"OFF"}</button>
            </div>
            <div style={{fontSize:8,color:C.dim,fontFamily:"monospace"}}>/{r.pattern}/i</div>
          </div>
        );})}
      </div>
      <div style={{flex:1,overflow:"auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:9}}>
          <span style={{fontSize:8,color:C.muted,letterSpacing:"0.12em"}}>TRIGGERED ({alerts.length})</span>
          <div style={{display:"flex",gap:4,marginLeft:"auto"}}>
            {["ALL","CRITICAL","HIGH","MEDIUM"].map(sv=>(
              <button key={sv} onClick={()=>setAltF(sv)} style={{padding:"2px 6px",background:altF===sv?C.elevated:"transparent",border:`1px solid ${altF===sv?C.borderHi:C.border}`,color:altF===sv?C.cream:C.muted,borderRadius:3,cursor:"pointer",fontSize:7,fontWeight:altF===sv?700:400}}>{sv}</button>
            ))}
          </div>
        </div>
        {alerts.slice(0,60).map(a=>{const st=SS[a.sev]||SS.INFO;return(
          <div key={a.id} style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:4,padding:"7px 9px",marginBottom:4,borderLeft:`2px solid ${st.bdr}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <SevBadge s={a.sev} sm/><span style={{flex:1,fontSize:10,color:C.cream,fontWeight:500}}>{a.ruleName}</span><span style={{fontSize:8,color:C.dim}}>{ft(a.timestamp)}</span>
            </div>
            <div style={{fontSize:8,color:C.muted}}>{a.host} - {a.src}</div>
            <div style={{fontSize:9,color:C.dim,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:2}}>{a.msg}</div>
          </div>
        );})}
        {!alerts.length&&<div style={{textAlign:"center",padding:30,color:C.dim,fontSize:11}}>No alerts yet</div>}
      </div>
    </div>
  );
}

function IncsView({incidents,setIncidents,curInc,setSelId,analyze,aiLoad,C}){
  return(
    <div style={{display:"flex",gap:12,height:"calc(100vh - 98px)"}}>
      <div style={{width:220,flexShrink:0,overflow:"auto"}}>
        <div style={{fontSize:8,color:C.muted,letterSpacing:"0.12em",marginBottom:9}}>INCIDENTS ({incidents.length})</div>
        {incidents.map(i=>{const st=SS[i.sev]||SS.INFO;return(
          <div key={i.id} onClick={()=>setSelId(i.id)} style={{background:C.panel,border:`1px solid ${curInc?.id===i.id?C.borderHi:C.border}`,borderRadius:4,padding:"8px 10px",marginBottom:5,cursor:"pointer",borderLeft:`2px solid ${st.bdr}`,opacity:i.status==="CLOSED"?0.4:1}}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
              <SevBadge s={i.sev} sm/><span style={{fontSize:8,color:i.status==="CLOSED"?C.green:C.amber,marginLeft:"auto",fontWeight:700}}>{i.status}</span>
            </div>
            <div style={{fontSize:10,color:C.cream,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:2}}>{i.title}</div>
            <div style={{fontSize:8,color:C.muted}}>{i.alts.length} alert{i.alts.length!==1?"s":""} - {ft(i.created)}</div>
          </div>
        );})}
        {!incidents.length&&<div style={{textAlign:"center",padding:30,color:C.dim,fontSize:11}}>No incidents yet</div>}
      </div>
      {curInc?(
        <div style={{flex:1,overflow:"auto",background:C.panel,border:`1px solid ${C.border}`,borderRadius:5,padding:14}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                <SevBadge s={curInc.sev}/>
                <span style={{fontSize:7,color:curInc.status==="CLOSED"?C.green:C.amber,fontWeight:700,border:`1px solid ${curInc.status==="CLOSED"?C.green:C.amber}`,padding:"1px 5px",borderRadius:3}}>{curInc.status}</span>
                <span style={{fontSize:7,color:ENVS[curInc.env]?.clr||C.blue,border:`1px solid ${(ENVS[curInc.env]?.clr||C.blue)+"44"}`,padding:"1px 5px",borderRadius:3}}>{curInc.env}</span>
              </div>
              <div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:700,marginBottom:3}}>{curInc.title}</div>
              <div style={{fontSize:8,color:C.dim}}>{curInc.id} - {fd(curInc.created)} {ft(curInc.created)}</div>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              {curInc.status==="OPEN"&&<button onClick={()=>setIncidents(p=>p.map(i=>i.id===curInc.id?{...i,status:"CLOSED"}:i))} style={{padding:"4px 10px",background:"transparent",border:`1px solid ${C.green}`,color:C.green,borderRadius:3,cursor:"pointer",fontSize:9,fontWeight:600}}>Close</button>}
              <button onClick={()=>analyze(curInc)} disabled={!!aiLoad[curInc.id]} style={{padding:"4px 10px",background:`${C.blue}22`,border:`1px solid ${C.blue}`,color:C.blueLt,borderRadius:3,cursor:aiLoad[curInc.id]?"wait":"pointer",fontSize:9,fontWeight:600,opacity:aiLoad[curInc.id]?0.5:1}}>{aiLoad[curInc.id]?"Analyzing...":"AI Analysis"}</button>
            </div>
          </div>
          {curInc.analysis&&(
            <div style={{background:"#041030",border:`1px solid ${C.blue}44`,borderRadius:4,padding:11,marginBottom:12}}>
              <div style={{fontSize:8,color:C.blue,fontWeight:700,letterSpacing:"0.08em",marginBottom:7}}>CLAUDE AI ANALYSIS</div>
              <div style={{fontSize:11,color:"#bfdbfe",lineHeight:1.75,whiteSpace:"pre-wrap"}}>{curInc.analysis}</div>
            </div>
          )}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:8,color:C.muted,fontWeight:600,marginBottom:5}}>MITRE ATT&CK</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {[...new Set(curInc.alts.map(a=>a.mitre))].map(t=><span key={t} style={{fontSize:8,padding:"2px 7px",background:C.purpleBg,border:`1px solid ${C.purpleBdr}`,color:C.purple,borderRadius:3}}>{t}</span>)}
            </div>
          </div>
          <div style={{fontSize:8,color:C.muted,fontWeight:600,marginBottom:7}}>ALERT TIMELINE ({curInc.alts.length})</div>
          {curInc.alts.map((a,i)=>{const st=SS[a.sev]||SS.INFO;return(
            <div key={i} style={{display:"flex",gap:7,padding:"6px 8px",background:C.elevated,borderRadius:3,marginBottom:3,borderLeft:`2px solid ${st.bdr}`}}>
              <span style={{fontSize:8,color:C.dim,flexShrink:0,width:46}}>{ft(a.timestamp)}</span>
              <SevBadge s={a.sev} sm/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:10,color:C.cream,fontWeight:500}}>{a.ruleName}</div>
                <div style={{fontSize:8,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.msg}</div>
              </div>
            </div>
          );})}
        </div>
      ):<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:C.dim,fontSize:12}}>Select an incident to view details</div>}
    </div>
  );
}

function IntelView({intel,enrichIOC,aiRes,C}){
  const [srch,setSrch]=useState("");
  const filt=intel.filter(i=>!srch||i.value.toLowerCase().includes(srch.toLowerCase())||i.tags.some(t=>t.toLowerCase().includes(srch.toLowerCase())));
  const TC={IP:C.blue,DOMAIN:C.amber,HASH:C.purple};
  return(
    <div>
      <div style={{display:"flex",gap:9,marginBottom:12,alignItems:"center"}}>
        <input placeholder="Search IOCs, tags, threat actors..." value={srch} onChange={e=>setSrch(e.target.value)} style={{flex:1,maxWidth:360,padding:"5px 9px",background:C.elevated,border:`1px solid ${C.border}`,borderRadius:3,color:C.cream,fontSize:10,outline:"none"}}/>
        <span style={{fontSize:8,color:C.muted}}>{filt.length} indicators</span>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        {["CRITICAL","HIGH","MEDIUM"].map(sv=>{const n=intel.filter(i=>i.sev===sv).length;const st=SS[sv];return(
          <div key={sv} style={{background:st.bg,border:`1px solid ${st.bdr}`,borderRadius:4,padding:"7px 12px"}}>
            <div style={{fontSize:18,fontWeight:700,color:st.text,fontFamily:"Georgia,serif"}}>{n}</div>
            <div style={{fontSize:7,color:st.text,opacity:.7,letterSpacing:"0.08em"}}>{sv}</div>
          </div>
        );})}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:9}}>
        {filt.map(ioc=>(
          <div key={ioc.id} style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:5,padding:"11px 13px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <span style={{fontSize:8,fontWeight:700,padding:"1px 6px",background:`${TC[ioc.type]||C.blue}22`,color:TC[ioc.type]||C.blue,border:`1px solid ${(TC[ioc.type]||C.blue)+"55"}`,borderRadius:3}}>{ioc.type}</span>
              <SevBadge s={ioc.sev} sm/><span style={{fontSize:7,color:C.dim,marginLeft:"auto"}}>conf:{ioc.conf}%</span>
            </div>
            <div style={{fontFamily:"monospace",fontSize:10,color:C.cream,marginBottom:5,wordBreak:"break-all"}}>{ioc.value}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>
              {ioc.tags.map(t=><span key={t} style={{fontSize:7,padding:"1px 5px",background:C.elevated,border:`1px solid ${C.border}`,borderRadius:3,color:C.muted}}>{t}</span>)}
            </div>
            <div style={{fontSize:7,color:C.dim,marginBottom:9}}>{ioc.src} - {ioc.seen}</div>
            {aiRes[ioc.id]&&aiRes[ioc.id]!=="..."?(<div style={{background:"#041030",border:`1px solid ${C.blue}33`,borderRadius:3,padding:8}}><div style={{fontSize:9,color:"#bfdbfe",lineHeight:1.65}}>{aiRes[ioc.id]}</div></div>)
            :aiRes[ioc.id]==="..."?(<div style={{fontSize:8,color:C.muted,textAlign:"center",padding:"5px 0",animation:"pulse 1s infinite"}}>Analyzing...</div>)
            :(<button onClick={()=>enrichIOC(ioc)} style={{width:"100%",padding:"4px",background:"transparent",border:`1px solid ${C.blue}55`,color:C.blue,borderRadius:3,cursor:"pointer",fontSize:8,fontWeight:600}}>Enrich with AI</button>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function CfgView({envs,setEnvs,speed,setSpeed,running,setRunning,C}){
  return(
    <div style={{maxWidth:520}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,marginBottom:14}}>Simulation Settings</div>
      <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:5,padding:14,marginBottom:10}}>
        <div style={{fontSize:8,color:C.muted,letterSpacing:"0.12em",marginBottom:11}}>SIMULATION ENVIRONMENTS</div>
        {Object.entries(ENVS).map(([k,v])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",background:C.elevated,borderRadius:4,marginBottom:6,border:`1px solid ${envs[k]?v.clr+"33":C.border}`}}>
            <div style={{width:26,height:26,borderRadius:4,background:`${v.clr}22`,border:`1px solid ${v.clr}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:v.clr,flexShrink:0}}>{k[0].toUpperCase()}</div>
            <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,marginBottom:1}}>{v.label}</div><div style={{fontSize:8,color:C.dim}}>{v.desc}</div></div>
            <button onClick={()=>setEnvs(p=>({...p,[k]:!p[k]}))} style={{padding:"3px 12px",background:envs[k]?`${v.clr}22`:"transparent",border:`1px solid ${envs[k]?v.clr:"#444"}`,color:envs[k]?v.clr:"#555",borderRadius:3,cursor:"pointer",fontSize:8,fontWeight:700}}>{envs[k]?"ACTIVE":"OFF"}</button>
          </div>
        ))}
      </div>
      <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:5,padding:14,marginBottom:10}}>
        <div style={{fontSize:8,color:C.muted,letterSpacing:"0.12em",marginBottom:11}}>LOG GENERATION SPEED</div>
        <div style={{display:"flex",gap:6}}>
          {[{l:"Slow",ms:3000},{l:"Normal",ms:1500},{l:"Fast",ms:600},{l:"Burst",ms:200}].map(sp=>(
            <button key={sp.ms} onClick={()=>setSpeed(sp.ms)} style={{flex:1,padding:"8px 4px",background:speed===sp.ms?C.elevated:"transparent",border:`1px solid ${speed===sp.ms?C.borderHi:C.border}`,color:speed===sp.ms?C.cream:C.muted,borderRadius:3,cursor:"pointer",fontSize:10,fontWeight:speed===sp.ms?600:400,textAlign:"center"}}>
              {sp.l}<br/><span style={{fontSize:7,color:C.dim}}>{Math.round(60000/sp.ms)}/min</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:5,padding:14}}>
        <div style={{fontSize:8,color:C.muted,letterSpacing:"0.12em",marginBottom:11}}>SIMULATION CONTROL</div>
        <button onClick={()=>setRunning(p=>!p)} style={{padding:"8px 20px",background:running?C.redBg:C.greenBg,border:`1px solid ${running?C.red:C.green}`,color:running?C.red:C.green,borderRadius:3,cursor:"pointer",fontSize:10,fontWeight:700}}>{running?"Pause Simulation":"Resume Simulation"}</button>
        <div style={{fontSize:8,color:C.dim,marginTop:11,lineHeight:1.7}}>In production (Netlify): AI calls route through /.netlify/functions/ai-proxy - set ANTHROPIC_API_KEY in env vars. In Claude.ai preview: API is called directly.</div>
      </div>
    </div>
  );
}

function HelpView({C}){
  const [tab,setTab]=useState("overview");
  const GUIDE_TABS=[
    {id:"overview",label:"Overview"},{id:"dashboard",label:"Dashboard"},
    {id:"logs",label:"Log Viewer"},{id:"rules",label:"Alert Rules"},
    {id:"incidents",label:"Incidents"},{id:"intel",label:"Threat Intel"},
    {id:"settings",label:"Settings"},    {id:"deploy",label:"Deployment"},{id:"scenarios",label:"Scenarios"},
  ];
  const pStyle={fontSize:11,color:C.cream,lineHeight:1.8,marginBottom:10,marginTop:0};
  const hdStyle={fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:C.cream,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${C.border}`,marginTop:0};
  const shStyle={fontSize:11,fontWeight:600,color:C.blueLt,marginBottom:6,marginTop:14};
  const liStyle={fontSize:11,color:C.cream,lineHeight:1.8,marginBottom:4};
  const ulStyle={paddingLeft:18,marginBottom:12};
  const kwStyle={fontWeight:600,color:C.blueLt};
  const tipStyle={background:"#041030",border:"1px solid #4db8ff44",borderRadius:4,padding:11,marginTop:10};
  const codeStyle={background:C.elevated,border:`1px solid ${C.border}`,borderRadius:4,padding:10,marginBottom:10,fontFamily:"monospace",fontSize:10,color:"#a0d8ff",lineHeight:1.9,whiteSpace:"pre"};
  const inlineCodeStyle={fontFamily:"monospace",fontSize:9,color:"#a0d8ff",background:C.elevated,padding:"1px 5px",borderRadius:3,display:"inline"};
  const renderRows=(pairs)=>pairs.map(([k,v])=><li key={k} style={liStyle}><span style={kwStyle}>{k}</span> — {v}</li>);
  const renderTip=(label,text)=>(
    <div style={tipStyle}>
      <div style={{fontSize:8,color:C.blue,fontWeight:700,letterSpacing:"0.1em",marginBottom:5}}>{label}</div>
      <div style={{fontSize:10,color:"#bfdbfe",lineHeight:1.75}}>{text}</div>
    </div>
  );
  return(
    <div style={{display:"flex",gap:14}}>
      <div style={{width:148,flexShrink:0}}>
        <div style={{fontSize:8,color:C.muted,letterSpacing:"0.12em",marginBottom:9}}>CONTENTS</div>
        {GUIDE_TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{width:"100%",display:"block",padding:"7px 10px",background:tab===t.id?C.elevated:"transparent",border:`1px solid ${tab===t.id?C.borderHi:C.border}`,borderLeft:`2px solid ${tab===t.id?C.blue:"transparent"}`,borderRadius:3,color:tab===t.id?C.cream:C.muted,cursor:"pointer",textAlign:"left",fontSize:10,fontWeight:tab===t.id?600:400,marginBottom:4}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{flex:1,background:C.panel,border:`1px solid ${C.border}`,borderRadius:5,padding:20,overflowY:"auto",maxHeight:"calc(100vh - 110px)"}}>
        {tab==="overview"&&(
          <div>
            <div style={hdStyle}>SENTINEL — SIEM Platform</div>
            <p style={pStyle}>SENTINEL is a full-featured SIEM simulator built for cybersecurity GRC portfolios and SOC analyst training. It generates a continuous stream of realistic security events, detects threats via rule matching, correlates alerts into incidents, and uses Claude AI for threat analysis and IOC enrichment — all in one analyst workstation.</p>
            <div style={shStyle}>What it simulates</div>
            <p style={pStyle}>Three enterprise environments run simultaneously or independently — Healthcare, Enterprise IT, and Government — each with authentic log sources, compliance frameworks, and threat patterns. All data is fully synthetic and safe for portfolio demos.</p>
            <div style={shStyle}>Core features</div>
            <ul style={ulStyle}>{renderRows([["Dashboard","Live metrics, event timeline chart, severity breakdown, and recent alert feed"],["Log Viewer","Real-time log stream with level, environment, and keyword filtering"],["Alert Rules","10 pre-built MITRE ATT&CK-mapped detection rules, each toggleable on/off"],["Incidents","Auto-correlated clusters of HIGH/CRITICAL alerts with AI-powered triage"],["Threat Intel","IOC feed from 6 simulated sources with per-indicator AI enrichment"],["Scenarios","Pre-scripted attack chains — Ransomware, Insider Threat, APT Financial Heist — fired through the live detection engine"],["Export","Download incidents as JSON or the full log buffer as CSV directly from the top bar"],["Settings","Live control over active environments and log generation speed"]])}</ul>
            {renderTip("QUICK START","The simulation starts automatically with Healthcare and Enterprise active at Normal speed. Open Incidents and click AI Analysis on any cluster to see Claude's threat assessment — the fastest path to a compelling demo.")}
          </div>
        )}
        {tab==="dashboard"&&(
          <div>
            <div style={hdStyle}>Dashboard</div>
            <p style={pStyle}>The Dashboard is your real-time security posture view. All values update live as the simulation generates new events.</p>
            <div style={shStyle}>Stat cards</div>
            <ul style={ulStyle}>{renderRows([["Total Events","Running count of logs in the 500-event rolling buffer"],["Open Alerts","Active alerts not yet resolved or attached to a closed incident"],["Open Incidents","Correlated clusters in OPEN status requiring analyst triage"],["Critical","Count of CRITICAL open alerts — pulses red in the top bar when non-zero"]])}</ul>
            <div style={shStyle}>Event timeline</div>
            <p style={pStyle}>A 12-bucket bar chart of recent activity. Blue bars show total events; red bars show alert triggers. A red spike relative to blue means a rule is firing repeatedly — investigate in Alert Rules.</p>
            <div style={shStyle}>Alerts by severity donut</div>
            <p style={pStyle}>Proportional breakdown of all alerts. Hover segments for exact counts. A chart dominated by red and orange signals active high-severity detections needing immediate escalation to Incidents.</p>
            <div style={shStyle}>Recent alerts feed</div>
            <p style={pStyle}>The 8 most recent triggered alerts showing severity, rule name, host, and timestamp. Left-border color matches severity. Use as a quick pulse-check before drilling into Alert Rules or Incidents.</p>
          </div>
        )}
        {tab==="logs"&&(
          <div>
            <div style={hdStyle}>Log Viewer</div>
            <p style={pStyle}>Displays the live event stream from all active environments, newest first. Buffers 500 events and renders the most recent 200 in the table.</p>
            <div style={shStyle}>Column reference</div>
            <ul style={ulStyle}>{renderRows([["TIME","Timestamp (HH:MM:SS) of the simulated event"],["LVL","Severity — INFO (blue) · WARN (amber) · ERROR (orange) · CRITICAL (red)"],["ENV","H = Healthcare · E = Enterprise · G = Government"],["HOST","Originating system — e.g. EHR-PROD-01, DESKTOP-247, CLASNET-01"],["SOURCE","Log source within the host — Epic EHR, Firewall, IDS/IPS, FHIR API, etc."],["MESSAGE","Full log message. Rows highlight on hover for easier reading."]])}</ul>
            <div style={shStyle}>Filtering</div>
            <p style={pStyle}>Filter by level, environment, or keyword — keyword matches both message and source fields. Filters stack: you can search a term within CRITICAL Enterprise logs simultaneously.</p>
            <div style={shStyle}>Speed and density</div>
            <p style={pStyle}>At Normal speed (~40 logs/min) the stream is readable. Switch to Fast or Burst in Settings to simulate high-volume ingestion — useful for demonstrating production-scale SOC handling.</p>
          </div>
        )}
        {tab==="rules"&&(
          <div>
            <div style={hdStyle}>Alert Rules</div>
            <p style={pStyle}>SENTINEL ships with 10 detection rules that automatically match against every incoming log. When a rule fires, it creates an alert and — if HIGH or CRITICAL — may trigger automatic incident correlation.</p>
            <div style={shStyle}>Rule anatomy</div>
            <ul style={ulStyle}>{renderRows([["Severity badge","CRITICAL / HIGH / MEDIUM — drives incident creation and alert coloring"],["Rule name","The threat behavior being detected, e.g. Brute Force Login or PHI Bulk Export"],["MITRE tag","ATT&CK technique ID — e.g. T1110 brute force, T1530 data from cloud storage"],["Hit count","Times this rule has matched since the simulation started"],["ON / OFF toggle","Disable a rule without deleting it — useful for tuning noise during demos"],["Pattern","The regex matched case-insensitively against each log message"]])}</ul>
            <div style={shStyle}>Triggered alerts panel</div>
            <p style={pStyle}>The right panel lists all fired alerts, filterable by severity. Each card shows the matched rule, host, source system, and the exact triggering log message — your raw evidence trail.</p>
            <div style={shStyle}>Using MITRE in a demo</div>
            <p style={pStyle}>Every rule maps to an adversary technique. In an interview, explain each in ATT&CK terms — the DLP Exfil rule (T1048) detects Exfiltration Over Alternative Protocol, mapping to data staging in the kill chain. This demonstrates threat-informed detection design.</p>
          </div>
        )}
        {tab==="incidents"&&(
          <div>
            <div style={hdStyle}>Incidents</div>
            <p style={pStyle}>Incidents are automatically created when HIGH or CRITICAL alerts fire. SENTINEL groups related alerts from the same environment into a cluster of up to 6 alerts, mimicking how production SIEMs correlate events into actionable cases.</p>
            <div style={shStyle}>Incident list</div>
            <p style={pStyle}>Newest incidents first. Each card shows severity, status (OPEN / CLOSED), environment, alert count, and creation time. Closed incidents dim to 40% opacity. Click any incident to open its full detail view.</p>
            <div style={shStyle}>Detail view fields</div>
            <ul style={ulStyle}>{renderRows([["Header","Incident ID, severity, status badge, environment tag, and timestamps"],["MITRE ATT&CK","Deduplicated technique list across all alerts in the cluster"],["AI Analysis","Claude's threat assessment — appears after clicking AI Analysis"],["Alert timeline","Chronological list of every alert with full message detail"],["Close button","Marks the incident CLOSED — simulates analyst resolution"]])}</ul>
            <div style={shStyle}>AI Analysis output</div>
            <p style={pStyle}>Clicking AI Analysis sends the full alert cluster to Claude, which returns a 2-3 sentence threat assessment, the likely attack stage or pattern, three immediate recommended actions, and an overall risk rating. Results persist for the session.</p>
            {renderTip("PORTFOLIO WORKFLOW","Walk an interviewer through a complete triage: identify the alert cluster, explain what each rule detected, map to the kill chain stage, run AI Analysis, then describe the remediation steps. This demonstrates the full SOC analyst workflow from detection to response.")}
          </div>
        )}
        {tab==="intel"&&(
          <div>
            <div style={hdStyle}>Threat Intelligence</div>
            <p style={pStyle}>The Threat Intel view displays a curated feed of Indicators of Compromise from six simulated commercial and government sources. In production, these would update automatically via STIX/TAXII integrations or vendor APIs.</p>
            <div style={shStyle}>IOC types</div>
            <ul style={ulStyle}>{renderRows([["IP (blue)","IPv4 addresses linked to C2 servers, scanners, or known threat actor infrastructure"],["DOMAIN (amber)","FQDNs used for phishing, malware command-and-control, or payload distribution"],["HASH (purple)","SHA-1/SHA-256 file hashes of known malware samples"]])}</ul>
            <div style={shStyle}>AI enrichment</div>
            <p style={pStyle}>Clicking Enrich with AI sends the IOC to Claude, which returns the likely threat actor or malware family, associated TTPs, and two specific defensive countermeasures. Results appear inline and persist for the session.</p>
            <div style={shStyle}>Cross-referencing with Log Viewer</div>
            <p style={pStyle}>If you spot a suspicious IP or domain in the Log Viewer, search for it here. If it appears in the feed, enrich it and tie the IOC back to the specific log event — demonstrating active threat hunting workflow.</p>
          </div>
        )}
        {tab==="settings"&&(
          <div>
            <div style={hdStyle}>Settings</div>
            <div style={shStyle}>Simulation environments</div>
            <p style={pStyle}>Toggle any combination of the three environments. Each active environment contributes its own log sources, compliance context, and detection patterns to the live stream simultaneously.</p>
            <ul style={ulStyle}>{renderRows([["Healthcare","HIPAA · HITECH · HITRUST — Epic EHR, HL7, FHIR API, DICOM, clinical workstation auth"],["Enterprise","NIST CSF — Windows AD, firewall, DNS, DLP gateway, endpoint AV, Active Directory"],["Government","FISMA · NIST 800-53 — classified system access, IDS/IPS, PKI/CAC, VPN gateway"],["FinTech","PCI-DSS · SWIFT · AML — card transactions, MT103 transfers, fraud engine, KYC/AML, HSM gateway"]])}</ul>
            <div style={shStyle}>Log generation speed</div>
            <ul style={ulStyle}>{renderRows([["Slow (~20/min)","Comfortable for reading each log — ideal for step-by-step walkthroughs"],["Normal (~40/min)","Default — balanced for demos, screenshots, and live investigation"],["Fast (~100/min)","Simulates moderate production load; incidents form quickly"],["Burst (~300/min)","Stress-test mode — demonstrates high-volume ingestion handling"]])}</ul>
            <div style={shStyle}>Pause / Resume</div>
            <p style={pStyle}>The Pause button (also in the top bar on every page) halts log generation without clearing any data. Use it when presenting to freeze the screen while walking through an incident.</p>
          </div>
        )}
        {tab==="deploy"&&(
          <div>
            <div style={hdStyle}>Deployment Guide</div>
            <p style={pStyle}>SENTINEL deploys to Netlify via a Vite + React scaffold. Estimated setup time: 15-20 minutes.</p>
            <div style={shStyle}>1. Scaffold the project</div>
            <div style={codeStyle}>{"npm create vite@latest sentinel-siem -- --template react\ncd sentinel-siem\nnpm install recharts"}</div>
            <div style={shStyle}>2. Replace src/App.jsx</div>
            <p style={pStyle}>Copy the full SENTINEL code from the Claude.ai artifact into <span style={inlineCodeStyle}>src/App.jsx</span>. Clear out <span style={inlineCodeStyle}>src/App.css</span> and remove its import from <span style={inlineCodeStyle}>src/main.jsx</span>.</p>
            <div style={shStyle}>3. Create netlify/functions/ai-proxy.js</div>
            <p style={pStyle}>This keeps your Anthropic API key server-side. Create the <span style={inlineCodeStyle}>netlify/functions/</span> folder at the project root and paste the proxy code from the deployment response.</p>
            <div style={shStyle}>4. Create netlify.toml at the project root</div>
            <p style={pStyle}>The toml tells Netlify the build command, publish directory, functions folder, and SPA redirect rule. Paste the toml config from the deployment response.</p>
            <div style={shStyle}>5. Push to GitHub and connect Netlify</div>
            <div style={codeStyle}>{"git init && git add . && git commit -m \"init sentinel-siem\"\ngit remote add origin https://github.com/YOUR_USERNAME/sentinel-siem.git\ngit push -u origin main"}</div>
            <p style={pStyle}>In Netlify: Add new site, Import from GitHub. Build command: <span style={inlineCodeStyle}>npm run build</span> — Publish directory: <span style={inlineCodeStyle}>dist</span>.</p>
            <div style={shStyle}>6. Set the API key</div>
            <p style={pStyle}>Netlify, Site configuration, Environment variables, Add: <span style={inlineCodeStyle}>ANTHROPIC_API_KEY</span> = your Anthropic key. Trigger a redeploy. All AI features activate automatically.</p>
            {renderTip("PREVIEW vs PRODUCTION","In the Claude.ai preview, AI calls go directly to the Anthropic API with no key required. On your Netlify deployment, all AI calls automatically route through /.netlify/functions/ai-proxy where your key is injected server-side. The URL switch is automatic — no code changes needed between environments.")}
          </div>
        )}
        {tab==="scenarios"&&(
          <div>
            <div style={hdStyle}>Scenario Mode</div>
            <p style={pStyle}>Scenario Mode fires pre-scripted attack chains through the live detection engine in real time — logs are injected in timed sequence, triggering actual alert rules, incident correlation, and MITRE ATT&CK attribution exactly as they would in a production environment.</p>
            <div style={shStyle}>The three scenarios</div>
            <ul style={ulStyle}>{renderRows([
              ["Ransomware Kill Chain","Enterprise · ~65 sec. Phishing email to macro execution, credential theft, C2 callback block, file encryption, privilege escalation, and data exfiltration. Triggers rules: Malware Detected, Firewall DENY, Brute Force Login, DLP Exfil, Privilege Escalation."],
              ["Insider Threat","Healthcare · ~52 sec. Off-hours PHI access escalates through velocity anomaly, bulk patient record export, DLP violation, account lockout, and a second mass export. Triggers rules: PHI Bulk Export, DLP Exfil Attempt, Brute Force Login."],
              ["APT Financial Heist","Government + FinTech · ~75 sec. Nation-state campaign spanning two environments — VPN compromise, IDS intrusion, classified system breach, SWIFT fraud, card skimming, exfiltration, and AML flag. Triggers rules: VPN Cert Mismatch, IDS Intrusion, Classified Access, DLP Exfil, Card Skimming, SWIFT Anomaly."],
            ])}</ul>
            <div style={shStyle}>How to use</div>
            <ul style={ulStyle}>{renderRows([
              ["Launch","Click Launch Scenario on any card. The background simulation keeps running — you see real noise alongside the scripted attack, just like a production SOC."],
              ["Progress bar","Tracks steps completed with a blue-to-green gradient fill. The current injected event message appears below the bar."],
              ["Event feed","All injected events stream into the Scenario Event Feed below the cards, color-coded by severity level."],
              ["Cancel","Stops all pending timed events immediately. The events already fired remain in logs, alerts, and incidents."],
            ])}</ul>
            {renderTip("PORTFOLIO TIP","After launching a scenario, switch to Incidents and run AI Analysis on the auto-generated cluster. Walk the interviewer through the full kill chain — initial access, execution, impact — then show Claude's threat assessment and your remediation plan. A scripted attack driving real detections with AI triage is a standout portfolio moment.")}
          </div>
        )}
      </div>
    </div>
  );
}

function ScenarioView({setLogs,setAlerts,setIncidents,setRules,setTl,logN,altN,incN,rulesRef,C}){
  const [active,setActive]=useState(null);
  const [step,setStep]=useState(0);
  const [feed,setFeed]=useState([]);
  const timers=useRef([]);
  useEffect(()=>()=>timers.current.forEach(t=>clearTimeout(t)),[]);

  const cancel=()=>{
    timers.current.forEach(t=>clearTimeout(t));
    timers.current=[];
    setActive(null);
    setStep(0);
  };

  const launch=(sc)=>{
    if(active)cancel();
    setActive(sc.id);
    setStep(0);
    setFeed([]);
    timers.current=[];
    sc.steps.forEach((stp,i)=>{
      const t=setTimeout(()=>{
        const log={
          id:`LOG-${String(logN.current++).padStart(6,"0")}`,
          timestamp:new Date().toISOString(),
          level:stp.level, env:stp.env,
          source:stp.source, host:stp.host, message:stp.msg,
        };
        setLogs(p=>[log,...p].slice(0,500));
        setFeed(p=>[log,...p]);
        setStep(i+1);
        setTl(p=>{const n=[...p];n[11]={...n[11],ev:n[11].ev+1};return n;});
        const matched=rulesRef.current.filter(r=>r.on&&new RegExp(r.pattern,"i").test(log.message));
        if(matched.length){
          setRules(p=>p.map(r=>matched.find(m=>m.id===r.id)?{...r,hits:r.hits+1}:r));
          const newAlts=matched.map(r=>({
            id:`ALT-${String(altN.current++).padStart(4,"0")}`,
            timestamp:log.timestamp,ruleName:r.name,ruleId:r.id,
            sev:r.sev,mitre:r.mitre,src:log.source,host:log.host,
            env:log.env,msg:log.message,status:"OPEN",
          }));
          setAlerts(p=>[...newAlts,...p].slice(0,300));
          setTl(p=>{const n=[...p];n[11]={...n[11],al:n[11].al+matched.length};return n;});
          newAlts.filter(a=>a.sev==="CRITICAL"||a.sev==="HIGH").forEach(alt=>{
            setIncidents(p=>{
              const ex=p.find(i=>i.status==="OPEN"&&i.env===alt.env&&i.alts.length<6);
              if(ex)return p.map(i=>i.id===ex.id?{...i,alts:[...i.alts,alt],updated:alt.timestamp}:i);
              return[{
                id:`INC-${String(incN.current++).padStart(4,"0")}`,
                title:sc.name,
                sev:alt.sev,status:"OPEN",env:alt.env,
                alts:[alt],created:alt.timestamp,updated:alt.timestamp,analysis:null,
              },...p].slice(0,50);
            });
          });
        }
        if(i===sc.steps.length-1)setTimeout(()=>setActive(null),3000);
      },stp.delay);
      timers.current.push(t);
    });
  };

  const activeSc=SCENARIOS.find(s=>s.id===active);
  const pct=activeSc?Math.round((step/activeSc.steps.length)*100):0;
  const lc=l=>({INFO:C.blueLt,WARN:C.amber,ERROR:C.orange,CRITICAL:"#ffaaaa"}[l]||C.cream);

  return(
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
        <div>
          <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,marginBottom:3}}>Scenario Mode</div>
          <div style={{fontSize:9,color:C.muted}}>Pre-scripted attack chains — events are injected through the live detection engine in real time</div>
        </div>
        {active&&<button onClick={cancel} style={{padding:"5px 14px",background:C.redBg,border:`1px solid ${C.red}`,color:C.red,borderRadius:3,cursor:"pointer",fontSize:9,fontWeight:700,flexShrink:0}}>Cancel</button>}
      </div>

      {activeSc&&(
        <div style={{background:C.panel,border:`1px solid ${C.blue}55`,borderRadius:5,padding:12,marginBottom:14,boxShadow:`0 0 16px ${C.blue}22`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
            <span style={{fontSize:11,fontWeight:600,color:C.blueLt}}>{activeSc.name}</span>
            <span style={{fontSize:9,color:C.muted}}>step {step} / {activeSc.steps.length}</span>
          </div>
          <div style={{background:C.elevated,borderRadius:3,height:6,overflow:"hidden",marginBottom:7}}>
            <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${C.blue},${C.green})`,transition:"width 0.6s ease",borderRadius:3}}/>
          </div>
          {step>0&&step<=activeSc.steps.length&&(
            <div style={{fontSize:9,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {activeSc.steps[step-1]?.msg}
            </div>
          )}
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10,marginBottom:16}}>
        {SCENARIOS.map(sc=>{
          const isActive=active===sc.id;
          const envClr=ENVS[sc.env]?.clr||C.blue;
          return(
            <div key={sc.id} style={{background:C.panel,border:`1px solid ${isActive?C.blue:C.border}`,borderRadius:6,padding:14,transition:"all 0.2s",boxShadow:isActive?`0 0 14px ${C.blue}33`:"none"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                <div>
                  <div style={{fontFamily:"Georgia,serif",fontSize:12,fontWeight:700,color:C.cream,marginBottom:5}}>{sc.name}</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    <span style={{fontSize:7,padding:"1px 6px",background:`${envClr}22`,color:envClr,border:`1px solid ${envClr}44`,borderRadius:3}}>{sc.env}</span>
                    <span style={{fontSize:7,padding:"1px 6px",background:C.elevated,color:C.muted,border:`1px solid ${C.border}`,borderRadius:3}}>{sc.steps.length} events</span>
                    <span style={{fontSize:7,padding:"1px 6px",background:C.elevated,color:C.dim,border:`1px solid ${C.border}`,borderRadius:3}}>{sc.duration}</span>
                  </div>
                </div>
              </div>
              <p style={{fontSize:10,color:C.muted,lineHeight:1.65,marginBottom:10,marginTop:0}}>{sc.desc}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:12}}>
                {sc.mitre.map(t=><span key={t} style={{fontSize:7,padding:"1px 5px",background:C.purpleBg,border:`1px solid ${C.purpleBdr}`,color:C.purple,borderRadius:3}}>{t}</span>)}
              </div>
              <button
                onClick={()=>launch(sc)}
                disabled={!!active}
                style={{width:"100%",padding:"8px",background:isActive?`${C.blue}22`:active?"transparent":`${C.blue}11`,border:`1px solid ${isActive?C.blue:active?C.border:C.blue+"55"}`,color:isActive?C.blueLt:active?C.dim:C.blue,borderRadius:4,cursor:active?"not-allowed":"pointer",fontSize:10,fontWeight:600,transition:"all 0.15s"}}>
                {isActive?"Running...":"▶  Launch Scenario"}
              </button>
            </div>
          );
        })}
      </div>

      {feed.length>0&&(
        <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:5,padding:12}}>
          <div style={{fontSize:8,color:C.muted,letterSpacing:"0.12em",marginBottom:8}}>SCENARIO EVENT FEED</div>
          {feed.map(l=>(
            <div key={l.id} style={{display:"flex",gap:8,padding:"5px 8px",borderRadius:3,marginBottom:3,background:C.elevated,borderLeft:`2px solid ${SS[l.level]?.bdr||C.border}`}}>
              <span style={{fontSize:8,color:C.dim,flexShrink:0,width:46}}>{ft(l.timestamp)}</span>
              <span style={{fontSize:8,fontWeight:700,color:lc(l.level),flexShrink:0,width:52}}>{l.level}</span>
              <span style={{fontSize:9,color:C.muted,flexShrink:0,width:88,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.source}</span>
              <span style={{fontSize:9,color:l.level==="CRITICAL"?"#ffaaaa":l.level==="ERROR"?"#ffc09a":C.cream,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{l.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}