import React, { useState, useEffect } from 'react';
import { 
  Users, UserCircle, ClipboardList, Activity, Plus, Clock, 
  FileText, HeartPulse, LogOut, ShieldCheck, UserCheck, 
  ChevronRight, Calendar, AlertCircle, UserPlus, Heart, MapPin, 
  KeyRound, Eye, EyeOff, Pencil, Trash2, X, CheckCircle2, History,
  WifiOff, RefreshCw
} from 'lucide-react';

// --- KONFIGURASI ---
const GAS_URL = 'https://script.google.com/macros/s/AKfycbz9PhHIK124yXAweEBNSILR98inpRg6XDDaVHIEuKHZtipH6WwTM8pS2QDikUGxtqjY8A/exec'; 
const ADMIN_PASSWORD_REQUIRED = 'admin123';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  
  const [patients, setPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [careLogs, setCareLogs] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const injectTailwind = () => {
      if (!document.getElementById('tailwind-cdn')) {
        const script = document.createElement('script');
        script.id = 'tailwind-cdn';
        script.src = 'https://cdn.tailwindcss.com';
        document.head.appendChild(script);
      }
    };
    injectTailwind();
    const checkTailwind = setInterval(() => {
      if (window.tailwind) { setIsReady(true); clearInterval(checkTailwind); }
    }, 100);
    return () => clearInterval(checkTailwind);
  }, []);

  const superNormalize = (data) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(item => {
      const normalized = {};
      Object.keys(item).forEach(key => {
        const newKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        normalized[newKey] = item[key];
      });
      return normalized;
    });
  };

  const fetchData = async () => {
    if (!GAS_URL || GAS_URL.includes('...')) return;
    setIsLoading(true);
    setConnectionError(null);
    try {
      const response = await fetch(`${GAS_URL}?t=${Date.now()}`, {
        method: 'GET',
        redirect: 'follow'
      });
      const result = await response.json();
      if (result.status === 'success') {
        setPatients(superNormalize(result.patients));
        setCaregivers(superNormalize(result.caregivers));
        setAssignments(superNormalize(result.assignments));
        const logs = superNormalize(result.careLogs);
        setCareLogs(logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)));
      } else {
        throw new Error(result.message || "Gagal memproses data");
      }
    } catch (error) { 
      setConnectionError(error.message);
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { if (isReady) fetchData(); }, [isReady]);

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedPatient(null);
  };

  if (!isReady) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans p-6">
      <Activity className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
      <p className="text-slate-500 font-bold animate-pulse uppercase text-[10px] tracking-widest text-center italic">CareSync Is Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 selection:bg-indigo-100 antialiased">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-4 sm:px-6 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setSelectedPatient(null); fetchData(); }}>
          <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg group-active:scale-90 transition-transform">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl sm:text-2xl uppercase tracking-tighter italic leading-none">CareSync</span>
        </div>
        <div className="flex items-center gap-3">
          {currentUser && (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Akses: {currentUser.role}</p>
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{currentUser.role === 'admin' ? 'Administrator' : (currentUser.data?.name || 'Pramurukti')}</p>
              </div>
              <button onClick={handleLogout} className="p-3 bg-rose-50 text-rose-600 rounded-2xl active:scale-90 transition-all border border-rose-100 shadow-sm"><LogOut className="w-5 h-5" /></button>
            </>
          )}
        </div>
      </nav>

      {connectionError && (
        <div className="bg-rose-50 border-b border-rose-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3 text-rose-800">
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <div className="flex-grow">
              <p className="text-xs font-black uppercase mb-1">Koneksi Terputus</p>
              <p className="text-[10px] opacity-80">{connectionError}</p>
            </div>
            <button onClick={fetchData} className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg">
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} /> Sinkron Ulang
            </button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-sm">
        {!currentUser ? (
          <LoginScreen caregivers={caregivers} setCurrentUser={setCurrentUser} ADMIN_PASSWORD={ADMIN_PASSWORD_REQUIRED} />
        ) : selectedPatient ? (
          <PatientDetail selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} careLogs={careLogs} caregivers={caregivers} />
        ) : currentUser.role === 'admin' ? (
          <AdminDashboard patients={patients} caregivers={caregivers} assignments={assignments} careLogs={careLogs} fetchData={fetchData} GAS_URL={GAS_URL} setSelectedPatient={setSelectedPatient} />
        ) : (
          <CaregiverDashboard currentUser={currentUser} patients={patients} assignments={assignments} setSelectedPatient={setSelectedPatient} fetchData={fetchData} GAS_URL={GAS_URL} />
        )}
      </main>

      <button onClick={fetchData} disabled={isLoading} className={`fixed bottom-6 right-6 p-5 bg-white rounded-full shadow-2xl border border-slate-100 text-indigo-600 z-40 active:scale-75 transition-all ${isLoading ? 'animate-spin' : ''}`}>
        <Activity className="w-6 h-6" />
      </button>
    </div>
  );
}

function LoginScreen({ caregivers, setCurrentUser, ADMIN_PASSWORD }) {
  const [loginStep, setLoginStep] = useState('role');
  const [tempCaregiver, setTempCaregiver] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleAdminAuth = () => {
    if (passwordInput === ADMIN_PASSWORD) setCurrentUser({ role: 'admin' });
    else setLoginError('Sandi Administrator Salah!');
  };

  const handleCaregiverAuth = () => {
    if (tempCaregiver && String(passwordInput) === String(tempCaregiver.password)) {
      setCurrentUser({ role: 'caregiver', data: tempCaregiver });
    } else {
      setLoginError('Kata Sandi Pramurukti Salah!');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-10 rounded-[3rem] shadow-2xl max-w-sm w-full border border-slate-100 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-6"><div className="p-6 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-100"><HeartPulse className="w-12 h-12 text-white" /></div></div>
        <h1 className="text-4xl font-black text-center text-slate-800 mb-1 tracking-tighter uppercase italic italic leading-none">CareSync</h1>
        <p className="text-slate-400 text-center text-[10px] mb-10 font-bold uppercase tracking-[0.2em] italic">Digital Care Management</p>
        {loginStep === 'role' ? (
          <div className="space-y-4">
            <button onClick={() => setLoginStep('admin_pass')} className="w-full flex items-center justify-center gap-3 p-5 bg-slate-900 text-white rounded-[1.8rem] font-bold text-xs shadow-xl active:scale-95 transition-all hover:bg-black">
              <ShieldCheck className="w-5 h-5 text-indigo-400" /> <span>ADMINISTRATOR</span>
            </button>
            <div className="relative flex items-center py-4"><div className="flex-grow border-t border-slate-100"></div><span className="flex-shrink-0 mx-4 text-slate-300 text-[10px] font-black uppercase">Pramurukti</span><div className="flex-grow border-t border-slate-100"></div></div>
            <select 
              className="w-full p-5 border-2 border-slate-100 rounded-[1.8rem] bg-slate-50 font-bold text-slate-700 outline-none text-xs cursor-pointer" 
              onChange={(e) => {
                const cg = caregivers.find(c => String(c.id) === String(e.target.value));
                if (cg) { setTempCaregiver(cg); setLoginStep('caregiver_pass'); setLoginError(''); }
              }}
            >
              <option value="">-- PILIH NAMA ANDA --</option>
              {caregivers.filter(c => String(c.status).toLowerCase() === 'aktif').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="Kata Sandi" className={`w-full p-5 border-2 rounded-[1.8rem] bg-slate-50 outline-none font-black text-center text-sm pr-12 ${loginError ? 'border-red-500' : 'border-slate-100'}`} value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setLoginError(''); }} onKeyPress={(e) => e.key === 'Enter' && (loginStep === 'admin_pass' ? handleAdminAuth() : handleCaregiverAuth())} autoFocus />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-2">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            {loginError && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{loginError}</p>}
            <button onClick={loginStep === 'admin_pass' ? handleAdminAuth : handleCaregiverAuth} className="w-full py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black text-xs uppercase shadow-xl active:scale-95">Masuk</button>
            <button onClick={() => { setLoginStep('role'); setPasswordInput(''); setLoginError(''); }} className="w-full py-2 text-slate-400 text-[10px] font-black uppercase">Kembali</button>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ patients, caregivers, assignments, careLogs, fetchData, GAS_URL, setSelectedPatient }) {
  const [activeAdminTab, setActiveAdminTab] = useState('assignment'); 
  const [isLoading, setIsLoading] = useState(false);
  const [assignForm, setAssignForm] = useState({ patientId: '', caregiverId: '' });
  const [patientForm, setPatientForm] = useState({ name: '', age: '', condition: '', address: '' });
  const [caregiverForm, setCaregiverForm] = useState({ name: '', phone: '', password: '', status: 'Aktif' });

  const handleAction = async (type, data) => {
    setIsLoading(true);
    try {
      const res = await fetch(GAS_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'text/plain' }, 
        body: JSON.stringify({ type, data }),
        redirect: 'follow'
      });
      const result = await res.json();
      if (result.status === 'success') fetchData();
      else alert("Gagal: " + result.message);
    } catch (e) { alert("Gagal Menghubungi Server."); } 
    finally { setIsLoading(false); }
  };

  const stats = [
    { label: 'Pasien', val: patients.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', tab: 'patient' },
    { label: 'Caregiver', val: caregivers.length, icon: UserCircle, color: 'text-green-500', bg: 'bg-green-50', tab: 'caregiver' },
    { label: 'Aktif', val: assignments.filter(a => String(a.statuspenugasan).toLowerCase() === 'aktif').length, icon: UserCheck, color: 'text-indigo-500', bg: 'bg-indigo-50', tab: 'assignment' },
    { label: 'Log Hari Ini', val: careLogs.length, icon: ClipboardList, color: 'text-orange-500', bg: 'bg-orange-50', tab: 'logs' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <button key={i} onClick={() => setActiveAdminTab(s.tab)} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center hover:scale-105 active:scale-95 transition-all">
            <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-2`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
            <h3 className="text-xl font-black text-slate-800">{s.val}</h3>
          </button>
        ))}
      </div>
      <div className="flex bg-white p-1 rounded-2xl border shadow-sm gap-1 overflow-x-auto no-scrollbar">
        {['assignment', 'patient', 'caregiver', 'logs'].map(tab => (
          <button key={tab} onClick={() => setActiveAdminTab(tab)} className={`flex-1 py-4 px-4 text-[10px] font-black uppercase rounded-xl transition-all whitespace-nowrap ${activeAdminTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>
            {tab === 'logs' ? 'Log Aktivitas' : tab === 'assignment' ? 'Penugasan' : tab}
          </button>
        ))}
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border shadow-sm">
        {activeAdminTab === 'assignment' && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-300">
            <form onSubmit={(e) => { e.preventDefault(); handleAction('ADD_ASSIGNMENT', { ...assignForm, startDate: new Date().toLocaleDateString('id-ID') }); }} className="space-y-4 border-b pb-8">
              <h2 className="text-lg font-black uppercase">Buat Penugasan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold" value={assignForm.patientId} onChange={e => setAssignForm({...assignForm, patientId: e.target.value})} required>
                  <option value="">-- Pilih Pasien --</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold" value={assignForm.caregiverId} onChange={e => setAssignForm({...assignForm, caregiverId: e.target.value})} required>
                  <option value="">-- Pilih Pramurukti --</option>
                  {caregivers.filter(c => String(c.status).toLowerCase() === 'aktif').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase shadow-xl active:scale-95">Simpan Penugasan</button>
            </form>
            <h2 className="text-lg font-black uppercase">Daftar Aktif</h2>
            <div className="grid grid-cols-1 gap-3">
              {assignments.filter(a => String(a.statuspenugasan).toLowerCase() === 'aktif').map(a => {
                const p = patients.find(x => String(x.id) === String(a.patientid));
                const c = caregivers.find(x => String(x.id) === String(a.caregiverid));
                return (
                  <div key={a.id} className="p-5 bg-slate-50 rounded-[1.8rem] border flex justify-between items-center gap-3">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600"><UserCircle size={24}/></div>
                      <div>
                        <p className="font-black text-sm uppercase leading-none mb-1 tracking-tight">{p?.name || 'Pasien ?'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">Pramurukti: {c?.name || 'Caregiver ?'}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black bg-white px-4 py-2 rounded-full border text-slate-500 uppercase italic">Mulai: {a.startdate}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {activeAdminTab === 'patient' && (
          <div className="space-y-6">
            <form onSubmit={(e) => { e.preventDefault(); handleAction('ADD_PATIENT', patientForm); }} className="space-y-4 border-b pb-8">
              <h2 className="text-lg font-black uppercase">Tambah Pasien</h2>
              <input type="text" placeholder="Nama Pasien" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-black text-sm shadow-sm" value={patientForm.name} onChange={e => setPatientForm({...patientForm, name: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4"><input type="number" placeholder="Usia" className="p-4 bg-slate-50 border rounded-2xl outline-none font-bold" value={patientForm.age} onChange={e => setPatientForm({...patientForm, age: e.target.value})} required /><input type="text" placeholder="Alamat" className="p-4 bg-slate-50 border rounded-2xl outline-none font-bold" value={patientForm.address} onChange={e => setPatientForm({...patientForm, address: e.target.value})} required /></div>
              <textarea placeholder="Diagnosa Utama" className="w-full p-4 bg-slate-50 border rounded-2xl h-24 outline-none font-medium text-sm" value={patientForm.condition} onChange={e => setPatientForm({...patientForm, condition: e.target.value})} required />
              <button type="submit" disabled={isLoading} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase shadow-xl active:scale-95 tracking-widest">Daftarkan Pasien</button>
            </form>
            <div className="grid grid-cols-1 gap-2">
              {patients.map(p => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center group border border-transparent hover:border-indigo-100 transition-all">
                  <div><p className="font-black text-sm uppercase mb-1 tracking-tight">{p.name}</p><p className="text-[10px] text-slate-400 font-bold italic">{p.condition}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedPatient(p)} className="p-3 bg-white text-indigo-600 rounded-xl border hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><FileText size={18}/></button>
                    <button onClick={() => { if(window.confirm('Hapus?')) handleAction('DELETE_PATIENT', {id: p.id}) }} className="p-3 bg-white text-red-500 rounded-xl border hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeAdminTab === 'caregiver' && (
          <div className="space-y-6">
            <form onSubmit={(e) => { e.preventDefault(); handleAction('ADD_CAREGIVER', caregiverForm); }} className="space-y-4 border-b pb-8">
              <h2 className="text-lg font-black uppercase">Tambah Pramurukti</h2>
              <input type="text" placeholder="Nama Lengkap" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-black text-sm" value={caregiverForm.name} onChange={e => setCaregiverForm({...caregiverForm, name: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="WhatsApp" className="p-4 bg-slate-50 border rounded-2xl outline-none font-bold" value={caregiverForm.phone} onChange={e => setCaregiverForm({...caregiverForm, phone: e.target.value})} required /><input type="text" placeholder="Sandi Login" className="p-4 bg-slate-50 border rounded-2xl outline-none font-bold" value={caregiverForm.password} onChange={e => setCaregiverForm({...caregiverForm, password: e.target.value})} required /></div>
              <button type="submit" disabled={isLoading} className="w-full py-5 bg-green-600 text-white rounded-[1.5rem] font-black uppercase shadow-xl active:scale-95">Simpan Pramurukti</button>
            </form>
            <div className="grid grid-cols-1 gap-2">
              {caregivers.map(c => (
                <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-center hover:bg-white shadow-sm border-transparent hover:border-green-100 transition-all">
                  <div className="flex items-center gap-4"><div className="p-3 bg-green-100 rounded-2xl text-green-600"><UserCircle size={20}/></div><span className="font-black text-sm uppercase tracking-tight">{c.name}</span></div>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${String(c.status).toLowerCase() === 'aktif' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeAdminTab === 'logs' && (
          <div className="space-y-6 animate-in slide-in-from-left duration-300">
            <h2 className="text-lg font-black uppercase flex items-center gap-3 tracking-tight"><History className="w-6 h-6 text-indigo-600"/> Laporan Aktivitas Terbaru</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {careLogs.length === 0 ? <p className="text-center text-slate-300 font-bold py-10 uppercase text-xs italic tracking-widest">Belum ada rekam medis</p> : careLogs.map((log, i) => {
                // Perbaikan: Paksa ID ke String untuk pencarian yang akurat
                const p = patients.find(x => String(x.id) === String(log.patientid));
                const c = caregivers.find(x => String(x.id) === String(log.caregiverid));
                return (
                  <div key={i} className="p-5 bg-slate-50 rounded-[2rem] border-l-8 border-indigo-500 shadow-sm hover:shadow-md transition-all hover:bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-black text-sm uppercase text-indigo-900 leading-none mb-1 tracking-tight italic underline decoration-indigo-200">{p?.name || 'NAMA TIDAK DITEMUKAN'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Petugas: <span className="text-indigo-500">{c?.name || 'PETUGAS TIDAK DITEMUKAN'}</span></p>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase italic bg-white px-3 py-1 rounded-full border">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border shadow-inner">
                      <p className="text-xs font-black text-indigo-600 uppercase mb-2 leading-none border-b border-indigo-50 pb-2 tracking-tight">{log.action}</p>
                      <p className="text-slate-600 italic text-sm font-medium leading-relaxed">"{log.notes}"</p>
                    </div>
                    {log.vitals && <div className="mt-3 text-[11px] font-black text-rose-500 flex items-center gap-3 uppercase tracking-widest bg-white w-fit px-6 py-2 rounded-full border shadow-inner"><HeartPulse className="w-4 h-4 animate-pulse"/> VITAL: {log.vitals}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CaregiverDashboard({ currentUser, patients, assignments, setSelectedPatient, fetchData, GAS_URL }) {
  const [isLoading, setIsLoading] = useState(false);
  const myAssignments = assignments.filter(a => 
    String(a.caregiverid) === String(currentUser.data.id) && 
    String(a.statuspenugasan).toLowerCase() === 'aktif'
  );
  const myPatients = patients.filter(p => myAssignments.some(a => String(a.patientid) === String(p.id)));
  const [logForm, setLogForm] = useState({ patientId: null, action: '', vitals: '', notes: '' });

  const handleSaveLog = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch(GAS_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'text/plain' }, 
        body: JSON.stringify({ type: 'ADD_LOG', data: { ...logForm, caregiverId: currentUser.data.id, timestamp: new Date().toISOString() } }),
        redirect: 'follow'
      });
      fetchData(); setLogForm({ patientId: null, action: '', vitals: '', notes: '' });
    } catch (e) { alert("Gagal Simpan!"); } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl flex justify-between items-center flex-col md:flex-row gap-6">
        <div className="text-center md:text-left"><p className="text-indigo-200 font-bold text-[10px] uppercase mb-1 tracking-widest italic leading-none">Petugas Aktif</p><h2 className="text-3xl font-black leading-tight tracking-tight">{currentUser.data.name}</h2></div>
        <div className="bg-white/10 px-8 py-4 rounded-[1.5rem] border border-white/20 text-center shadow-inner"><p className="text-[10px] font-black uppercase leading-none mb-1 tracking-widest">Total Pasien</p><p className="text-3xl font-black">{myPatients.length}</p></div>
      </div>
      <h3 className="text-xl font-black text-slate-800 uppercase px-2 tracking-tight">Pasien Saya</h3>
      <div className="grid grid-cols-1 gap-5">
        {myPatients.length === 0 ? <div className="bg-white p-16 rounded-[2.5rem] border-4 border-dashed border-slate-100 text-center text-slate-300 uppercase font-black text-xs italic">Belum ada pasien yang ditugaskan</div> : myPatients.map(p => (
          <div key={p.id} className="bg-white rounded-[2.5rem] border shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all border-b-8 border-b-indigo-100">
            <div className="flex justify-between items-start mb-6">
              <div><h4 className="font-black text-2xl text-slate-800 uppercase leading-none tracking-tighter mb-2 italic">{p.name}</h4><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"><MapPin size={12} className="text-rose-400"/> {p.address}</p></div>
              <button onClick={() => setSelectedPatient(p)} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl active:scale-90 transition-all border border-indigo-100 hover:bg-indigo-600 hover:text-white"><FileText className="w-6 h-6" /></button>
            </div>
            <div className="bg-rose-50 p-5 rounded-[1.8rem] border border-rose-100 mb-8 font-black text-rose-800 text-sm italic shadow-inner">Kondisi Medis: <span className="text-rose-600">{p.condition}</span></div>
            {logForm.patientId === p.id ? (
              <form onSubmit={handleSaveLog} className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border-2 border-indigo-100 animate-in zoom-in-95 shadow-inner">
                <input type="text" placeholder="Tindakan yang dilakukan" className="w-full p-5 rounded-2xl border font-black text-sm outline-none shadow-sm focus:border-indigo-500" value={logForm.action} onChange={e => setLogForm({...logForm, action: e.target.value})} required />
                <input type="text" placeholder="Data Vital (Tensi/Suhu)" className="w-full p-5 rounded-2xl border font-black text-sm outline-none shadow-sm focus:border-indigo-500" value={logForm.vitals} onChange={e => setLogForm({...logForm, vitals: e.target.value})} />
                <textarea placeholder="Tulis catatan detail perkembangan pasien..." className="w-full p-5 rounded-2xl border h-40 text-sm font-medium outline-none shadow-sm focus:border-indigo-500" required value={logForm.notes} onChange={e => setLogForm({...logForm, notes: e.target.value})}></textarea>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setLogForm({ ...logForm, patientId: null })} className="flex-1 py-5 bg-slate-200 rounded-[1.5rem] text-xs font-black uppercase text-slate-600 active:scale-95">Batal</button>
                  <button type="submit" disabled={isLoading} className="flex-2 py-5 bg-indigo-600 text-white rounded-[1.5rem] text-xs font-black uppercase shadow-xl active:scale-95 tracking-widest">{isLoading ? 'PROSES...' : 'SIMPAN CATATAN'}</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setLogForm({ ...logForm, patientId: p.id, action: '', vitals: '', notes: '' })} className="w-full py-6 flex items-center justify-center gap-4 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 hover:bg-black transition-all"><Plus className="w-6 h-6 text-indigo-400" /> Tulis Laporan Perawatan</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientDetail({ selectedPatient, setSelectedPatient, careLogs, caregivers }) {
  // Perbaikan: Paksa pencarian filter menggunakan String
  const history = careLogs.filter(l => String(l.patientid) === String(selectedPatient.id));
  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500">
      <button onClick={() => setSelectedPatient(null)} className="flex items-center gap-3 text-indigo-600 font-black text-xs uppercase tracking-widest bg-white px-8 py-4 rounded-[1.5rem] border active:scale-95 shadow-lg border-indigo-50 leading-none">&larr; Kembali ke Daftar</button>
      <div className="bg-white p-8 sm:p-12 rounded-[3rem] border shadow-2xl border-b-[12px] border-b-indigo-100">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase mb-6 leading-none underline decoration-indigo-500 decoration-8 underline-offset-8 italic">{selectedPatient.name}</h2>
        <div className="flex flex-wrap gap-3 text-[10px] font-black text-slate-400 uppercase mb-10 tracking-widest">
          <span className="bg-slate-50 px-4 py-2 rounded-full border shadow-sm">USIA: {selectedPatient.age} THN</span>
          <span className="bg-slate-50 px-4 py-2 rounded-full border shadow-sm">WILAYAH: {selectedPatient.address}</span>
        </div>
        <h3 className="text-2xl font-black uppercase mb-10 flex items-center gap-4 tracking-tighter text-slate-800 border-b-4 border-slate-50 pb-4"><FileText className="w-8 h-8 text-indigo-500" /> Histori Rekam Medis</h3>
        <div className="relative border-l-8 border-slate-50 ml-4 space-y-12 pb-6">
          {history.length === 0 ? <p className="text-slate-300 font-black ml-10 italic text-sm uppercase tracking-widest bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200">Belum ada rekam medis yang tercatat</p> : history.map((log, i) => { 
            const cg = caregivers.find(x => String(x.id) === String(log.caregiverid)); 
            return (
              <div key={i} className="relative pl-12 animate-in slide-in-from-left duration-300">
                <div className="absolute w-8 h-8 bg-indigo-500 border-8 border-white rounded-full -left-[20px] top-1 shadow-lg ring-4 ring-indigo-50"></div>
                <div className="mb-3 text-[10px] font-black text-slate-400 uppercase flex items-center gap-3 tracking-widest">
                  {log.timestamp ? new Date(log.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase">PETUGAS: {cg?.name || 'Pramurukti'}</span>
                </div>
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border shadow-md text-sm hover:border-indigo-200 transition-all hover:bg-white border-transparent">
                  <p className="font-black text-indigo-900 mb-4 uppercase tracking-tighter italic text-lg leading-none border-b border-indigo-100 pb-4">{log.action || 'Pengecekan Rutin'}</p>
                  <p className="text-slate-600 italic font-medium leading-relaxed text-base tracking-tight italic">"{log.notes}"</p>
                  {log.vitals && <div className="mt-6 text-[11px] font-black text-rose-500 flex items-center gap-3 uppercase tracking-widest bg-white w-fit px-6 py-2 rounded-full border shadow-inner"><HeartPulse className="w-4 h-4 animate-pulse"/> DATA VITAL: {log.vitals}</div>}
                </div>
              </div>
          )})}
        </div>
      </div>
    </div>
  );
}
