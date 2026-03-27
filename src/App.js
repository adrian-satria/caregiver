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
  // GANTI TEKS DI BAWAH INI DENGAN WEB APP URL FULL MILIK ANDA (TANPA TITIK TIGA "...")
  const GAS_URL =
    "https://script.google.com/macros/s/AKfycbwyq2Dyt1GZ5nlIGLC7TtFsVnnd-9_j9xPQIubQQmywpE2diR8ZBa3MRuK3sb7us_ScRQ/exec";
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
  }, []);

  // --- STATE UTAMA ---
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [loginStep, setLoginStep] = useState("role");
  const [tempCaregiver, setTempCaregiver] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [patients, setPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [careLogs, setCareLogs] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Admin & Caregiver Form States
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
  const [careLogForm, setCareLogForm] = useState({
    patientId: null,
    action: "",
    vitals: "",
    notes: "",
  });

  useEffect(() => {
    const checkTailwind = setInterval(() => {
      if (window.tailwind) {
        setIsReady(true);
        clearInterval(checkTailwind);
      }
    }, 100);
    return () => clearInterval(checkTailwind);
  }, []);

  // --- FUNGSI MOCK DATA (Fallback jika fetch gagal) ---
  const loadMockData = () => {
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
  };

  const fetchData = async () => {
    // Mengecek apakah URL belum diganti atau masih memuat format terpotong
    if (
      !GAS_URL ||
      GAS_URL.includes("MASUKKAN_URL") ||
      GAS_URL.includes("...")
    ) {
      loadMockData();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(GAS_URL);
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();

      if (result.status === "success") {
        setPatients(result.patients || []);
        setCaregivers(result.caregivers || []);
        setAssignments(result.assignments || []);
        setCareLogs(
          (result.careLogs || []).sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          )
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) fetchData();
  }, [isReady]);

  // --- HANDLERS ---
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
      setLoginError("Sandi Salah!");
    }
  };

  const resetForms = () => {
    setEditId(null);
    setPatientForm({ name: "", age: "", condition: "", address: "" });
    setCaregiverForm({ name: "", phone: "", password: "", status: "Aktif" });
    setAssignForm({ patientId: "", caregiverId: "" });
    setCareLogForm({ patientId: null, action: "", vitals: "", notes: "" });
  };

  const handleAction = async (type, data) => {
    setIsLoading(true);
    // Pengecekan URL wajib valid
    if (
      !GAS_URL ||
      GAS_URL.includes("MASUKKAN_URL") ||
      GAS_URL.includes("...")
    ) {
      alert(
        "Penyimpanan Gagal: Anda belum memasukkan URL Google Apps Script yang valid (GAS_URL) ke dalam kode sumber."
      );
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
      } else {
        alert("Server Error: " + (result.message || "Gagal menyimpan"));
      }
    } catch (e) {
      alert(
        "Koneksi Gagal! Pastikan Web App URL benar dan pengaturan izin Apps Script diset ke 'Anyone'."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isReady)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Activity className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );

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
                <option value="">-- PILIH NAMA --</option>
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
                  className="w-full p-5 border-2 rounded-[1.5rem] bg-slate-50 outline-none font-bold text-center text-sm pr-12"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
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
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase shadow-xl"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  setLoginStep("role");
                  setPasswordInput("");
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 selection:bg-indigo-100">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-4 sm:px-6 h-20 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            setSelectedPatient(null);
            fetchData();
          }}
        >
          <div className="p-2.5 bg-indigo-600 rounded-2xl">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg uppercase">CareSync</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-3 bg-rose-50 text-rose-600 rounded-2xl"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-sm">
        {selectedPatient ? (
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <button
              onClick={() => setSelectedPatient(null)}
              className="mb-6 flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase"
            >
              &larr; Kembali
            </button>
            <h2 className="text-3xl font-black text-slate-800 uppercase mb-4">
              {selectedPatient.name}
            </h2>
            <div className="space-y-6 border-l-2 border-slate-100 ml-3 pl-6">
              {careLogs
                .filter((l) => l.patientid == selectedPatient.id)
                .map((log, i) => (
                  <div key={i} className="relative">
                    <div className="absolute w-4 h-4 bg-indigo-500 rounded-full -left-[33px] top-1 border-4 border-white shadow-sm"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">
                      {new Date(log.timestamp).toLocaleDateString()} •{" "}
                      {caregivers.find((c) => c.id == log.caregiverid)?.name}
                    </p>
                    <div className="bg-slate-50 p-4 rounded-2xl mt-1">
                      <p className="font-black text-indigo-900 uppercase text-xs">
                        {log.action}
                      </p>
                      <p className="italic text-slate-600">"{log.notes}"</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : currentUser.role === "admin" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 bg-white p-1 rounded-2xl border mb-6">
              {["assignment", "patient", "caregiver"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveAdminTab(tab);
                    resetForms();
                  }}
                  className={`py-3 text-[10px] font-black uppercase rounded-xl ${
                    activeAdminTab === tab
                      ? "bg-slate-900 text-white"
                      : "text-slate-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {activeAdminTab === "patient" && (
              <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
                <h2 className="text-lg font-black mb-6 uppercase">
                  {editId ? "Edit Pasien" : "Daftar Pasien Baru"}
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAction(
                      editId ? "UPDATE_PATIENT" : "ADD_PATIENT",
                      editId ? { ...patientForm, id: editId } : patientForm
                    );
                  }}
                  className="space-y-4"
                >
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
                    className="w-full p-4 bg-slate-50 border rounded-2xl h-24"
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
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase"
                  >
                    {isLoading ? "Loading..." : "Simpan"}
                  </button>
                </form>
                <div className="mt-8 space-y-2">
                  {patients.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center"
                    >
                      <span className="font-bold uppercase text-xs">
                        {p.name}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditId(p.id);
                            setPatientForm(p);
                          }}
                          className="p-2 text-orange-500"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Hapus?"))
                              handleAction("DELETE_PATIENT", { id: p.id });
                          }}
                          className="p-2 text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeAdminTab === "caregiver" && (
              <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
                <h2 className="text-lg font-black mb-6 uppercase">
                  Kelola Pramurukti
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAction(
                      editId ? "UPDATE_CAREGIVER" : "ADD_CAREGIVER",
                      editId ? { ...caregiverForm, id: editId } : caregiverForm
                    );
                  }}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    placeholder="Nama"
                    className="w-full p-4 bg-slate-50 border rounded-2xl"
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
                    className="w-full p-4 bg-slate-50 border rounded-2xl"
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
                    className="w-full p-4 bg-slate-50 border rounded-2xl"
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
                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase"
                  >
                    Simpan
                  </button>
                </form>
                <div className="mt-8 space-y-2">
                  {caregivers.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center"
                    >
                      <span className="font-bold text-xs">{c.name}</span>
                      <button
                        onClick={() => {
                          setEditId(c.id);
                          setCaregiverForm(c);
                        }}
                        className="p-2 text-orange-500"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeAdminTab === "assignment" && (
              <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
                <h2 className="text-lg font-black mb-6 uppercase">
                  Tugaskan Pramurukti
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAction("ADD_ASSIGNMENT", assignForm);
                  }}
                  className="space-y-4"
                >
                  <select
                    className="w-full p-4 bg-slate-50 border rounded-2xl"
                    value={assignForm.patientId}
                    onChange={(e) =>
                      setAssignForm({
                        ...assignForm,
                        patientId: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Pilih Pasien</option>
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
                      setAssignForm({
                        ...assignForm,
                        caregiverId: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Pilih Caregiver</option>
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
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase"
                  >
                    Simpan
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 uppercase">
              Tugas Saya
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {patients
                .filter((p) =>
                  assignments.some(
                    (a) =>
                      a.caregiverid == currentUser.data.id &&
                      a.patientid == p.id
                  )
                )
                .map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-[2rem] border shadow-sm p-6"
                  >
                    <div className="flex justify-between mb-4">
                      <div>
                        <h4 className="font-black text-xl uppercase">
                          {p.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {p.address}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedPatient(p)}
                        className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"
                      >
                        <FileText size={20} />
                      </button>
                    </div>
                    <div className="bg-rose-50 p-4 rounded-2xl mb-6 text-sm font-bold text-rose-800">
                      {p.condition}
                    </div>
                    {careLogForm.patientId === p.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAction("ADD_LOG", careLogForm);
                        }}
                        className="space-y-3 bg-slate-50 p-4 rounded-2xl"
                      >
                        <input
                          type="text"
                          placeholder="Aksi"
                          className="w-full p-4 border rounded-xl"
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
                          className="w-full p-4 border rounded-xl"
                          value={careLogForm.vitals}
                          onChange={(e) =>
                            setCareLogForm({
                              ...careLogForm,
                              vitals: e.target.value,
                            })
                          }
                        />
                        <textarea
                          placeholder="Catatan"
                          className="w-full p-4 border rounded-xl"
                          value={careLogForm.notes}
                          onChange={(e) =>
                            setCareLogForm({
                              ...careLogForm,
                              notes: e.target.value,
                            })
                          }
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCareLogForm({ patientId: null })}
                            className="flex-1 py-4 bg-slate-200 rounded-xl"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-4 bg-indigo-600 text-white rounded-xl"
                          >
                            Simpan
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() =>
                          setCareLogForm({
                            patientId: p.id,
                            action: "",
                            vitals: "",
                            notes: "",
                          })
                        }
                        className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase"
                      >
                        Tambah Log
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
      <button
        onClick={fetchData}
        className={`fixed bottom-6 right-6 p-5 bg-white rounded-full shadow-2xl border ${
          isLoading ? "animate-spin" : ""
        }`}
      >
        <Activity size={24} />
      </button>
    </div>
  );
}
