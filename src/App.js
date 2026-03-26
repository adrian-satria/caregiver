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

export default function App() {
  // --- KONFIGURASI ---
  const GAS_URL =
    "https://script.google.com/macros/s/AKfycbxCXdd6UNRvG3uWz_exZ04RArBCxjf0BlKe7xr85ZaZxKX7vh5ndaI3tyjs9cALqQzzJQ/exec";
  const ADMIN_PASSWORD_REQUIRED = "admin123";

  // --- AUTO-INJECT TAILWIND ---
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
    const timer = setTimeout(injectTailwind, 500);
    return () => clearTimeout(timer);
  }, []);

  // --- STATE UTAMA ---
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // State Login
  const [loginStep, setLoginStep] = useState("role");
  const [tempCaregiver, setTempCaregiver] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // State Data
  const [patients, setPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [careLogs, setCareLogs] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // State Admin Form
  const [activeAdminTab, setActiveAdminTab] = useState("assignment");
  const [editId, setEditId] = useState(null);
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

  // --- INITIAL CHECK ---
  useEffect(() => {
    const checkTailwind = setInterval(() => {
      if (window.tailwind) {
        setIsReady(true);
        clearInterval(checkTailwind);
      }
    }, 100);
    return () => clearInterval(checkTailwind);
  }, []);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    if (GAS_URL.includes("AKfycb...")) {
      setPatients([
        {
          id: 1,
          name: "Bpk. Budi Santoso",
          age: 72,
          condition: "Pasca Stroke",
          address: "Jl. Merdeka No. 10",
        },
        {
          id: 2,
          name: "Ibu Siti Aminah",
          age: 65,
          condition: "Diabetes",
          address: "Komp. Hijau C4",
        },
      ]);
      setCaregivers([
        {
          id: 1,
          name: "Rina (Perawat)",
          phone: "08123",
          status: "Aktif",
          password: "rina",
        },
        {
          id: 2,
          name: "Anton (Pramurukti)",
          phone: "08987",
          status: "Aktif",
          password: "123",
        },
      ]);
      setAssignments([
        {
          id: 1,
          patientId: 1,
          caregiverId: 1,
          startDate: "2026-01-01",
          status_penugasan: "Aktif",
        },
      ]);
      setCareLogs([
        {
          id: 1,
          patientId: 1,
          caregiverId: 1,
          timestamp: new Date().toISOString(),
          action: "Makan Pagi",
          notes: "Habis setengah porsi.",
          vitals: "Tensi: 130/85",
        },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(GAS_URL);
      const result = await response.json();
      if (result.status === "success") {
        setPatients(result.patients || []);
        setCaregivers(result.caregivers || []);
        setAssignments(result.assignments || []);
        const sortedLogs = (result.careLogs || []).sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setCareLogs(sortedLogs);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) fetchData();
  }, [isReady]);

  // --- AUTH HANDLERS ---
  const handleAdminAuth = () => {
    if (passwordInput === ADMIN_PASSWORD_REQUIRED) {
      setCurrentUser({ role: "admin" });
      setPasswordInput("");
      setLoginError("");
    } else {
      setLoginError("Sandi Admin Salah!");
    }
  };

  const handleCaregiverAuth = () => {
    if (tempCaregiver && passwordInput === String(tempCaregiver.password)) {
      setCurrentUser({ role: "caregiver", data: tempCaregiver });
      setPasswordInput("");
      setLoginError("");
    } else {
      setLoginError("Sandi Pramurukti Salah!");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedPatient(null);
    setLoginStep("role");
    setTempCaregiver(null);
    setPasswordInput("");
    setLoginError("");
  };

  // --- CRUD HANDLERS ---
  const resetForms = () => {
    setEditId(null);
    setPatientForm({ name: "", age: "", condition: "", address: "" });
    setCaregiverForm({ name: "", phone: "", password: "", status: "Aktif" });
    setAssignForm({ patientId: "", caregiverId: "" });
  };

  const handleAdminAction = async (type, data) => {
    setIsLoading(true);
    if (GAS_URL.includes("AKfycb...")) {
      alert("Mode Simulasi: Hubungkan GAS_URL untuk menyimpan.");
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ type, data }),
      });
      const result = await res.json();
      if (result.status === "success") {
        fetchData();
        resetForms();
      }
    } catch (e) {
      alert("Gagal!");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER LOGIC ---

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Activity className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // --- RENDER LOGIN ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
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
                <span>LOGIN ADMINISTRATOR</span>
              </button>
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink-0 mx-4 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
                  Pramurukti
                </span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>
              <div className="relative">
                <select
                  className="w-full p-5 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50 font-bold text-slate-700 outline-none text-xs appearance-none cursor-pointer"
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
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">
                  Keamanan
                </p>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  {loginStep === "admin_pass"
                    ? "Mode Admin"
                    : `Halo, ${tempCaregiver?.name}`}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Sandi Akses"
                    className={`w-full p-5 border-2 rounded-[1.5rem] bg-slate-50 outline-none font-bold text-center text-sm tracking-widest ${
                      loginError
                        ? "border-red-500 animate-pulse"
                        : "border-slate-100 focus:border-indigo-500"
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
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
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
                  Masuk Ke Dashboard
                </button>
                <button
                  onClick={() => {
                    setLoginStep("role");
                    setPasswordInput("");
                    setLoginError("");
                  }}
                  className="w-full py-2 text-slate-400 text-[10px] font-black uppercase"
                >
                  &larr; Kembali
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 selection:bg-indigo-100">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-4 sm:px-6 h-20 flex items-center justify-between">
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
          <span className="font-black text-lg sm:text-xl uppercase tracking-tighter">
            CareSync
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-black text-slate-300 uppercase">
              Akses
            </p>
            <p className="text-xs font-black text-slate-800 tracking-tight">
              {currentUser.role === "admin" ? "ADMIN" : currentUser.data.name}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-3 bg-rose-50 text-rose-600 rounded-2xl active:scale-90 transition-all shadow-sm"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-sm">
        {selectedPatient ? (
          /* DETAIL PASIEN */
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setSelectedPatient(null)}
              className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-white px-6 py-3 rounded-2xl border border-slate-100 active:scale-95 mb-2 shadow-sm"
            >
              &larr; Kembali
            </button>
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="border-b border-slate-50 pb-6 mb-8 text-center sm:text-left">
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2 leading-none">
                  {selectedPatient.name}
                </h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="bg-slate-50 px-2 py-1 rounded border">
                    USIA: {selectedPatient.age}
                  </span>
                  <span className="bg-slate-50 px-2 py-1 rounded border flex items-center gap-1 text-indigo-500 font-bold">
                    <MapPin className="w-3 h-3" /> {selectedPatient.address}
                  </span>
                </div>
                <p className="mt-4 text-sm font-bold text-rose-500 uppercase tracking-tight italic">
                  Diagnosa: {selectedPatient.condition}
                </p>
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase mb-8 flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-500" /> Histori
                Perawatan
              </h3>
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-10 pb-4">
                {careLogs
                  .filter((l) => l.patientId == selectedPatient.id)
                  .map((log, i) => {
                    const cg = caregivers.find((x) => x.id == log.caregiverId);
                    return (
                      <div key={i} className="relative pl-8">
                        <div className="absolute w-4 h-4 bg-white border-4 border-indigo-500 rounded-full -left-[9px] top-1 shadow-md"></div>
                        <div className="mb-2 text-xs font-black text-slate-400 uppercase flex items-center gap-2">
                          {new Date(log.timestamp).toLocaleDateString()}
                          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100 text-[8px]">
                            Oleh: {cg?.name}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm text-sm">
                          <p className="font-black text-indigo-900 mb-1 uppercase">
                            {log.action || "Rutin"}
                          </p>
                          <p className="text-slate-600 italic font-medium">
                            "{log.notes}"
                          </p>
                          {log.vitals && (
                            <div className="mt-4 text-[10px] font-black text-rose-500 flex items-center gap-1 uppercase tracking-widest bg-white w-fit px-3 py-1 rounded-full border border-rose-100 shadow-sm">
                              <HeartPulse className="w-3 h-3" /> {log.vitals}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ) : currentUser.role === "admin" ? (
          /* DASHBOARD ADMIN */
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
                  label: "Penugasan",
                  val: assignments.length,
                  icon: UserCheck,
                  color: "text-indigo-500",
                  bg: "bg-indigo-50",
                },
                {
                  label: "Log",
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
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    {s.label}
                  </p>
                  <h3 className="text-lg font-black text-slate-800">{s.val}</h3>
                </div>
              ))}
            </div>

            <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm gap-1">
              {["assignment", "patient", "caregiver"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveAdminTab(tab);
                    resetForms();
                  }}
                  className={`flex-1 py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    activeAdminTab === tab
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-400"
                  }`}
                >
                  {tab === "assignment"
                    ? "Tugas"
                    : tab === "patient"
                    ? "Pasien"
                    : "Care"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-fit">
                <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center justify-between uppercase tracking-tight">
                  <span className="flex items-center gap-2">
                    {editId ? (
                      <Pencil className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Plus className="w-5 h-5 text-indigo-600" />
                    )}
                    {editId ? "Edit" : "Tambah"}
                  </span>
                  {editId && (
                    <button
                      onClick={resetForms}
                      className="text-xs font-bold text-red-500 flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full"
                    >
                      <X className="w-3 h-3" /> Batal
                    </button>
                  )}
                </h2>

                {activeAdminTab === "assignment" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAdminAction("ADD_ASSIGNMENT", assignForm);
                    }}
                    className="space-y-4"
                  >
                    <select
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                      value={assignForm.patientId}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          patientId: e.target.value,
                        })
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
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                      value={assignForm.caregiverId}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          caregiverId: e.target.value,
                        })
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
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg"
                    >
                      Tugaskan
                    </button>
                  </form>
                )}

                {activeAdminTab === "patient" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAdminAction(
                        editId ? "UPDATE_PATIENT" : "ADD_PATIENT",
                        editId ? { ...patientForm, id: editId } : patientForm
                      );
                    }}
                    className="space-y-4"
                  >
                    <input
                      type="text"
                      placeholder="Nama Pasien"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                      value={patientForm.name}
                      onChange={(e) =>
                        setPatientForm({ ...patientForm, name: e.target.value })
                      }
                      required
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="Usia"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold col-span-1 outline-none"
                        value={patientForm.age}
                        onChange={(e) =>
                          setPatientForm({
                            ...patientForm,
                            age: e.target.value,
                          })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Alamat"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold col-span-2 outline-none"
                        value={patientForm.address}
                        onChange={(e) =>
                          setPatientForm({
                            ...patientForm,
                            address: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Diagnosa"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm h-24 font-medium outline-none"
                      value={patientForm.condition}
                      onChange={(e) =>
                        setPatientForm({
                          ...patientForm,
                          condition: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-4 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg ${
                        editId ? "bg-orange-500" : "bg-blue-600"
                      }`}
                    >
                      {editId ? "Simpan" : "Daftar"}
                    </button>
                  </form>
                )}

                {activeAdminTab === "caregiver" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAdminAction(
                        editId ? "UPDATE_CAREGIVER" : "ADD_CAREGIVER",
                        editId
                          ? { ...caregiverForm, id: editId }
                          : caregiverForm
                      );
                    }}
                    className="space-y-4"
                  >
                    <input
                      type="text"
                      placeholder="Nama"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                      value={caregiverForm.name}
                      onChange={(e) =>
                        setCaregiverForm({
                          ...caregiverForm,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="HP"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                      value={caregiverForm.phone}
                      onChange={(e) =>
                        setCaregiverForm({
                          ...caregiverForm,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Sandi"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                      value={caregiverForm.password}
                      onChange={(e) =>
                        setCaregiverForm({
                          ...caregiverForm,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-4 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg ${
                        editId ? "bg-orange-500" : "bg-green-600"
                      }`}
                    >
                      Simpan
                    </button>
                  </form>
                )}
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
                  List Data
                </h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {activeAdminTab === "patient" &&
                    patients.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-center text-xs"
                      >
                        <div className="max-w-[70%]">
                          <p className="font-black uppercase mb-1">{p.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {p.address}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditId(p.id);
                              setPatientForm(p);
                            }}
                            className="p-2 bg-white text-orange-500 rounded-xl border"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Hapus?"))
                                handleAdminAction("DELETE_PATIENT", {
                                  id: p.id,
                                });
                            }}
                            className="p-2 bg-white text-red-500 rounded-xl border"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  {activeAdminTab === "caregiver" &&
                    caregivers.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-black uppercase mb-1">{c.name}</p>
                          <p
                            className={`text-[9px] font-black ${
                              c.status === "Aktif"
                                ? "text-green-500"
                                : "text-red-400"
                            }`}
                          >
                            {c.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditId(c.id);
                              setCaregiverForm(c);
                            }}
                            className="p-2 bg-white text-orange-500 rounded-xl border"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Hapus?"))
                                handleAdminAction("DELETE_CAREGIVER", {
                                  id: c.id,
                                });
                            }}
                            className="p-2 bg-white text-red-500 rounded-xl border"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  {activeAdminTab === "assignment" &&
                    assignments
                      .filter((a) => a.status_penugasan === "Aktif")
                      .map((a) => {
                        const p = patients.find((x) => x.id == a.patientId);
                        const c = caregivers.find((x) => x.id == a.caregiverId);
                        return (
                          <div
                            key={a.id}
                            className="p-4 bg-slate-50 rounded-2xl border text-xs"
                          >
                            <div className="flex justify-between font-black uppercase mb-2">
                              <span>{p?.name}</span>
                              <span className="text-[9px] text-slate-400">
                                {a.startDate}
                              </span>
                            </div>
                            <div className="text-indigo-600 font-bold flex items-center gap-1">
                              <UserCircle className="w-3 h-3" /> {c?.name}
                            </div>
                          </div>
                        );
                      })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* DASHBOARD CAREGIVER */
          <div className="space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-indigo-200 font-bold text-[10px] uppercase mb-1">
                  Status: Aktif
                </p>
                <h2 className="text-2xl font-black">{currentUser.data.name}</h2>
              </div>
              <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 text-center">
                <p className="text-[9px] font-black uppercase">Pasien</p>
                <p className="text-2xl font-black">
                  {
                    patients.filter((p) =>
                      assignments.some(
                        (a) =>
                          a.caregiverId == currentUser.data.id &&
                          a.patientId == p.id
                      )
                    ).length
                  }
                </p>
              </div>
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase px-1">
              Tugas Saya
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {patients
                .filter((p) =>
                  assignments.some(
                    (a) =>
                      a.caregiverId == currentUser.data.id &&
                      a.patientId == p.id
                  )
                )
                .map((p) => {
                  const [careLogForm, setCareLogForm] = useState({
                    action: "",
                    vitals: "",
                    notes: "",
                  });
                  const [isLogging, setIsLogging] = useState(false);

                  const handleSaveLog = async (e) => {
                    e.preventDefault();
                    const payload = {
                      ...careLogForm,
                      patientId: p.id,
                      caregiverId: currentUser.data.id,
                      timestamp: new Date().toISOString(),
                    };
                    setIsLoading(true);
                    if (GAS_URL.includes("AKfycb...")) {
                      setCareLogs([
                        { ...payload, id: Date.now() },
                        ...careLogs,
                      ]);
                      setIsLogging(false);
                      setIsLoading(false);
                      return;
                    }
                    try {
                      const res = await fetch(GAS_URL, {
                        method: "POST",
                        headers: { "Content-Type": "text/plain" },
                        body: JSON.stringify({
                          type: "ADD_LOG",
                          data: payload,
                        }),
                      });
                      const result = await res.json();
                      if (result.status === "success") {
                        fetchData();
                        setIsLogging(false);
                      }
                    } catch (e) {
                      alert("Gagal!");
                    } finally {
                      setIsLoading(false);
                    }
                  };

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-black text-xl text-slate-800 uppercase leading-none">
                            {p.name}
                          </h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase mt-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-400" />{" "}
                            {p.address}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedPatient(p)}
                          className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl active:bg-indigo-600 active:text-white"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-6 font-bold text-rose-800 text-sm">
                        {p.condition}
                      </div>
                      {isLogging ? (
                        <form
                          onSubmit={handleSaveLog}
                          className="space-y-3 bg-slate-50 p-4 rounded-2xl"
                        >
                          <input
                            type="text"
                            placeholder="Aksi"
                            className="w-full p-4 rounded-xl border outline-none font-bold text-sm"
                            value={careLogForm.action}
                            onChange={(e) =>
                              setCareLogForm({
                                ...careLogForm,
                                action: e.target.value,
                              })
                            }
                            required
                          />
                          <input
                            type="text"
                            placeholder="Vital"
                            className="w-full p-4 rounded-xl border outline-none font-bold text-sm"
                            value={careLogForm.vitals}
                            onChange={(e) =>
                              setCareLogForm({
                                ...careLogForm,
                                vitals: e.target.value,
                              })
                            }
                          />
                          <textarea
                            placeholder="Catatan..."
                            className="w-full p-4 rounded-xl border outline-none h-32 text-sm"
                            required
                            value={careLogForm.notes}
                            onChange={(e) =>
                              setCareLogForm({
                                ...careLogForm,
                                notes: e.target.value,
                              })
                            }
                          ></textarea>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setIsLogging(false)}
                              className="flex-1 py-4 bg-slate-200 rounded-xl text-xs font-black uppercase"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="flex-1 py-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase shadow-lg"
                            >
                              Simpan
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setIsLogging(true)}
                          className="w-full py-5 flex items-center justify-center gap-3 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase shadow-xl active:scale-95"
                        >
                          <Plus className="w-5 h-5" /> Tulis Log Baru
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>
      <button
        onClick={fetchData}
        className={`fixed bottom-6 right-6 p-5 bg-white rounded-full shadow-2xl border text-indigo-600 z-40 active:scale-75 transition-all ${
          isLoading ? "animate-spin" : ""
        }`}
      >
        <Activity className="w-6 h-6" />
      </button>
    </div>
  );
}
