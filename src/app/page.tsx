"use client";
import { useState, useEffect, useMemo } from "react";

type User = { id: number; username: string; nama: string; role: string; jabatan?: string; email?: string };
type Ruangan = { id: number; kode: string; nama: string; gedung: string; lantai: number; kapasitas: number; tipe: string; penanggungJawab?: string; status: string };
type Aset = { id: number; kodeAset: string; nama: string; kategori: string; ruanganId?: number; kondisi: string; status: string; tanggalPerolehan?: string; harga: string; penanggungJawab?: string; deskripsi?: string; merk?: string; tahun?: number; createdAt?: string };
type Pemeliharaan = { id: number; kode: string; asetId?: number; judul: string; jenis: string; prioritas: string; status: string; tanggalLapor: string; tanggalTarget?: string; tanggalSelesai?: string; pelapor: string; teknisiId?: number; biaya: string; deskripsi?: string; catatanTeknisi?: string };
type Jadwal = { id: number; asetId?: number; judul: string; frekuensi: string; tanggalSelanjutnya: string; penanggungJawab?: string; deskripsi?: string };

const KATEGORI = ["Elektronik","Furniture","Laboratorium","Olahraga","Kebersihan","Kendaraan","ATK","Ibadah","Perpustakaan","Dapur","Keamanan"];
const KONDISI = ["Baik","Rusak Ringan","Rusak Berat","Perlu Perbaikan","Baru"];
const STATUS_ASET = ["Aktif","Tidak Aktif","Dipinjam","Dalam Perbaikan","Dihapus"];
const JENIS_MTN = ["Rutin","Perbaikan","Darurat","Preventif","Inspeksi"];
const PRIORITAS = ["Rendah","Sedang","Tinggi","Mendesak"];
const STATUS_MTN = ["Diajukan","Disetujui","Dikerjakan","Selesai","Ditolak","Menunggu Suku Cadang"];
const TIPE_RUANGAN = ["Kelas","Laboratorium","Perpustakaan","Kantor","Masjid","Aula","UKS","Kantin","Gudang","Lapangan","Toilet","Lainnya"];
const FREKUENSI = ["Harian","Mingguan","Bulanan","Triwulan","Semester","Tahunan"];
const GEDUNG = ["Gedung TK","Gedung SD","Gedung SMP","Gedung Pusat","Gedung Sarpras"];
const _now = Date.now();

function Badge({ children, tone="gray" }: { children:any, tone?:string }) {
  const map:any = {
    gray:"bg-zinc-100 text-zinc-600 border-zinc-200",
    green:"bg-emerald-50 text-emerald-700 border-emerald-200",
    red:"bg-red-50 text-red-700 border-red-200",
    yellow:"bg-amber-50 text-amber-700 border-amber-200",
    blue:"bg-blue-50 text-blue-700 border-blue-200",
    orange:"bg-orange-50 text-orange-700 border-orange-200",
    purple:"bg-violet-50 text-violet-700 border-violet-200",
    emerald:"bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border tracking-wide ${map[tone]||map.gray}`}>{children}</span>;
}

function kondisiTone(k:string){
  if(k==="Baik") return "green";
  if(k==="Baru") return "blue";
  if(k==="Perlu Perbaikan") return "yellow";
  if(k==="Rusak Ringan") return "orange";
  return "red";
}
function prioritasTone(p:string){
  if(p==="Rendah") return "gray";
  if(p==="Sedang") return "blue";
  if(p==="Tinggi") return "orange";
  return "red";
}
function statusMtnTone(s:string){
  if(s==="Selesai") return "green";
  if(s==="Diajukan") return "yellow";
  if(s==="Disetujui") return "blue";
  if(s==="Dikerjakan") return "orange";
  if(s==="Ditolak") return "red";
  return "purple";
}

const ROLE_NAV: Record<string, {k:string; l:string; icon:string; desc:string}[]> = {
  admin: [
    {k:"dashboard", l:"Dasbor", icon:"◧", desc:"Ringkasan & Statistik"},
    {k:"aset", l:"Manajemen Aset", icon:"📦", desc:"Inventaris aset sekolah"},
    {k:"ruangan", l:"Ruangan & Lokasi", icon:"🏫", desc:"Kelola gedung & kelas"},
    {k:"pemeliharaan", l:"Pemeliharaan", icon:"🔧", desc:"Work order & perbaikan"},
    {k:"jadwal", l:"Jadwal Rutin", icon:"🗓️", desc:"Preventif & terjadwal"},
    {k:"laporan", l:"Laporan", icon:"📊", desc:"Biaya & kondisi"},
  ],
  sarpras: [
    {k:"dashboard", l:"Dasbor", icon:"◧", desc:"Ringkasan & Statistik"},
    {k:"aset", l:"Manajemen Aset", icon:"📦", desc:"Inventaris aset sekolah"},
    {k:"ruangan", l:"Ruangan & Lokasi", icon:"🏫", desc:"Kelola gedung & kelas"},
    {k:"pemeliharaan", l:"Pemeliharaan", icon:"🔧", desc:"Work order & perbaikan"},
    {k:"jadwal", l:"Jadwal Rutin", icon:"🗓️", desc:"Preventif & terjadwal"},
    {k:"laporan", l:"Laporan", icon:"📊", desc:"Biaya & kondisi"},
  ],
  teknisi: [
    {k:"dashboard", l:"Dasbor", icon:"◧", desc:"Ringkasan & Statistik"},
    {k:"pemeliharaan", l:"Pemeliharaan", icon:"🔧", desc:"Work order saya"},
    {k:"aset", l:"Aset", icon:"📦", desc:"Detail aset"},
  ],
  guru: [
    {k:"dashboard", l:"Dasbor", icon:"◧", desc:"Ringkasan & Statistik"},
    {k:"pemeliharaan", l:"Buat Laporan", icon:"📝", desc:"Laporkan kerusakan"},
  ],
  kepala_sekolah: [
    {k:"dashboard", l:"Dasbor", icon:"◧", desc:"Ringkasan & Statistik"},
    {k:"laporan", l:"Laporan", icon:"📊", desc:"Rekap & analitik"},
  ],
};

const ROLE_HEADER_TITLES: Record<string, {[key: string]: string}> = {
  admin: {dashboard:"Dasbor Sarpras", aset:"Manajemen Aset Sekolah", ruangan:"Ruangan & Lokasi", pemeliharaan:"Pemeliharaan & Perbaikan", jadwal:"Jadwal Pemeliharaan Rutin", laporan:"Laporan & Analitik"},
  sarpras: {dashboard:"Dasbor Sarpras", aset:"Manajemen Aset Sekolah", ruangan:"Ruangan & Lokasi", pemeliharaan:"Pemeliharaan & Perbaikan", jadwal:"Jadwal Pemeliharaan Rutin", laporan:"Laporan & Analitik"},
  teknisi: {dashboard:"Dasbor Teknisi", pemeliharaan:"Pemeliharaan Saya", aset:"Detail Aset"},
  guru: {dashboard:"Dasbor Guru", pemeliharaan:"Buat Laporan Pemeliharaan"},
  kepala_sekolah: {dashboard:"Dasbor Kepala Sekolah", laporan:"Laporan"},
};

function getRoleNav(role: string) {
  return ROLE_NAV[role] || ROLE_NAV.admin;
}

function getHeaderTitle(role: string, tab: string): string {
  const titles = ROLE_HEADER_TITLES[role] || ROLE_HEADER_TITLES.admin;
  return titles[tab] || "Dasbor Sarpras";
}

function getHeaderDesc(role: string, tab: string, stats: any, filteredAset: any[]): string {
  if (role === "teknisi") {
    if (tab === "dashboard") return "Work order dan tugas pemeliharaan saya";
    if (tab === "pemeliharaan") return "Kelola work order yang ditugaskan";
    if (tab === "aset") return "Informasi aset yang sedang diperbaiki";
  }
  if (role === "guru") {
    if (tab === "dashboard") return "Laporkan kerusakan aset dan pantau status";
    if (tab === "pemeliharaan") return "Buat laporan kerusakan atau permintaan service";
  }
  if (role === "kepala_sekolah") {
    if (tab === "dashboard") return "Ringkasan kondisi aset dan pemeliharaan sekolah";
    if (tab === "laporan") return "Rekap biaya, kondisi, dan performa pemeliharaan";
  }
  if (tab === "dashboard") return "Pantau kondisi aset, perbaikan, dan jadwal preventif sekolah dalam satu tempat";
  if (tab === "aset") return `${filteredAset.length} aset • ${stats?.cards.perluPerbaikan||0} butuh perhatian`;
  if (tab === "ruangan") return "Kelola 15 ruangan aktif di 5 gedung";
  if (tab === "pemeliharaan") return "Kelola work order perbaikan dari guru dan staff";
  if (tab === "jadwal") return "Jangan sampai terlewat service rutin";
  if (tab === "laporan") return "Rekap biaya, kondisi, dan performa pemeliharaan";
  return "";
}

function canEdit(role: string, tab: string): boolean {
  if (role === "admin" || role === "sarpras") return true;
  if (role === "teknisi" && tab === "pemeliharaan") return true;
  if (role === "guru" && tab === "pemeliharaan") return true;
  return false;
}

function canCreate(role: string, tab: string): boolean {
  if (role === "admin" || role === "sarpras") return true;
  if (role === "guru" && tab === "pemeliharaan") return true;
  return false;
}

function canDelete(role: string): boolean {
  return role === "admin" || role === "sarpras";
}

function canView(role: string, tab: string): boolean {
  return getRoleNav(role).some(item => item.k === tab);
}

export default function Page(){
  const [user, setUser] = useState<User|null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("yb_user");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({username:"admin", password:"admin123"});
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [activeTab, setActiveTab] = useState<"dashboard"|"aset"|"ruangan"|"pemeliharaan"|"jadwal"|"laporan">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // data
  const [stats, setStats] = useState<any>(null);
  const [asetList, setAsetList] = useState<Aset[]>([]);
  const [ruanganList, setRuanganList] = useState<Ruangan[]>([]);
  const [mtnList, setMtnList] = useState<Pemeliharaan[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // filters
  const [qAset, setQAset] = useState("");
  const [fKategori, setFKategori] = useState("");
  const [fKondisi, setFKondisi] = useState("");
  const [viewMode, setViewMode] = useState<"grid"|"table">("grid");

  const [qRuangan, setQRuangan] = useState("");
  const [qMtn, setQMtn] = useState("");
  const [fStatusMtn, setFStatusMtn] = useState("");

  // modals
  const [showAsetModal, setShowAsetModal] = useState(false);
  const [editingAset, setEditingAset] = useState<Aset|null>(null);
  const [asetForm, setAsetForm] = useState<any>({});
  const [showRuanganModal, setShowRuanganModal] = useState(false);
  const [editingRuangan, setEditingRuangan] = useState<Ruangan|null>(null);
  const [ruanganForm, setRuanganForm] = useState<any>({});
  const [showMtnModal, setShowMtnModal] = useState(false);
  const [editingMtn, setEditingMtn] = useState<Pemeliharaan|null>(null);
  const [mtnForm, setMtnForm] = useState<any>({});
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<Jadwal|null>(null);
  const [jadwalForm, setJadwalForm] = useState<any>({});

  async function loadAll(){
    setLoadingData(true);
    try{
      await Promise.all([fetchStats(), fetchAset(), fetchRuangan(), fetchMtn(), fetchJadwal(), fetchUsers()]);
    }finally{ setLoadingData(false); }
  }

  const fetchStats = async ()=>{
    const params = new URLSearchParams();
    if (user?.role === "teknisi") {
      params.set("role", "teknisi");
      params.set("userId", String(user.id));
    } else if (user?.role === "guru") {
      params.set("role", "guru");
      params.set("nama", user.nama);
    }
    const qs = params.toString();
    const r = await fetch(`/api/dashboard/stats${qs ? "?" + qs : ""}`);
    if(r.ok){
      const data = await r.json();
      setStats(data);
      if(data.cards.totalAset===0){
        setSeeding(true);
        await fetch("/api/seed",{method:"POST"});
        setSeeding(false);
        setTimeout(()=>loadAll(), 800);
      }
    }
  };
  const fetchAset = async ()=>{ const r=await fetch("/api/aset"); if(r.ok) setAsetList(await r.json()); };
  const fetchRuangan = async ()=>{ const r=await fetch("/api/ruangan"); if(r.ok) setRuanganList(await r.json()); };
  const fetchMtn = async ()=>{ const r=await fetch("/api/pemeliharaan"); if(r.ok) setMtnList(await r.json()); };
  const fetchJadwal = async ()=>{ const r=await fetch("/api/jadwal"); if(r.ok) setJadwalList(await r.json()); };
  const fetchUsers = async ()=>{ const r=await fetch("/api/users"); if(r.ok) setUsersList(await r.json()); };

  useEffect(()=>{
    if(!user) return;
    console.log("[APP] user loaded, fetching data:", user.username);
    setTimeout(() => loadAll());
    // loadAll is a stable function declaration; adding it to deps would trigger unnecessary reruns.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[user]);

  useEffect(()=>{
    if(user) console.log("[APP] user state changed:", user?.username);
  },[user]);

  const handleLogin = async (e?:any)=>{
    e?.preventDefault();
    console.log("[LOGIN] attempt", loginForm);
    setLoginBusy(true); setLoginError("");
    try{
      const r = await fetch("/api/auth/login",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(loginForm)});
      const data = await r.json();
      console.log("[LOGIN] response", r.status, data);
      if(!r.ok) throw new Error(data.error||"Gagal login");
      setUser(data.user);
      localStorage.setItem("yb_user", JSON.stringify(data.user));
    }catch(err:any){ console.error("[LOGIN] error", err); setLoginError(err.message); }
    finally{ setLoginBusy(false); }
  };

  const handleLogout = ()=>{
    setUser(null);
    localStorage.removeItem("yb_user");
  };

  const filteredAset = useMemo(()=>{
    return asetList.filter(a=>{
      if(qAset && !(`${a.nama} ${a.kodeAset} ${a.merk||""}`.toLowerCase().includes(qAset.toLowerCase()))) return false;
      if(fKategori && a.kategori!==fKategori) return false;
      if(fKondisi && a.kondisi!==fKondisi) return false;
      return true;
    });
  },[asetList,qAset,fKategori,fKondisi]);

  const filteredRuangan = useMemo(()=> ruanganList.filter(r=> !qRuangan || `${r.nama} ${r.kode} ${r.gedung}`.toLowerCase().includes(qRuangan.toLowerCase())),[ruanganList,qRuangan]);
  const filteredMtn = useMemo(()=> mtnList.filter(m=> {
    if(qMtn && !(`${m.judul} ${m.kode} ${m.pelapor}`.toLowerCase().includes(qMtn.toLowerCase()))) return false;
    if(fStatusMtn && m.status!==fStatusMtn) return false;
    return true;
  }),[mtnList,qMtn,fStatusMtn]);

  // CRUD ASET
  const openAddAset = ()=>{ setEditingAset(null); setAsetForm({kategori:"Elektronik", kondisi:"Baik", status:"Aktif", tahun:new Date().getFullYear()}); setShowAsetModal(true); };
  const openEditAset = (a:Aset)=>{ setEditingAset(a); setAsetForm({...a, ruanganId:a.ruanganId?.toString()}); setShowAsetModal(true); };
  const saveAset = async ()=>{
    if(!asetForm.nama) return alert("Nama aset wajib diisi");
    const isEdit = !!editingAset;
    const tempId = Date.now();
    const optimistic:Aset = { id: isEdit? editingAset!.id : tempId, kodeAset: asetForm.kodeAset || `AST-${tempId.toString().slice(-5)}`, nama: asetForm.nama, kategori: asetForm.kategori, ruanganId: asetForm.ruanganId? Number(asetForm.ruanganId):undefined, kondisi: asetForm.kondisi, status: asetForm.status, harga: asetForm.harga||"0", penanggungJawab: asetForm.penanggungJawab, deskripsi: asetForm.deskripsi, merk: asetForm.merk, tahun: asetForm.tahun? Number(asetForm.tahun):undefined, tanggalPerolehan: asetForm.tanggalPerolehan } as any;

    // optimistic
    if(isEdit) setAsetList(prev=>prev.map(x=>x.id===editingAset!.id? {...x, ...optimistic}:x));
    else setAsetList(prev=>[optimistic, ...prev]);
    setShowAsetModal(false);

    try{
      const url = isEdit? `/api/aset/${editingAset!.id}` : "/api/aset";
      const method = isEdit? "PUT":"POST";
      const r = await fetch(url,{method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(asetForm)});
      if(!r.ok) throw new Error("Gagal simpan");
      const saved = await r.json();
      if(isEdit) setAsetList(prev=>prev.map(x=>x.id===editingAset!.id? saved:x));
      else setAsetList(prev=>prev.map(x=>x.id===tempId? saved:x));
      fetchStats();
    }catch(e){
      alert("Gagal menyimpan aset, rollback");
      if(isEdit) fetchAset(); else setAsetList(prev=>prev.filter(x=>x.id!==tempId));
    }
  };
  const deleteAset = async (id:number)=>{
    if(!confirm("Yakin hapus aset ini?")) return;
    const prev = asetList;
    setAsetList(prev.filter(a=>a.id!==id));
    try{
      const r=await fetch(`/api/aset/${id}`,{method:"DELETE"});
      if(!r.ok) throw new Error();
      fetchStats();
    }catch{ setAsetList(prev); alert("Gagal hapus"); }
  };

  // CRUD RUANGAN
  const openAddRuangan = ()=>{ setEditingRuangan(null); setRuanganForm({gedung:"Gedung SD", tipe:"Kelas", lantai:1, kapasitas:30, status:"Aktif"}); setShowRuanganModal(true); };
  const openEditRuangan = (r:Ruangan)=>{ setEditingRuangan(r); setRuanganForm({...r}); setShowRuanganModal(true); };
  const saveRuangan = async ()=>{
    if(!ruanganForm.nama) return alert("Nama ruangan wajib");
    const isEdit=!!editingRuangan;
    const tempId=Date.now();
    const optimistic:Ruangan = { id:isEdit?editingRuangan!.id:tempId, kode:ruanganForm.kode||`RNG-${tempId.toString().slice(-4)}`, nama:ruanganForm.nama, gedung:ruanganForm.gedung, lantai:Number(ruanganForm.lantai)||1, kapasitas:Number(ruanganForm.kapasitas)||0, tipe:ruanganForm.tipe, penanggungJawab:ruanganForm.penanggungJawab, status:ruanganForm.status };
    if(isEdit) setRuanganList(p=>p.map(x=>x.id===editingRuangan!.id? optimistic:x)); else setRuanganList(p=>[optimistic,...p]);
    setShowRuanganModal(false);
    try{
      const url=isEdit?`/api/ruangan/${editingRuangan!.id}`:"/api/ruangan";
      const method=isEdit?"PUT":"POST";
      const r=await fetch(url,{method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(ruanganForm)});
      if(!r.ok) throw new Error();
      const saved=await r.json();
      if(isEdit) setRuanganList(p=>p.map(x=>x.id===editingRuangan!.id? saved:x)); else setRuanganList(p=>p.map(x=>x.id===tempId? saved:x));
      fetchStats();
    }catch{ alert("Gagal simpan ruangan"); fetchRuangan(); }
  };
  const deleteRuangan = async (id:number)=>{
    if(!confirm("Hapus ruangan? Pastikan tidak ada aset terkait.")) return;
    const prev=ruanganList; setRuanganList(prev.filter(r=>r.id!==id));
    try{ const r=await fetch(`/api/ruangan/${id}`,{method:"DELETE"}); if(!r.ok) throw new Error(); fetchStats(); }catch{ setRuanganList(prev); }
  };

  // CRUD PEMELIHARAAN
  const openAddMtn = ()=>{ setEditingMtn(null); setMtnForm({jenis:"Perbaikan", prioritas:"Sedang", status:"Diajukan", pelapor:user?.nama||"", biaya:"0"}); setShowMtnModal(true); };
  const openEditMtn = (m:Pemeliharaan)=>{ setEditingMtn(m); setMtnForm({...m, asetId:m.asetId?.toString(), teknisiId:m.teknisiId?.toString()}); setShowMtnModal(true); };
  const saveMtn = async ()=>{
    if(!mtnForm.judul) return alert("Judul wajib");
    const isEdit=!!editingMtn; const tempId=Date.now();
    const optimistic:Pemeliharaan = { id:isEdit?editingMtn!.id:tempId, kode:mtnForm.kode||`MNT-${tempId.toString().slice(-5)}`, judul:mtnForm.judul, jenis:mtnForm.jenis, prioritas:mtnForm.prioritas, status:mtnForm.status, tanggalLapor:new Date().toISOString(), pelapor:mtnForm.pelapor, biaya:mtnForm.biaya||"0", deskripsi:mtnForm.deskripsi, asetId:mtnForm.asetId?Number(mtnForm.asetId):undefined } as any;
    if(isEdit) setMtnList(p=>p.map(x=>x.id===editingMtn!.id? {...x,...optimistic}:x)); else setMtnList(p=>[optimistic,...p]);
    setShowMtnModal(false);
    try{
      const url=isEdit?`/api/pemeliharaan/${editingMtn!.id}`:"/api/pemeliharaan";
      const method=isEdit?"PUT":"POST";
      const r=await fetch(url,{method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(mtnForm)});
      if(!r.ok) throw new Error();
      const saved=await r.json();
      if(isEdit) setMtnList(p=>p.map(x=>x.id===editingMtn!.id? saved:x)); else setMtnList(p=>p.map(x=>x.id===tempId? saved:x));
      fetchStats();
    }catch{ alert("Gagal simpan"); fetchMtn(); }
  };
  const deleteMtn = async (id:number)=>{
    if(!confirm("Hapus laporan pemeliharaan ini?")) return;
    const prev=mtnList; setMtnList(prev.filter(m=>m.id!==id));
    try{ const r=await fetch(`/api/pemeliharaan/${id}`,{method:"DELETE"}); if(!r.ok) throw new Error(); fetchStats(); }catch{ setMtnList(prev); }
  };

  // CRUD JADWAL
  const openAddJadwal = ()=>{ setEditingJadwal(null); setJadwalForm({frekuensi:"Bulanan", tanggalSelanjutnya:new Date(Date.now()+7*24*3600*1000).toISOString().split('T')[0]}); setShowJadwalModal(true); };
  const openEditJadwal = (j:Jadwal)=>{ setEditingJadwal(j); setJadwalForm({...j, asetId:j.asetId?.toString()}); setShowJadwalModal(true); };
  const saveJadwal = async ()=>{
    if(!jadwalForm.judul) return alert("Judul wajib");
    const isEdit=!!editingJadwal; const tempId=Date.now();
    const optimistic:Jadwal = { id:isEdit?editingJadwal!.id:tempId, judul:jadwalForm.judul, frekuensi:jadwalForm.frekuensi, tanggalSelanjutnya:jadwalForm.tanggalSelanjutnya, penanggungJawab:jadwalForm.penanggungJawab, deskripsi:jadwalForm.deskripsi, asetId:jadwalForm.asetId?Number(jadwalForm.asetId):undefined };
    if(isEdit) setJadwalList(p=>p.map(x=>x.id===editingJadwal!.id? optimistic:x)); else setJadwalList(p=>[optimistic,...p]);
    setShowJadwalModal(false);
    try{
      const url=isEdit?`/api/jadwal/${editingJadwal!.id}`:"/api/jadwal";
      const method=isEdit?"PUT":"POST";
      const r=await fetch(url,{method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(jadwalForm)});
      if(!r.ok) throw new Error();
      const saved=await r.json();
      if(isEdit) setJadwalList(p=>p.map(x=>x.id===editingJadwal!.id? saved:x)); else setJadwalList(p=>p.map(x=>x.id===tempId? saved:x));
    }catch{ alert("Gagal simpan"); fetchJadwal(); }
  };
  const deleteJadwal = async (id:number)=>{
    if(!confirm("Hapus jadwal?")) return;
    const prev=jadwalList; setJadwalList(prev.filter(j=>j.id!==id));
    try{ const r=await fetch(`/api/jadwal/${id}`,{method:"DELETE"}); if(!r.ok) throw new Error(); }catch{ setJadwalList(prev); }
  };

  const ruanganById = useMemo(()=>{ const m:any={}; ruanganList.forEach(r=>m[r.id]=r); return m; },[ruanganList]);
  const asetById = useMemo(()=>{ const m:any={}; asetList.forEach(a=>m[a.id]=a); return m; },[asetList]);

  if(authLoading){
    console.log("[APP] authLoading=true, showing splash");
    return <div className="min-h-screen grid place-items-center bg-[#FFFBF5]"><div className="animate-pulse flex flex-col items-center gap-4"><img src="/logo.svg" alt="logo" className="w-24 h-24 object-contain"/><div className="h-2 w-24 bg-orange-100 rounded-full overflow-hidden"><div className="h-full bg-[#FF2D00] animate-[shimmer_1s_infinite] w-1/2"/></div></div></div>;
  }

  if(!user){
    console.log("[APP] user is null, showing login page");
    return (
      <div className="min-h-screen flex bg-[#FFFBF5]">
        <div className="flex-1 hidden lg:flex flex-col justify-between p-12 bg-[#FF2D00] text-white relative overflow-hidden">
          <div className="absolute -right-40 -top-40 w-[600px] h-[600px] bg-[#FFD60A] rounded-full opacity-20"/>
          <div className="absolute -left-40 -bottom-40 w-[500px] h-[500px] bg-white rounded-full opacity-10"/>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl grid place-items-center"><img src="/logo.svg" className="w-10 h-10 object-contain" alt="logo"/></div>
              <div><div className="font-bold leading-none">YAA BUNAYYA</div><div className="text-xs opacity-80">Islamic School</div></div>
            </div>
          </div>
          <div className="relative z-10">
            <h1 className="text-[42px] leading-[0.95] font-bold tracking-tight">Manajemen Aset Sekolah Jadi Lebih Mudah & Amanah</h1>
            <p className="mt-6 text-lg opacity-90 max-w-[480px]">Kelola seluruh aset, ruangan, dan pemeliharaan TK-SD-SMP Islam dalam satu dashboard yang indah dan mudah dipakai.</p>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-[460px]">
              {[
                {k:"500+", l:"Aset Terkelola"},
                {k:"15", l:"Ruangan"},
                {k:"24/7", l:"Pemantauan"},
              ].map(i=><div key={i.l} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10"><div className="text-2xl font-bold">{i.k}</div><div className="text-xs opacity-70">{i.l}</div></div>)}
            </div>
          </div>
          <div className="relative z-10 text-xs opacity-60">© {new Date().getFullYear()} Yaa Bunayya Islamic School - TK-SD-SMP Islam</div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[420px]">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <img src="/logo.svg" alt="logo" className="w-14 h-14 object-contain bg-white rounded-2xl p-1 shadow"/>
              <div><div className="font-bold text-[#FF2D00]">YAA BUNAYYA</div><div className="text-xs text-zinc-500">TK-SD-SMP ISLAM</div></div>
            </div>
            <div className="bg-white rounded-[28px] shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-zinc-100 p-8">
              <h2 className="text-[28px] font-bold tracking-tight">Masuk ke Dasbor</h2>
              <p className="text-sm text-zinc-500 mt-2">Gunakan akun demo untuk menjelajah aplikasi.</p>

              <form onSubmit={handleLogin} className="mt-8 space-y-4">
                <div><label className="text-xs font-semibold text-zinc-600">Username</label><input value={loginForm.username} onChange={e=>setLoginForm({...loginForm, username:e.target.value})} className="mt-1 w-full h-12 px-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF2D00]/20 focus:border-[#FF2D00] bg-zinc-50" placeholder="admin"/></div>
                <div><label className="text-xs font-semibold text-zinc-600">Password</label><input type="password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password:e.target.value})} className="mt-1 w-full h-12 px-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF2D00]/20 focus:border-[#FF2D00] bg-zinc-50" placeholder="••••••••"/></div>
                {loginError && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{loginError}</div>}
                 <button type="submit" disabled={loginBusy} className="w-full h-12 rounded-xl bg-[#FF2D00] text-white font-semibold hover:bg-[#E62600] transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {loginBusy ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : null}
                  Masuk
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-zinc-100">
                <div className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">Akun Demo</div>
                <div className="mt-3 grid gap-2">
                  {[
                    {u:"admin", p:"admin123", r:"Admin / Kepala Sarpras", c:"bg-[#FF2D00]"},
                    {u:"sarpras", p:"sarpras123", r:"Staff Sarpras", c:"bg-amber-500"},
                    {u:"teknisi", p:"teknisi123", r:"Teknisi", c:"bg-blue-500"},
                    {u:"guru", p:"guru123", r:"Guru", c:"bg-emerald-500"},
                  ].map(acc=>
                    <button key={acc.u} onClick={()=>setLoginForm({username:acc.u, password:acc.p})} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 text-left transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full grid place-items-center text-white text-xs font-bold ${acc.c}`}>{acc.u[0].toUpperCase()}</div>
                        <div><div className="text-sm font-semibold">{acc.u}</div><div className="text-xs text-zinc-500">{acc.r}</div></div>
                      </div>
                      <div className="text-[10px] px-2 py-1 rounded-full bg-zinc-100 font-mono">{acc.p}</div>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 text-center text-xs text-zinc-400">Data akan otomatis terisi dengan demo realistis saat pertama login.</div>
          </div>
        </div>
      </div>
    );
  }

  console.log("[APP] Rendering main app, user:", user?.username, "role:", user?.role);
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[300px] bg-white border-r border-zinc-100 shadow-[0_0_50px_rgba(0,0,0,0.04)] flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen? "translate-x-0":"-translate-x-full"}`}>
        <div className="h-[84px] px-6 flex items-center gap-3 border-b border-zinc-100">
          <img src="/logo.svg" alt="logo" className="w-12 h-12 object-contain bg-white rounded-xl shadow-sm border border-zinc-100 p-1"/>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[15px] leading-none text-[#FF2D00] brand-font">YAA BUNAYYA</div>
            <div className="text-[10px] tracking-widest font-bold text-zinc-500 mt-1">ISLAMIC SCHOOL</div>
            <div className="text-[10px] text-zinc-400">TK - SD - SMP ISLAM</div>
          </div>
          <button onClick={()=>setSidebarOpen(false)} className="lg:hidden w-8 h-8 rounded-full bg-zinc-100 grid place-items-center">✕</button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase px-3 mb-3">Menu Utama</div>
          <nav className="space-y-1.5">
            {getRoleNav(user?.role || "admin").map(item=>{
              const active = activeTab===item.k;
              return (
                <button key={item.k} onClick={()=>{setActiveTab(item.k as any); setSidebarOpen(false);}} className={`w-full text-left px-3 py-3 rounded-2xl border transition flex items-center gap-3 group ${active? "bg-[#FF2D00] text-white border-[#FF2D00] shadow-lg shadow-red-200" : "bg-white border-transparent hover:border-zinc-200 hover:bg-zinc-50 text-zinc-700"}`}>
                  <div className={`w-9 h-9 rounded-xl grid place-items-center text-sm font-bold ${active? "bg-white text-[#FF2D00]" : "bg-zinc-100 text-zinc-600 group-hover:bg-white"}`}>{item.icon}</div>
                  <div className="flex-1 min-w-0"><div className={`text-sm font-semibold leading-none truncate ${active? "text-white":""}`}>{item.l}</div><div className={`text-[11px] mt-1 truncate ${active? "text-white/70":"text-zinc-400"}`}>{item.desc}</div></div>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
            <div className="text-sm font-bold text-zinc-800">Butuh Bantuan?</div>
            <div className="text-xs text-zinc-500 mt-1">Hubungi tim Sarpras untuk dukungan teknis atau permintaan aset baru.</div>
            <div className="mt-3 flex gap-2">
              <div className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-amber-200 font-semibold">WA: 0812-3456-7890</div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-zinc-50 border border-zinc-100">
            <div className="w-10 h-10 rounded-full bg-[#FF2D00] text-white grid place-items-center font-bold">{user.nama.split(" ").map(s=>s[0]).slice(0,2).join("")}</div>
            <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{user.nama}</div><div className="text-[11px] text-zinc-500 truncate capitalize">{user.role.replace("_"," ")} • {user.jabatan}</div></div>
            <button onClick={handleLogout} className="w-8 h-8 rounded-full bg-white border border-zinc-200 grid place-items-center hover:bg-zinc-100" title="Keluar">↪</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-[300px] min-h-screen flex flex-col">
        <header className="h-[64px] lg:h-[84px] bg-white/80 backdrop-blur border-b border-zinc-100 sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-zinc-900 text-white grid place-items-center">☰</button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg lg:text-xl font-bold brand-font">
                    {getHeaderTitle(user?.role || "admin", activeTab)}
                  </h1>
                  {seeding && <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 animate-pulse">Menyiapkan data demo...</span>}
                </div>
                <div className="text-xs text-zinc-500 hidden lg:block">
                  {getHeaderDesc(user?.role || "admin", activeTab, stats, filteredAset)}
                </div>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-full"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> Sistem Aktif</div>
            <div className="w-10 h-10 rounded-xl bg-zinc-100 grid place-items-center">🔔</div>
          </div>
        </header>

        <div className="p-4 lg:p-8 flex-1">
          {loadingData && !stats ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i=><div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-zinc-100"/>)}
              </div>
              <div className="h-96 bg-white rounded-2xl animate-pulse border border-zinc-100"/>
            </div>
          ):(
            <>
              {activeTab==="dashboard" && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(user?.role==="teknisi"?[
                      {l:"Total WO Saya", v:stats?.cards.totalPemeliharaan||0, sub:"Semua work order", icon:"🔧", color:"bg-blue-600", trend:"Ditugaskan"},
                      {l:"Mendesak", v:stats?.cards.perluPerbaikan||0, sub:"Perlu tindakan segera", icon:"🚨", color:"bg-red-600", trend:"Prioritas tinggi"},
                      {l:"Sedang Dikerjakan", v:stats?.cards.pemeliharaanAktif||0, sub:"Belum selesai", icon:"⚙️", color:"bg-orange-500", trend:"Aktif"},
                      {l:"Selesai", v:mtnList.filter((m:any)=>m.status==="Selesai" && m.teknisiId===user?.id).length, sub:"Selesai dikerjakan", icon:"✅", color:"bg-emerald-600", trend:"Tuntas"},
                    ]:user?.role==="guru"?[
                      {l:"Laporan Saya", v:stats?.cards.totalPemeliharaan||0, sub:"Semua laporan", icon:"📝", color:"bg-blue-600", trend:"Diajukan"},
                      {l:"Menunggu", v:mtnList.filter((m:any)=>m.pelapor===user?.nama && m.status==="Diajukan").length, sub:"Belum diproses", icon:"⏳", color:"bg-amber-500", trend:"Pending"},
                      {l:"Disetujui/Dikerjakan", v:stats?.cards.pemeliharaanAktif||0, sub:"Sedang ditangani", icon:"🔧", color:"bg-orange-500", trend:"Proses"},
                      {l:"Selesai", v:mtnList.filter((m:any)=>m.pelapor===user?.nama && m.status==="Selesai").length, sub:"Selesai diperbaiki", icon:"✅", color:"bg-emerald-600", trend:"Tuntas"},
                    ]:[
                      {l:"Total Aset", v:stats?.cards.totalAset||0, sub:"Aktif di 15 ruangan", icon:"📦", color:"bg-[#FF2D00]", trend:"+12% bulan ini"},
                      {l:"Perlu Perbaikan", v:stats?.cards.perluPerbaikan||0, sub:"Prioritas tinggi", icon:"⚠️", color:"bg-amber-500", trend:"Butuh tindakan"},
                      {l:"Work Order Aktif", v:stats?.cards.pemeliharaanAktif||0, sub:`${stats?.cards.totalPemeliharaan||0} total laporan`, icon:"🔧", color:"bg-blue-600", trend:"3 mendesak"},
                      {l:"Biaya Bulan Ini", v:`Rp ${(Number(stats?.cards.biayaBulanan||0)/1000000).toFixed(1)}jt`, sub:"Pemeliharaan selesai", icon:"💰", color:"bg-emerald-600", trend:"-8% vs bulan lalu"},
                    ]).map(c=>
                      <div key={c.l} className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-zinc-50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition"/>
                        <div className="relative flex justify-between items-start">
                          <div className={`w-10 h-10 rounded-xl ${c.color} text-white grid place-items-center`}>{c.icon}</div>
                          <div className="text-[11px] px-2 py-1 rounded-full bg-zinc-50 border border-zinc-100">{c.trend}</div>
                        </div>
                        <div className="mt-4"><div className="text-3xl font-bold brand-font">{c.v}</div><div className="text-sm font-medium text-zinc-900 mt-1">{c.l}</div><div className="text-xs text-zinc-500 mt-1">{c.sub}</div></div>
                      </div>
                    )}
                  </div>

                  {(user?.role==="teknisi" || user?.role==="guru") ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white rounded-[20px] border border-zinc-100 p-6">
                        <h3 className="font-bold mb-4">{user?.role==="teknisi" ? "Work Order Saya" : "Laporan Saya"}</h3>
                        <div className="space-y-2">
                          {(stats?.recent.pemeliharaan||[]).map((m:any)=>(
                            <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 grid place-items-center text-sm">🔧</div>
                                <div>
                                  <div className="text-sm font-semibold">{m.judul}</div>
                                  <div className="text-[11px] text-zinc-500">{m.kode} • {m.pelapor} • {new Date(m.tanggalLapor||m.tanggal_lapor).toLocaleDateString("id-ID")}</div>
                                </div>
                              </div>
                              <Badge tone={statusMtnTone(m.status)}>{m.status}</Badge>
                            </div>
                          ))}
                          {(!stats?.recent.pemeliharaan || stats.recent.pemeliharaan.length===0) && <div className="text-sm text-zinc-500 py-6 text-center">Belum ada laporan</div>}
                        </div>
                      </div>
                      <div className="bg-white rounded-[20px] border border-zinc-100 p-6">
                        <h3 className="font-bold mb-4">Status</h3>
                        <div className="space-y-2.5">
                          {(stats?.charts.byStatusPemeliharaan||[]).map((r:any)=>(
                            <div key={r.status} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                              <div className="flex items-center gap-2"><Badge tone={statusMtnTone(r.status)}>{r.status}</Badge></div>
                              <div className="text-sm font-bold">{r.jumlah}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white rounded-[20px] border border-zinc-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-bold">Kondisi Aset</h3>
                          <div className="text-xs text-zinc-500">Total {stats?.cards.totalAset} aset</div>
                        </div>
                        <div className="space-y-3">
                          {(stats?.charts.byKondisi||[]).map((row:any)=>{
                            const total = stats?.cards.totalAset||1;
                            const pct = Math.round((Number(row.jumlah)/total)*100);
                            return (
                              <div key={row.kondisi} className="flex items-center gap-4">
                                <div className="w-28 text-xs font-medium">{row.kondisi}</div>
                                <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${row.kondisi==="Baik"?"bg-emerald-500":row.kondisi==="Perlu Perbaikan"?"bg-amber-400":"bg-red-500"}`} style={{width:`${pct}%`}}/></div>
                                <div className="w-10 text-xs font-bold text-right">{pct}%</div>
                                <div className="w-8 text-xs text-zinc-500 text-right">{row.jumlah}</div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-8">
                          <h4 className="font-bold text-sm mb-4">Aset per Kategori</h4>
                          <div className="flex flex-wrap gap-2">
                            {(stats?.charts.byKategori||[]).map((r:any)=>(
                              <div key={r.kategori} className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-100 text-xs">
                                <span className="font-bold">{r.kategori}</span> <span className="text-zinc-500 ml-2">{r.jumlah} aset</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white rounded-[20px] border border-zinc-100 p-6">
                          <h3 className="font-bold mb-4">Status Pemeliharaan</h3>
                          <div className="space-y-2.5">
                            {(stats?.charts.byStatusPemeliharaan||[]).map((r:any)=>(
                              <div key={r.status} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                                <div className="flex items-center gap-2"><Badge tone={statusMtnTone(r.status)}>{r.status}</Badge></div>
                                <div className="text-sm font-bold">{r.jumlah}</div>
                              </div>
                            ))}
                          </div>
                          <button onClick={()=>setActiveTab("pemeliharaan")} className="mt-4 w-full h-10 rounded-xl bg-zinc-900 text-white text-sm font-semibold">Lihat Semua Laporan</button>
                        </div>

                        <div className="bg-[#1A1A1A] rounded-[20px] p-6 text-white relative overflow-hidden">
                          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#FF2D00] rounded-full opacity-20"/>
                          <h3 className="font-bold relative">Jadwal Mendatang</h3>
                          <div className="mt-4 space-y-3 relative">
                            {jadwalList.slice(0,3).map(j=>{
                              const isSoon = new Date(j.tanggalSelanjutnya).getTime() - _now < 7*24*3600*1000;
                              return <div key={j.id} className="flex gap-3"><div className={`w-10 h-10 rounded-xl grid place-items-center text-xs font-bold ${isSoon?"bg-[#FF2D00]":"bg-zinc-800"}`}>{new Date(j.tanggalSelanjutnya).getDate()}</div><div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{j.judul}</div><div className="text-xs text-zinc-400 truncate">{new Date(j.tanggalSelanjutnya).toLocaleDateString("id-ID",{day:"numeric", month:"short"})} • {j.penanggungJawab}</div></div></div>;
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {(user?.role==="teknisi") ? (
                      <>
                        <div className="bg-white rounded-[20px] border border-zinc-100 p-6">
                          <div className="flex items-center justify-between mb-4"><h3 className="font-bold">Aset yang Saya Tangani</h3><button onClick={()=>setActiveTab("aset")} className="text-xs text-[#FF2D00] font-semibold">Lihat semua →</button></div>
                          <div className="space-y-3">
                            {(stats?.recent.asetRusak||[]).map((a:any)=><div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50"><div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 grid place-items-center">⚠️</div><div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{a.nama}</div><div className="text-xs text-zinc-500 truncate">{a.kode_aset||a.kodeAset} • {a.kondisi}</div></div><Badge tone={kondisiTone(a.kondisi)}>{a.kondisi}</Badge></div>)}
                            {(!stats?.recent.asetRusak || stats.recent.asetRusak.length===0) && <div className="text-sm text-zinc-500 py-8 text-center">Tidak ada aset dalam perbaikan 🎉</div>}
                          </div>
                        </div>
                        <div className="bg-white rounded-[20px] border border-zinc-100 p-6">
                          <div className="flex items-center justify-between mb-4"><h3 className="font-bold">Work Order Saya</h3><button onClick={()=>setActiveTab("pemeliharaan")} className="text-xs text-[#FF2D00] font-semibold">Kelola →</button></div>
                          <div className="space-y-3">
                            {(stats?.recent.pemeliharaan||[]).map((m:any)=><div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50"><div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">🔧</div><div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{m.judul}</div><div className="text-xs text-zinc-500 truncate">{m.kode} • {m.pelapor} • {new Date(m.tanggalLapor||m.tanggal_lapor).toLocaleDateString("id-ID")}</div></div><Badge tone={statusMtnTone(m.status)}>{m.status}</Badge></div>)}
                          </div>
                        </div>
                      </>
                    ) : user?.role==="guru" ? (
                      <div className="lg:col-span-2 bg-white rounded-[20px] border border-zinc-100 p-6">
                        <div className="flex items-center justify-between mb-4"><h3 className="font-bold">Laporan Saya</h3><button onClick={()=>setActiveTab("pemeliharaan")} className="text-xs text-[#FF2D00] font-semibold">Buat Laporan Baru →</button></div>
                        <div className="space-y-3">
                          {(stats?.recent.pemeliharaan||[]).map((m:any)=><div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50"><div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">📝</div><div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{m.judul}</div><div className="text-xs text-zinc-500 truncate">{m.kode} • {new Date(m.tanggalLapor||m.tanggal_lapor).toLocaleDateString("id-ID")}</div></div><Badge tone={statusMtnTone(m.status)}>{m.status}</Badge></div>)}
                          {(!stats?.recent.pemeliharaan || stats.recent.pemeliharaan.length===0) && <div className="text-sm text-zinc-500 py-8 text-center">Belum ada laporan. Buat laporan pertama Anda!</div>}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-white rounded-[20px] border border-zinc-100 p-6">
                          <div className="flex items-center justify-between mb-4"><h3 className="font-bold">Aset Perlu Perhatian</h3><button onClick={()=>setActiveTab("aset")} className="text-xs text-[#FF2D00] font-semibold">Lihat semua →</button></div>
                          <div className="space-y-3">
                            {(stats?.recent.asetRusak||[]).map((a:any)=><div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50"><div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 grid place-items-center">⚠️</div><div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{a.nama}</div><div className="text-xs text-zinc-500 truncate">{a.kode_aset||a.kodeAset} • {a.kondisi}</div></div><Badge tone={kondisiTone(a.kondisi)}>{a.kondisi}</Badge></div>)}
                            {(!stats?.recent.asetRusak || stats.recent.asetRusak.length===0) && <div className="text-sm text-zinc-500 py-8 text-center">Semua aset dalam kondisi baik 🎉</div>}
                          </div>
                        </div>

                        <div className="bg-white rounded-[20px] border border-zinc-100 p-6">
                          <div className="flex items-center justify-between mb-4"><h3 className="font-bold">Laporan Terbaru</h3><button onClick={()=>setActiveTab("pemeliharaan")} className="text-xs text-[#FF2D00] font-semibold">Kelola →</button></div>
                          <div className="space-y-3">
                            {(stats?.recent.pemeliharaan||[]).map((m:any)=><div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50"><div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">🔧</div><div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{m.judul}</div><div className="text-xs text-zinc-500 truncate">{m.kode} • {m.pelapor} • {new Date(m.tanggalLapor||m.tanggal_lapor).toLocaleDateString("id-ID")}</div></div><Badge tone={statusMtnTone(m.status)}>{m.status}</Badge></div>)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab==="aset" && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-zinc-100 p-4 flex flex-col lg:flex-row gap-3 items-center justify-between">
                    <div className="flex flex-1 gap-2 w-full">
                      <div className="flex-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span><input value={qAset} onChange={e=>setQAset(e.target.value)} placeholder="Cari nama aset, kode, merk..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:bg-white focus:border-[#FF2D00]"/></div>
                      <select value={fKategori} onChange={e=>setFKategori(e.target.value)} className="h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm"><option value="">Semua Kategori</option>{KATEGORI.map(k=><option key={k} value={k}>{k}</option>)}</select>
                      <select value={fKondisi} onChange={e=>setFKondisi(e.target.value)} className="h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm"><option value="">Semua Kondisi</option>{KONDISI.map(k=><option key={k} value={k}>{k}</option>)}</select>
                    </div>
                      <div className="flex gap-2 w-full lg:w-auto">
                        <div className="flex rounded-xl border border-zinc-200 overflow-hidden"><button onClick={()=>setViewMode("grid")} className={`px-3 h-11 text-sm ${viewMode==="grid"?"bg-zinc-900 text-white":"bg-white"}`}>⊞</button><button onClick={()=>setViewMode("table")} className={`px-3 h-11 text-sm ${viewMode==="table"?"bg-zinc-900 text-white":"bg-white"}`}>☰</button></div>
                        {canCreate(user?.role||"admin","aset") && <button onClick={openAddAset} className="flex-1 lg:flex-none h-11 px-5 rounded-xl bg-[#FF2D00] text-white font-semibold text-sm">+ Tambah Aset</button>}
                      </div>
                  </div>

                  {filteredAset.length===0 ? (
                    <div className="bg-white rounded-[24px] border border-dashed border-zinc-200 p-16 text-center"><div className="w-16 h-16 mx-auto bg-zinc-50 rounded-2xl grid place-items-center text-2xl">📭</div><div className="mt-4 font-bold">Tidak ada aset ditemukan</div><div className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">Coba ubah filter pencarian atau tambah aset baru untuk mulai mengelola inventaris sekolah.</div>{canCreate(user?.role||"admin","aset") && <button onClick={openAddAset} className="mt-6 h-10 px-5 rounded-xl bg-zinc-900 text-white text-sm font-semibold">Tambah Aset Pertama</button>}</div>
                  ): viewMode==="grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAset.map(a=>{
                        const ruang = a.ruanganId ? ruanganById[a.ruanganId] : null;
                        return (
                          <div key={a.id} className="bg-white rounded-[20px] border border-zinc-100 p-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition group">
                            <div className="flex justify-between items-start"><div className="flex gap-3"><div className="w-12 h-12 rounded-xl bg-[#FFF1E6] border border-orange-100 grid place-items-center text-lg">{a.kategori==="Elektronik"?"💻":a.kategori==="Furniture"?"🪑":a.kategori==="Laboratorium"?"🧪":a.kategori==="Ibadah"?"🕌":"📦"}</div><div><div className="text-[11px] font-mono text-zinc-500">{a.kodeAset}</div><div className="font-bold text-[15px] leading-tight mt-1 line-clamp-2">{a.nama}</div></div></div><Badge tone={kondisiTone(a.kondisi)}>{a.kondisi}</Badge></div>
                            <div className="mt-4 space-y-2 text-xs text-zinc-600">
                              <div className="flex justify-between"><span className="text-zinc-400">Lokasi</span><span className="font-medium">{ruang ? `${ruang.nama}` : "Gudang"}</span></div>
                              <div className="flex justify-between"><span className="text-zinc-400">Kategori</span><span className="font-medium">{a.kategori}</span></div>
                              <div className="flex justify-between"><span className="text-zinc-400">PJ</span><span className="font-medium truncate max-w-[120px]">{a.penanggungJawab||"-"}</span></div>
                              {a.harga && Number(a.harga)>0 && <div className="flex justify-between"><span className="text-zinc-400">Nilai</span><span className="font-bold">Rp {Number(a.harga).toLocaleString("id-ID")}</span></div>}
                            </div>
                              <div className="mt-5 flex gap-2">
                                {canEdit(user?.role||"admin","aset") && <button onClick={()=>openEditAset(a)} className="flex-1 h-9 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-black">Edit</button>}
                                {canDelete(user?.role||"admin") && <button onClick={()=>deleteAset(a.id)} className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200 grid place-items-center hover:bg-red-50 hover:border-red-200 hover:text-red-600">🗑️</button>}
                              </div>
                          </div>
                        );
                      })}
                    </div>
                  ):(
                    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-zinc-50 text-[11px] tracking-widest uppercase text-zinc-500"><tr><th className="text-left px-4 py-3 font-semibold">Aset</th><th className="text-left px-4 py-3 font-semibold">Lokasi</th><th className="text-left px-4 py-3 font-semibold">Kondisi</th><th className="text-left px-4 py-3 font-semibold">Status</th><th className="text-right px-4 py-3 font-semibold">Aksi</th></tr></thead>
                          <tbody>{filteredAset.map(a=><tr key={a.id} className="border-t border-zinc-100 hover:bg-zinc-50"><td className="px-4 py-3"><div className="font-semibold">{a.nama}</div><div className="text-xs text-zinc-500 font-mono">{a.kodeAset} • {a.kategori}</div></td><td className="px-4 py-3 text-xs">{a.ruanganId? ruanganById[a.ruanganId]?.nama : "-"} </td><td className="px-4 py-3"><Badge tone={kondisiTone(a.kondisi)}>{a.kondisi}</Badge></td><td className="px-4 py-3"><Badge>{a.status}</Badge></td><td className="px-4 py-3 text-right flex justify-end gap-1">{canEdit(user?.role||"admin","aset") && <button onClick={()=>openEditAset(a)} className="px-3 py-1 rounded-full bg-zinc-900 text-white text-xs">Edit</button>}{canDelete(user?.role||"admin") && <button onClick={()=>deleteAset(a.id)} className="px-2 py-1 rounded-full bg-zinc-100 text-xs">Hapus</button>}</td></tr>)}</tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab==="ruangan" && (
                <div className="space-y-4">
                  <div className="flex flex-col lg:flex-row gap-3 justify-between">
                    <div className="flex-1 relative max-w-lg"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span><input value={qRuangan} onChange={e=>setQRuangan(e.target.value)} placeholder="Cari ruangan, kode, gedung..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-zinc-200"/></div>
                    {canCreate(user?.role||"admin","ruangan") && <button onClick={openAddRuangan} className="h-11 px-5 rounded-xl bg-[#FF2D00] text-white font-semibold text-sm">+ Tambah Ruangan</button>}
                  </div>

                  {filteredRuangan.length===0 ? <div className="bg-white rounded-2xl border border-dashed p-12 text-center text-zinc-500">Belum ada ruangan. Tambahkan gedung dan kelas.</div> :
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRuangan.map(r=>{
                      const asetDiRuangan = asetList.filter(a=>a.ruanganId===r.id).length;
                      return (
                        <div key={r.id} className="bg-white rounded-[20px] border border-zinc-100 p-5">
                          <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">🏫</div>
                            <Badge tone={r.status==="Aktif"?"green":"gray"}>{r.status}</Badge>
                          </div>
                          <div className="mt-4"><div className="font-bold">{r.nama}</div><div className="text-xs text-zinc-500 font-mono">{r.kode} • {r.gedung} Lantai {r.lantai}</div></div>
                          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 rounded-xl bg-zinc-50"><div className="text-sm font-bold">{r.kapasitas||0}</div><div className="text-[10px] text-zinc-500">Kapasitas</div></div>
                            <div className="p-2 rounded-xl bg-zinc-50"><div className="text-sm font-bold">{asetDiRuangan}</div><div className="text-[10px] text-zinc-500">Aset</div></div>
                            <div className="p-2 rounded-xl bg-zinc-50"><div className="text-sm font-bold">{r.tipe}</div><div className="text-[10px] text-zinc-500">Tipe</div></div>
                          </div>
                          <div className="mt-3 text-xs text-zinc-500">PJ: {r.penanggungJawab||"-"}</div>
                          <div className="mt-4 flex gap-2">{canEdit(user?.role||"admin","ruangan") && <button onClick={()=>openEditRuangan(r)} className="flex-1 h-9 rounded-xl bg-zinc-900 text-white text-xs font-semibold">Edit</button>}{canDelete(user?.role||"admin") && <button onClick={()=>deleteRuangan(r.id)} className="w-9 h-9 rounded-xl bg-zinc-50 border grid place-items-center">🗑️</button>}</div>
                        </div>
                      );
                    })}
                  </div>
                  }
                </div>
              )}

              {activeTab==="pemeliharaan" && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-zinc-100 p-4 flex flex-col lg:flex-row gap-3 justify-between">
                    <div className="flex flex-1 gap-2">
                      <div className="flex-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span><input value={qMtn} onChange={e=>setQMtn(e.target.value)} placeholder="Cari judul, kode, pelapor..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-50 border border-zinc-200"/></div>
                      <select value={fStatusMtn} onChange={e=>setFStatusMtn(e.target.value)} className="h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm"><option value="">Semua Status</option>{STATUS_MTN.map(s=><option key={s} value={s}>{s}</option>)}</select>
                     </div>
                     {canCreate(user?.role||"admin","pemeliharaan") && <button onClick={openAddMtn} className="h-11 px-5 rounded-xl bg-[#FF2D00] text-white font-semibold text-sm">+ Buat Laporan</button>}
                   </div>

                  {filteredMtn.length===0 ? (
                    <div className="bg-white rounded-2xl border border-dashed p-12 text-center"><div className="text-3xl">🔧</div><div className="font-bold mt-3">Belum ada laporan pemeliharaan</div><div className="text-sm text-zinc-500 mt-1">Laporan kerusakan dari guru dan staff akan muncul di sini.</div></div>
                  ):(
                    <>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      {["Diajukan","Disetujui","Dikerjakan","Selesai"].map(status=>{
                        const items = filteredMtn.filter(m=>m.status===status);
                        return (
                          <div key={status} className="bg-zinc-50 rounded-2xl border border-zinc-100 p-3">
                            <div className="flex items-center justify-between px-1 pb-3"><div className="flex items-center gap-2"><Badge tone={statusMtnTone(status)}>{status}</Badge><span className="text-xs font-bold">{items.length}</span></div></div>
                            <div className="space-y-2">
                              {items.map(m=>{
                                const ast = m.asetId? asetById[m.asetId]:null;
                                return (
                                  <div key={m.id} className="bg-white rounded-xl border border-zinc-100 p-3 hover:shadow-sm transition cursor-pointer" onClick={()=>openEditMtn(m)}>
                                    <div className="flex justify-between items-start gap-2"><div className="text-xs font-mono text-zinc-500">{m.kode}</div><Badge tone={prioritasTone(m.prioritas)}>{m.prioritas}</Badge></div>
                                    <div className="font-semibold text-sm mt-1 leading-tight line-clamp-2">{m.judul}</div>
                                    {ast && <div className="text-[11px] text-zinc-500 mt-1 truncate">📦 {ast.nama}</div>}
                                    <div className="text-[11px] text-zinc-500 mt-1">👤 {m.pelapor}</div>
                                    <div className="flex justify-between items-center mt-2"><div className="text-[11px] text-zinc-400">{new Date(m.tanggalLapor).toLocaleDateString("id-ID",{day:"2-digit", month:"short"})}</div><div className="text-[11px] font-semibold">{m.biaya && Number(m.biaya)>0 ? `Rp ${Number(m.biaya).toLocaleString("id-ID")}`:""}</div></div>
                                  </div>
                                );
                              })}
                              {items.length===0 && <div className="text-xs text-zinc-400 text-center py-6">Kosong</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                      <div className="p-4 font-bold border-b border-zinc-100">Daftar Lengkap</div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm"><thead className="bg-zinc-50 text-[11px] uppercase tracking-widest text-zinc-500"><tr><th className="text-left px-4 py-3">Laporan</th><th className="text-left px-4 py-3">Aset</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Teknisi</th><th className="text-right px-4 py-3">Aksi</th></tr></thead><tbody>{filteredMtn.map(m=><tr key={m.id} className="border-t border-zinc-100 hover:bg-zinc-50"><td className="px-4 py-3"><div className="font-semibold">{m.judul}</div><div className="text-xs text-zinc-500">{m.kode} • {m.jenis} • {m.prioritas}</div></td><td className="px-4 py-3 text-xs">{m.asetId? asetById[m.asetId]?.nama : "-"}</td><td className="px-4 py-3"><Badge tone={statusMtnTone(m.status)}>{m.status}</Badge></td><td className="px-4 py-3 text-xs">{m.teknisiId? usersList.find(u=>u.id===m.teknisiId)?.nama : "-"}</td><td className="px-4 py-3 text-right">{canEdit(user?.role||"admin","pemeliharaan") && <button onClick={()=>openEditMtn(m)} className="text-xs px-3 py-1 rounded-full bg-zinc-900 text-white">Kelola</button>} {canDelete(user?.role||"admin") && <button onClick={()=>deleteMtn(m.id)} className="text-xs px-2 py-1 rounded-full bg-zinc-100">Hapus</button>}</td></tr>)}</tbody></table>
                      </div>
                    </div>
                    </>
                  )}
                </div>
              )}

              {activeTab==="jadwal" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div><h2 className="font-bold text-lg">Jadwal Pemeliharaan Preventif</h2><p className="text-xs text-zinc-500">Jadwal rutin agar aset tetap prima dan tahan lama</p></div>
                    {canCreate(user?.role||"admin","jadwal") && <button onClick={openAddJadwal} className="h-11 px-5 rounded-xl bg-[#FF2D00] text-white font-semibold text-sm">+ Tambah Jadwal</button>}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {jadwalList.length===0 ? <div className="col-span-3 bg-white rounded-2xl border border-dashed p-12 text-center text-zinc-500">Belum ada jadwal rutin</div> :
                    jadwalList.map(j=>{
                      const ast = j.asetId? asetById[j.asetId]:null;
                      const daysLeft = Math.ceil((new Date(j.tanggalSelanjutnya).getTime() - _now)/ (24*3600*1000));
                      const urgent = daysLeft<=3;
                      return (
                        <div key={j.id} className={`bg-white rounded-[20px] border p-5 ${urgent? "border-red-200 bg-red-50/30":"border-zinc-100"}`}>
                          <div className="flex justify-between items-start"><Badge tone={urgent?"red":daysLeft<=7?"yellow":"gray"}>{urgent? `Segera • ${daysLeft} hari` : `${daysLeft} hari lagi`}</Badge><div className="text-[11px] px-2 py-1 rounded-full bg-zinc-100">{j.frekuensi}</div></div>
                          <div className="mt-3 font-bold">{j.judul}</div>
                          {ast && <div className="text-xs text-zinc-500 mt-1">📦 {ast.nama} • {ast.kodeAset}</div>}
                          <div className="text-xs text-zinc-500 mt-1">📅 {new Date(j.tanggalSelanjutnya).toLocaleDateString("id-ID",{weekday:"long", day:"numeric", month:"long", year:"numeric"})}</div>
                          <div className="text-xs text-zinc-500 mt-1">👤 {j.penanggungJawab||"-"}</div>
                          {j.deskripsi && <div className="text-xs text-zinc-600 mt-3 p-2 bg-zinc-50 rounded-xl border border-zinc-100">{j.deskripsi}</div>}
                          <div className="mt-4 flex gap-2">{canEdit(user?.role||"admin","jadwal") && <button onClick={()=>openEditJadwal(j)} className="flex-1 h-8 rounded-xl bg-zinc-900 text-white text-xs font-semibold">Edit</button>}{canDelete(user?.role||"admin") && <button onClick={()=>deleteJadwal(j.id)} className="w-8 h-8 rounded-xl bg-zinc-50 border grid place-items-center text-xs">🗑️</button>}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab==="laporan" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-[20px] border border-zinc-100 p-6">
                    <h3 className="font-bold text-lg">Ringkasan Biaya Pemeliharaan</h3>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100"><div className="text-xs text-zinc-500">Total Biaya Selesai</div><div className="text-2xl font-bold mt-1">Rp {mtnList.filter(m=>m.status==="Selesai").reduce((s,m)=>s+Number(m.biaya||0),0).toLocaleString("id-ID")}</div><div className="text-xs text-zinc-500 mt-1">{mtnList.filter(m=>m.status==="Selesai").length} pekerjaan selesai</div></div>
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100"><div className="text-xs text-amber-700">Estimasi Biaya Aktif</div><div className="text-2xl font-bold mt-1 text-amber-700">Rp {mtnList.filter(m=>["Diajukan","Disetujui","Dikerjakan"].includes(m.status)).reduce((s,m)=>s+Number(m.biaya||0),0).toLocaleString("id-ID")}</div><div className="text-xs text-amber-700/70 mt-1">Menunggu persetujuan / pengerjaan</div></div>
                      <div className="p-4 rounded-2xl bg-[#FFF1E6] border border-orange-100"><div className="text-xs text-zinc-500">Rata-rata per Laporan</div><div className="text-2xl font-bold mt-1">Rp {mtnList.length? Math.round(mtnList.reduce((s,m)=>s+Number(m.biaya||0),0)/mtnList.length).toLocaleString("id-ID"):"0"}</div><div className="text-xs text-zinc-500 mt-1">Dari {mtnList.length} total laporan</div></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[20px] border border-zinc-100 p-6">
                      <h4 className="font-bold">Aset Bermasalah Terbanyak</h4>
                      <div className="mt-4 space-y-2">
                        {Object.entries(mtnList.reduce((acc:any,m:any)=>{ if(!m.asetId) return acc; acc[m.asetId]=(acc[m.asetId]||0)+1; return acc; },{} as any)).sort((a:any,b:any)=>b[1]-a[1]).slice(0,5).map(([asetId,count]:any)=>{
                          const a = asetById[Number(asetId)];
                          if(!a) return null;
                          return <div key={asetId} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white border grid place-items-center text-xs">📦</div><div><div className="text-sm font-semibold">{a.nama}</div><div className="text-xs text-zinc-500">{a.kodeAset}</div></div></div><div className="text-sm font-bold">{count}x laporan</div></div>;
                        })}
                      </div>
                    </div>
                    <div className="bg-white rounded-[20px] border border-zinc-100 p-6">
                      <h4 className="font-bold">Performa Teknisi</h4>
                      <div className="mt-4 space-y-2">
                        {usersList.filter(u=>u.role==="teknisi").map(t=>{
                          const done = mtnList.filter(m=>m.teknisiId===t.id && m.status==="Selesai").length;
                          const active = mtnList.filter(m=>m.teknisiId===t.id && ["Dikerjakan","Disetujui"].includes(m.status)).length;
                          return <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-600 text-white grid place-items-center text-xs font-bold">{t.nama[0]}</div><div><div className="text-sm font-semibold">{t.nama}</div><div className="text-xs text-zinc-500">{t.jabatan}</div></div></div><div className="text-right"><div className="text-sm font-bold">{done} selesai</div><div className="text-xs text-zinc-500">{active} aktif</div></div></div>;
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] rounded-[20px] p-6 text-white flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div><div className="font-bold text-lg">Siap Cetak Laporan Sarpras Bulanan</div><div className="text-sm text-zinc-400 mt-1">Rekap aset, biaya, dan jadwal untuk laporan ke Yayasan</div></div>
                    <button onClick={()=>window.print()} className="h-11 px-6 rounded-xl bg-white text-black font-semibold text-sm">🖨️ Cetak Laporan</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {showAsetModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-t-[28px] lg:rounded-[24px] max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-zinc-100 flex justify-between items-center">
              <div><div className="font-bold text-lg">{editingAset? "Edit Aset":"Tambah Aset Baru"}</div><div className="text-xs text-zinc-500">Lengkapi data aset dengan teliti untuk inventaris yang akurat</div></div>
              <button onClick={()=>setShowAsetModal(false)} className="w-9 h-9 rounded-full bg-zinc-100 grid place-items-center">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold">Kode Aset</label><input value={asetForm.kodeAset||""} onChange={e=>setAsetForm({...asetForm, kodeAset:e.target.value})} placeholder="Otomatis jika kosong" className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
                <div><label className="text-xs font-semibold">Kategori*</label><select value={asetForm.kategori||""} onChange={e=>setAsetForm({...asetForm, kategori:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50">{KATEGORI.map(k=><option key={k} value={k}>{k}</option>)}</select></div>
              </div>
              <div><label className="text-xs font-semibold">Nama Aset*</label><input value={asetForm.nama||""} onChange={e=>setAsetForm({...asetForm, nama:e.target.value})} placeholder="Contoh: AC Daikin 1 PK Ruang Kelas 5A" className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold">Ruangan / Lokasi</label><select value={asetForm.ruanganId||""} onChange={e=>setAsetForm({...asetForm, ruanganId:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"><option value="">Pilih Ruangan</option>{ruanganList.map(r=><option key={r.id} value={r.id}>{r.nama} - {r.gedung}</option>)}</select></div>
                <div><label className="text-xs font-semibold">Merk</label><input value={asetForm.merk||""} onChange={e=>setAsetForm({...asetForm, merk:e.target.value})} placeholder="Daikin, Epson, dll" className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-semibold">Kondisi</label><select value={asetForm.kondisi||"Baik"} onChange={e=>setAsetForm({...asetForm, kondisi:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50">{KONDISI.map(k=><option key={k} value={k}>{k}</option>)}</select></div>
                <div><label className="text-xs font-semibold">Status</label><select value={asetForm.status||"Aktif"} onChange={e=>setAsetForm({...asetForm, status:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50">{STATUS_ASET.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="text-xs font-semibold">Tahun</label><input type="number" value={asetForm.tahun||""} onChange={e=>setAsetForm({...asetForm, tahun:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold">Tanggal Perolehan</label><input type="date" value={asetForm.tanggalPerolehan||""} onChange={e=>setAsetForm({...asetForm, tanggalPerolehan:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
                <div><label className="text-xs font-semibold">Nilai / Harga (Rp)</label><input type="number" value={asetForm.harga||""} onChange={e=>setAsetForm({...asetForm, harga:e.target.value})} placeholder="4500000" className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              </div>
              <div><label className="text-xs font-semibold">Penanggung Jawab</label><input value={asetForm.penanggungJawab||""} onChange={e=>setAsetForm({...asetForm, penanggungJawab:e.target.value})} placeholder="Nama guru atau staff" className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              <div><label className="text-xs font-semibold">Deskripsi / Catatan</label><textarea value={asetForm.deskripsi||""} onChange={e=>setAsetForm({...asetForm, deskripsi:e.target.value})} rows={3} placeholder="Kondisi detail, riwayat service, dll" className="mt-1 w-full px-3 py-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
            </div>
            <div className="p-6 border-t border-zinc-100 flex gap-3">
              <button onClick={()=>setShowAsetModal(false)} className="flex-1 h-11 rounded-xl bg-zinc-100 font-semibold text-sm">Batal</button>
              <button onClick={saveAset} className="flex-1 h-11 rounded-xl bg-[#FF2D00] text-white font-semibold text-sm">{editingAset? "Simpan Perubahan":"Tambah Aset"}</button>
            </div>
          </div>
        </div>
      )}

      {showRuanganModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-t-[28px] lg:rounded-[24px] max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center"><div className="font-bold text-lg">{editingRuangan? "Edit Ruangan":"Tambah Ruangan"}</div><button onClick={()=>setShowRuanganModal(false)} className="w-9 h-9 rounded-full bg-zinc-100 grid place-items-center">✕</button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold">Kode</label><input value={ruanganForm.kode||""} onChange={e=>setRuanganForm({...ruanganForm, kode:e.target.value})} placeholder="SD-03" className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
                <div><label className="text-xs font-semibold">Tipe</label><select value={ruanganForm.tipe||"Kelas"} onChange={e=>setRuanganForm({...ruanganForm, tipe:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50">{TIPE_RUANGAN.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div><label className="text-xs font-semibold">Nama Ruangan*</label><input value={ruanganForm.nama||""} onChange={e=>setRuanganForm({...ruanganForm, nama:e.target.value})} placeholder="Kelas 5A - Utsman" className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold">Gedung</label><select value={ruanganForm.gedung||""} onChange={e=>setRuanganForm({...ruanganForm, gedung:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50">{GEDUNG.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
                <div><label className="text-xs font-semibold">Lantai</label><input type="number" value={ruanganForm.lantai||1} onChange={e=>setRuanganForm({...ruanganForm, lantai:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold">Kapasitas</label><input type="number" value={ruanganForm.kapasitas||""} onChange={e=>setRuanganForm({...ruanganForm, kapasitas:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
                <div><label className="text-xs font-semibold">Status</label><select value={ruanganForm.status||"Aktif"} onChange={e=>setRuanganForm({...ruanganForm, status:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"><option>Aktif</option><option>Tidak Aktif</option><option>Renovasi</option></select></div>
              </div>
              <div><label className="text-xs font-semibold">Penanggung Jawab</label><input value={ruanganForm.penanggungJawab||""} onChange={e=>setRuanganForm({...ruanganForm, penanggungJawab:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
            </div>
            <div className="p-6 border-t flex gap-3"><button onClick={()=>setShowRuanganModal(false)} className="flex-1 h-11 rounded-xl bg-zinc-100 font-semibold text-sm">Batal</button><button onClick={saveRuangan} className="flex-1 h-11 rounded-xl bg-[#FF2D00] text-white font-semibold text-sm">Simpan</button></div>
          </div>
        </div>
      )}

      {showMtnModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-t-[28px] lg:rounded-[24px] max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center"><div><div className="font-bold text-lg">{editingMtn? "Kelola Pemeliharaan":"Buat Laporan Pemeliharaan"}</div><div className="text-xs text-zinc-500">Laporkan kerusakan atau permintaan service</div></div><button onClick={()=>setShowMtnModal(false)} className="w-9 h-9 rounded-full bg-zinc-100 grid place-items-center">✕</button></div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-semibold">Judul Laporan*</label><input value={mtnForm.judul||""} onChange={e=>setMtnForm({...mtnForm, judul:e.target.value})} placeholder="Contoh: AC Kelas 5A tidak dingin" className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold">Aset Terkait</label><select value={mtnForm.asetId||""} onChange={e=>setMtnForm({...mtnForm, asetId:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"><option value="">Pilih Aset (opsional)</option>{asetList.map(a=><option key={a.id} value={a.id}>{a.nama} - {a.kodeAset}</option>)}</select></div>
                <div><label className="text-xs font-semibold">Jenis</label><select value={mtnForm.jenis||"Perbaikan"} onChange={e=>setMtnForm({...mtnForm, jenis:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50">{JENIS_MTN.map(j=><option key={j} value={j}>{j}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-semibold">Prioritas</label><select value={mtnForm.prioritas||"Sedang"} onChange={e=>setMtnForm({...mtnForm, prioritas:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50">{PRIORITAS.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className="text-xs font-semibold">Status</label><select value={mtnForm.status||"Diajukan"} onChange={e=>setMtnForm({...mtnForm, status:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50">{STATUS_MTN.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="text-xs font-semibold">Target Selesai</label><input type="date" value={mtnForm.tanggalTarget||""} onChange={e=>setMtnForm({...mtnForm, tanggalTarget:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold">Pelapor*</label><input value={mtnForm.pelapor||""} onChange={e=>setMtnForm({...mtnForm, pelapor:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
                <div><label className="text-xs font-semibold">Teknisi</label><select value={mtnForm.teknisiId||""} onChange={e=>setMtnForm({...mtnForm, teknisiId:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"><option value="">Belum ditugaskan</option>{usersList.map(u=><option key={u.id} value={u.id}>{u.nama} - {u.role}</option>)}</select></div>
              </div>
              <div><label className="text-xs font-semibold">Biaya Estimasi / Real (Rp)</label><input type="number" value={mtnForm.biaya||""} onChange={e=>setMtnForm({...mtnForm, biaya:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              <div><label className="text-xs font-semibold">Deskripsi Kerusakan</label><textarea value={mtnForm.deskripsi||""} onChange={e=>setMtnForm({...mtnForm, deskripsi:e.target.value})} rows={3} className="mt-1 w-full px-3 py-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              <div><label className="text-xs font-semibold">Catatan Teknisi</label><textarea value={mtnForm.catatanTeknisi||""} onChange={e=>setMtnForm({...mtnForm, catatanTeknisi:e.target.value})} rows={2} placeholder="Diisi teknisi saat pengerjaan" className="mt-1 w-full px-3 py-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
            </div>
            <div className="p-6 border-t flex gap-3"><button onClick={()=>setShowMtnModal(false)} className="flex-1 h-11 rounded-xl bg-zinc-100 font-semibold text-sm">Batal</button><button onClick={saveMtn} className="flex-1 h-11 rounded-xl bg-[#FF2D00] text-white font-semibold text-sm">{editingMtn? "Update Laporan":"Kirim Laporan"}</button></div>
          </div>
        </div>
      )}

      {showJadwalModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-t-[28px] lg:rounded-[24px] max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center"><div className="font-bold text-lg">{editingJadwal? "Edit Jadwal":"Tambah Jadwal Rutin"}</div><button onClick={()=>setShowJadwalModal(false)} className="w-9 h-9 rounded-full bg-zinc-100 grid place-items-center">✕</button></div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-semibold">Judul Jadwal*</label><input value={jadwalForm.judul||""} onChange={e=>setJadwalForm({...jadwalForm, judul:e.target.value})} placeholder="Contoh: Cuci AC Masjid" className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              <div><label className="text-xs font-semibold">Aset (opsional)</label><select value={jadwalForm.asetId||""} onChange={e=>setJadwalForm({...jadwalForm, asetId:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"><option value="">Umum / Tanpa Aset Spesifik</option>{asetList.map(a=><option key={a.id} value={a.id}>{a.nama}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold">Frekuensi</label><select value={jadwalForm.frekuensi||"Bulanan"} onChange={e=>setJadwalForm({...jadwalForm, frekuensi:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50">{FREKUENSI.map(f=><option key={f} value={f}>{f}</option>)}</select></div>
                <div><label className="text-xs font-semibold">Tanggal Selanjutnya</label><input type="date" value={jadwalForm.tanggalSelanjutnya||""} onChange={e=>setJadwalForm({...jadwalForm, tanggalSelanjutnya:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              </div>
              <div><label className="text-xs font-semibold">Penanggung Jawab</label><input value={jadwalForm.penanggungJawab||""} onChange={e=>setJadwalForm({...jadwalForm, penanggungJawab:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
              <div><label className="text-xs font-semibold">Deskripsi</label><textarea value={jadwalForm.deskripsi||""} onChange={e=>setJadwalForm({...jadwalForm, deskripsi:e.target.value})} rows={3} className="mt-1 w-full px-3 py-3 rounded-xl border border-zinc-200 bg-zinc-50"/></div>
            </div>
            <div className="p-6 border-t flex gap-3"><button onClick={()=>setShowJadwalModal(false)} className="flex-1 h-11 rounded-xl bg-zinc-100 font-semibold text-sm">Batal</button><button onClick={saveJadwal} className="flex-1 h-11 rounded-xl bg-[#FF2D00] text-white font-semibold text-sm">Simpan Jadwal</button></div>
          </div>
        </div>
      )}

      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
    </div>
  );
}
