import React, { useState, useEffect } from "react";
import {
  Users,
  UserCircle,
  ClipboardList,
  Activity,
  Plus,
  Clock,
  FileText,
  HeartPulse,
  LogOut,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Calendar,
  AlertCircle,
  UserPlus,
  Heart,
  MapPin,
  KeyRound,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
} from "lucide-react";

// --- KONFIGURASI ---
// GANTI URL DI BAWAH INI DENGAN WEB APP URL LENGKAP ANDA
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxCXdd6UNRvG3uWz_exZ04RArBCxjf0BlKe7xr85ZaZxKX7vh5ndaI3tyjs9cALqQzzJQ/exec";
const ADMIN_PASSWORD_REQUIRED = "admin123";

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [patients, setPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [careLogs, setCareLogs] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const injectTailwind = () => {
      if (!document.getElementById("tailwind-cdn")) {
        const script = document.createElement("script");
        script.id = "tailwind-cdn";
        script.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(script);
      }
    };
    injectTailwind();
    const checkTailwind = setInterval(() => {
      if (window.tailwind) {
        setIsReady(true);
        clearInterval(checkTailwind);
      }
    }, 100);
    return () => clearInterval(checkTailwind);
  }, []);

  const fetchData = async () => {
    if (!GAS_URL || GAS_URL.includes("...")) return;
    setIsLoading(true);
    try {
      const response = await fetch(GAS_URL);
      const result = await response.json();
      if (result.status === "success") {
        setPatients(result.patients || []);
        setCaregivers(result.caregivers || []);
        setAssignments(result.assignments || []);
        setCareLogs(
          (result.careLogs || []).sort((a, b) => b.timestamp - a.timestamp)
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) fetchData();
  }, [isReady]);

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedPatient(null);
  };

  if (!isReady)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Activity className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse uppercase text-xs tracking-widest">
          Memuat Sistem...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 selection:bg-indigo-100 antialiased">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-4 sm:px-6 h-20 flex items-center justify-between shadow-sm">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => {
            setSelectedPatient(null);
            fetchData();
          }}
        >
          <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 group-active:scale-90 transition-transform">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg sm:text-xl uppercase tracking-tighter italic">
            CareSync
          </span>
        </div>
        <div className="flex items-center gap-3">
          {currentUser && (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">
                  Status Akses
                </p>
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                  {currentUser.role === "admin"
                    ? "Administrator"
                    : currentUser.data.name}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-3 bg-rose-50 text-rose-600 rounded-2xl active:scale-90 transition-all shadow-sm border border-rose-100"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-sm">
        {!currentUser ? (
          <LoginScreen
            caregivers={caregivers}
            setCurrentUser={setCurrentUser}
            ADMIN_PASSWORD={ADMIN_PASSWORD_REQUIRED}
          />
        ) : selectedPatient ? (
          <PatientDetail
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
            careLogs={careLogs}
            caregivers={caregivers}
          />
        ) : currentUser.role === "admin" ? (
          <AdminDashboard
            patients={patients}
            caregivers={caregivers}
            assignments={assignments}
            careLogs={careLogs}
            fetchData={fetchData}
            GAS_URL={GAS_URL}
          />
        ) : (
          <CaregiverDashboard
            currentUser={currentUser}
            patients={patients}
            assignments={assignments}
            setSelectedPatient={setSelectedPatient}
            fetchData={fetchData}
            GAS_URL={GAS_URL}
          />
        )}
      </main>

      <button
        onClick={fetchData}
        className={`fixed bottom-6 right-6 p-5 bg-white rounded-full shadow-2xl border border-slate-100 text-indigo-600 z-40 active:scale-75 transition-all flex items-center justify-center ${
          isLoading ? "animate-spin" : ""
        }`}
      >
        <Activity className="w-6 h-6" />
      </button>
    </div>
  );
}

function LoginScreen({ caregivers, setCurrentUser, ADMIN_PASSWORD }) {
  const [loginStep, setLoginStep] = useState("role");
  const [tempCaregiver, setTempCaregiver] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleAdminAuth = () => {
    if (passwordInput === ADMIN_PASSWORD) setCurrentUser({ role: "admin" });
    else setLoginError("Sandi Admin Salah!");
  };

  const handleCaregiverAuth = () => {
    if (tempCaregiver && passwordInput === String(tempCaregiver.password))
      setCurrentUser({ role: "caregiver", data: tempCaregiver });
    else setLoginError("Sandi Salah!");
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-200">
            <HeartPulse className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-center text-slate-800 mb-1 tracking-tighter uppercase italic italic">
          CareSync
        </h1>
        <p className="text-slate-400 text-center text-[10px] mb-10 font-bold uppercase tracking-[0.2em]">
          Pramurukti System
        </p>

        {loginStep === "role" ? (
          <div className="space-y-4">
            <button
              onClick={() => setLoginStep("admin_pass")}
              className="w-full flex items-center justify-center gap-3 p-5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-xs shadow-xl active:scale-95 transition-all"
            >
              <ShieldCheck className="w-5 h-5 text-indigo-400" />{" "}
              <span>ADMINISTRATOR</span>
            </button>
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink-0 mx-4 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
                Pramurukti
              </span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>
            <select
              className="w-full p-5 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50 font-bold text-slate-700 outline-none text-xs appearance-none"
              onChange={(e) => {
                const cg = caregivers.find((c) => c.id == e.target.value);
                if (cg) {
                  setTempCaregiver(cg);
                  setLoginStep("caregiver_pass");
                  setLoginError("");
                }
              }}
            >
              <option value="">-- PILIH NAMA ANDA --</option>
              {caregivers
                .filter((c) => c.status === "Aktif")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Sandi"
                className={`w-full p-5 border-2 rounded-[1.5rem] bg-slate-50 outline-none font-bold text-center text-sm pr-12 ${
                  loginError ? "border-red-500" : "border-slate-100"
                }`}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setLoginError("");
                }}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (loginStep === "admin_pass"
                    ? handleAdminAuth()
                    : handleCaregiverAuth())
                }
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {loginError && (
              <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">
                {loginError}
              </p>
            )}
            <button
              onClick={
                loginStep === "admin_pass"
                  ? handleAdminAuth
                  : handleCaregiverAuth
              }
              className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase shadow-xl active:scale-95 transition-all"
            >
              Masuk
            </button>
            <button
              onClick={() => {
                setLoginStep("role");
                setPasswordInput("");
                setLoginError("");
              }}
              className="w-full py-2 text-slate-400 text-[10px] font-black uppercase"
            >
              Kembali
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({
  patients,
  caregivers,
  assignments,
  careLogs,
  fetchData,
  GAS_URL,
}) {
  const [activeAdminTab, setActiveAdminTab] = useState("assignment");
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [assignForm, setAssignForm] = useState({
    patientId: "",
    caregiverId: "",
  });
  const [patientForm, setPatientForm] = useState({
    name: "",
    age: "",
    condition: "",
    address: "",
  });
  const [caregiverForm, setCaregiverForm] = useState({
    name: "",
    phone: "",
    password: "",
    status: "Aktif",
  });

  const handleAction = async (type, data) => {
    setIsLoading(true);
    try {
      const res = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ type, data }),
      });
      const result = await res.json();
      if (result.status === "success") {
        fetchData();
        setEditId(null);
      } else alert("Gagal: " + result.message);
    } catch (e) {
      alert("Error Koneksi!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Pasien",
            val: patients.length,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            label: "Caregiver",
            val: caregivers.length,
            icon: UserCircle,
            color: "text-green-500",
            bg: "bg-green-50",
          },
          {
            label: "Aktif",
            val: assignments.length,
            icon: UserCheck,
            color: "text-indigo-500",
            bg: "bg-indigo-50",
          },
          {
            label: "Catatan",
            val: careLogs.length,
            icon: ClipboardList,
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center"
          >
            <div
              className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mb-1`}
            >
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              {s.label}
            </p>
            <h3 className="text-lg font-black text-slate-800">{s.val}</h3>
          </div>
        ))}
      </div>
      <div className="flex bg-white p-1 rounded-2xl border shadow-sm gap-1">
        {["assignment", "patient", "caregiver"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveAdminTab(tab)}
            className={`flex-1 py-3 px-4 text-[10px] font-black uppercase rounded-xl transition-all ${
              activeAdminTab === tab
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
        {activeAdminTab === "assignment" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction("ADD_ASSIGNMENT", {
                ...assignForm,
                startDate: new Date().toLocaleDateString("id-ID"),
              });
            }}
            className="space-y-4"
          >
            <h2 className="text-lg font-black uppercase">
              Tugaskan Pramurukti
            </h2>
            <select
              className="w-full p-4 bg-slate-50 border rounded-2xl"
              value={assignForm.patientId}
              onChange={(e) =>
                setAssignForm({ ...assignForm, patientId: e.target.value })
              }
              required
            >
              <option value="">-- Pilih Pasien --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              className="w-full p-4 bg-slate-50 border rounded-2xl"
              value={assignForm.caregiverId}
              onChange={(e) =>
                setAssignForm({ ...assignForm, caregiverId: e.target.value })
              }
              required
            >
              <option value="">-- Pilih Pramurukti --</option>
              {caregivers
                .filter((c) => c.status === "Aktif")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest"
            >
              {isLoading ? "..." : "SIMPAN PENUGASAN"}
            </button>
          </form>
        )}
        {activeAdminTab === "patient" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction("ADD_PATIENT", patientForm);
            }}
            className="space-y-4"
          >
            <h2 className="text-lg font-black uppercase">Tambah Pasien</h2>
            <input
              type="text"
              placeholder="Nama Pasien"
              className="w-full p-4 bg-slate-50 border rounded-2xl"
              value={patientForm.name}
              onChange={(e) =>
                setPatientForm({ ...patientForm, name: e.target.value })
              }
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Usia"
                className="p-4 bg-slate-50 border rounded-2xl"
                value={patientForm.age}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, age: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Alamat"
                className="p-4 bg-slate-50 border rounded-2xl"
                value={patientForm.address}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, address: e.target.value })
                }
                required
              />
            </div>
            <textarea
              placeholder="Diagnosa"
              className="w-full p-4 bg-slate-50 border rounded-2xl h-24"
              value={patientForm.condition}
              onChange={(e) =>
                setPatientForm({ ...patientForm, condition: e.target.value })
              }
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase"
            >
              {isLoading ? "..." : "DAFTARKAN PASIEN"}
            </button>
          </form>
        )}
        {activeAdminTab === "caregiver" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction("ADD_CAREGIVER", caregiverForm);
            }}
            className="space-y-4"
          >
            <h2 className="text-lg font-black uppercase">Tambah Caregiver</h2>
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="w-full p-4 bg-slate-50 border rounded-2xl"
              value={caregiverForm.name}
              onChange={(e) =>
                setCaregiverForm({ ...caregiverForm, name: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="No WhatsApp"
              className="w-full p-4 bg-slate-50 border rounded-2xl"
              value={caregiverForm.phone}
              onChange={(e) =>
                setCaregiverForm({ ...caregiverForm, phone: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Sandi Login"
              className="w-full p-4 bg-slate-50 border rounded-2xl"
              value={caregiverForm.password}
              onChange={(e) =>
                setCaregiverForm({ ...caregiverForm, password: e.target.value })
              }
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase"
            >
              {isLoading ? "..." : "DAFTARKAN CAREGIVER"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function CaregiverDashboard({
  currentUser,
  patients,
  assignments,
  setSelectedPatient,
  fetchData,
  GAS_URL,
}) {
  const [isLoading, setIsLoading] = useState(false);
  // Perhatikan penggunaan huruf kecil (caregiverid, status_penugasan) sesuai mapping backend
  const myAssignments = assignments.filter(
    (a) =>
      a.caregiverid == currentUser.data.id && a.status_penugasan === "Aktif"
  );
  const myPatients = patients.filter((p) =>
    myAssignments.some((a) => a.patientid == p.id)
  );
  const [logForm, setLogForm] = useState({
    patientId: null,
    action: "",
    vitals: "",
    notes: "",
  });

  const handleSaveLog = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          type: "ADD_LOG",
          data: {
            ...logForm,
            caregiverId: currentUser.data.id,
            timestamp: new Date().toISOString(),
          },
        }),
      });
      fetchData();
      setLogForm({ patientId: null, action: "", vitals: "", notes: "" });
    } catch (e) {
      alert("Gagal!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl flex justify-between items-center flex-col md:flex-row gap-4">
        <div>
          <p className="text-indigo-200 font-bold text-[10px] uppercase mb-1">
            Status: Aktif Bertugas
          </p>
          <h2 className="text-2xl font-black">{currentUser.data.name}</h2>
        </div>
        <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 text-center">
          <p className="text-[9px] font-black uppercase">Pasien</p>
          <p className="text-2xl font-black">{myPatients.length}</p>
        </div>
      </div>
      <h3 className="text-lg font-black text-slate-800 uppercase px-1">
        Daftar Pasien Saya
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {myPatients.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-[2rem] border shadow-sm p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-black text-xl text-slate-800 uppercase leading-none">
                  {p.name}
                </h4>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-2">
                  {p.address}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatient(p)}
                className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl active:scale-90 shadow-sm"
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-6 font-bold text-rose-800 text-sm italic">
              Diagnosa: {p.condition}
            </div>
            {logForm.patientId === p.id ? (
              <form
                onSubmit={handleSaveLog}
                className="space-y-3 bg-slate-50 p-4 rounded-2xl border"
              >
                <input
                  type="text"
                  placeholder="Tindakan"
                  className="w-full p-4 rounded-xl border font-bold text-sm"
                  value={logForm.action}
                  onChange={(e) =>
                    setLogForm({ ...logForm, action: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Vitals (Tensi/Suhu)"
                  className="w-full p-4 rounded-xl border font-bold text-sm"
                  value={logForm.vitals}
                  onChange={(e) =>
                    setLogForm({ ...logForm, vitals: e.target.value })
                  }
                />
                <textarea
                  placeholder="Catatan..."
                  className="w-full p-4 rounded-xl border h-32 text-sm font-medium"
                  required
                  value={logForm.notes}
                  onChange={(e) =>
                    setLogForm({ ...logForm, notes: e.target.value })
                  }
                ></textarea>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLogForm({ ...logForm, patientId: null })}
                    className="flex-1 py-4 bg-slate-200 rounded-xl text-xs font-black uppercase"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase shadow-lg"
                  >
                    {isLoading ? "..." : "SIMPAN"}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() =>
                  setLogForm({
                    ...logForm,
                    patientId: p.id,
                    action: "",
                    vitals: "",
                    notes: "",
                  })
                }
                className="w-full py-5 flex items-center justify-center gap-3 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95"
              >
                <Plus className="w-5 h-5" /> Tulis Catatan Baru
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientDetail({
  selectedPatient,
  setSelectedPatient,
  careLogs,
  caregivers,
}) {
  const history = careLogs.filter((l) => l.patientid == selectedPatient.id);
  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-300">
      <button
        onClick={() => setSelectedPatient(null)}
        className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-white px-6 py-3 rounded-2xl border active:scale-95 shadow-sm"
      >
        &larr; Kembali
      </button>
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border shadow-sm">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-4">
          {selectedPatient.name}
        </h2>
        <div className="flex gap-2 text-[10px] font-black text-slate-400 uppercase mb-8">
          <span className="bg-slate-50 px-2 py-1 rounded border">
            USIA: {selectedPatient.age} THN
          </span>
          <span className="bg-slate-50 px-2 py-1 rounded border">
            {selectedPatient.address}
          </span>
        </div>
        <h3 className="text-lg font-black uppercase mb-8 flex items-center gap-3">
          <FileText className="w-5 h-5 text-indigo-500" /> Histori Rekam Medis
        </h3>
        <div className="relative border-l-2 ml-3 space-y-10 pb-4">
          {history.map((log, i) => {
            const cg = caregivers.find((x) => x.id == log.caregiverid);
            return (
              <div key={i} className="relative pl-8">
                <div className="absolute w-4 h-4 bg-white border-4 border-indigo-500 rounded-full -left-[9px] top-1 shadow-md"></div>
                <div className="mb-2 text-xs font-black text-slate-400 uppercase">
                  {new Date(log.timestamp).toLocaleDateString("id-ID")}{" "}
                  <span className="ml-2 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded">
                    Oleh: {cg?.name}
                  </span>
                </div>
                <div className="bg-slate-50 p-5 rounded-[1.5rem] border shadow-sm text-sm">
                  <p className="font-black text-indigo-900 mb-1 uppercase">
                    {log.action}
                  </p>
                  <p className="text-slate-600 italic">"{log.notes}"</p>
                  {log.vitals && (
                    <div className="mt-4 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                      <HeartPulse className="w-3 h-3 inline mr-1" />{" "}
                      {log.vitals}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
