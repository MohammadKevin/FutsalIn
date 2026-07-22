"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useMemo } from "react";

interface Court {
  id: number;
  name: string;
  floor: string;
  size: string;
  price: number;
  image: string;
  tagline: string;
  description: string;
  features: string[];
  recommendedFor: string;
  lighting: string;
  isActive?: boolean;
}

const DEFAULT_COURTS: Court[] = [
  {
    id: 1,
    name: "Lapangan Standar Interlock",
    floor: "Polypropylene Interlock",
    size: "25m x 15m",
    price: 150000,
    image: "/img/13c3423cd3d2e12a6087d33e14093615.jpg",
    tagline: "Permukaan Anti-Slip & Shock Absorption",
    description: "Lapangan modular Interlock berstandar nasional. Sangat nyaman untuk permainan cepat dengan traksi tinggi, mengurangi risiko cedera lutut dan engkel.",
    features: ["Matras Interlock Premium", "Pencahayaan LED 400 Lux", "Jaring Pengaman High Density", "Garis Batas Standar VNL"],
    recommendedFor: "Latihan Rutin, Sparring Kasual, Komunitas",
    lighting: "LED Day-bright 400 Lux"
  },
  {
    id: 2,
    name: "Lapangan Vinyl Deluxe",
    floor: "Vinyl Premium 8mm",
    size: "25m x 15m",
    price: 200000,
    image: "/img/sintetis.jpg",
    tagline: "Empuk & Pantulan Bola Lebih Stabil",
    description: "Lantai Vinyl multilayer kualitas terbaik dengan bantalan empuk. Ideal untuk gaya permainan teknikal, mengontrol bola lebih mudah dan meredam benturan.",
    features: ["Vinyl Multilayer 8mm", "Shock Absorption System", "Digital Scoreboard Display", "Sound System Surround"],
    recommendedFor: "Turnamen Komunitas, Sparring Resmi, Akademi",
    lighting: "LED Pro Stadium 600 Lux"
  },
  {
    id: 3,
    name: "Lapangan Premier International",
    floor: "Parquet Kayu Hard Maple",
    size: "30m x 20m",
    price: 250000,
    image: "/img/outdor.jpg",
    tagline: "Spesifikasi Kelas Dunia Futsal Profesional",
    description: "Lapangan Parquet Kayu standar FIFA dengan ukuran terluas 30m x 20m. Menyajikan estetika arena kelas profesional dengan tribun penonton dan pencahayaan broadcast.",
    features: ["Lantai Parquet Hard Maple FIFA", "Tribun Penonton VIP", "Broadcasting LED Lighting 800 Lux", "Ruang Ganti Ber-AC & Shower Hot/Cold"],
    recommendedFor: "Turnamen Profesional, Event Resmi, Liga Futsal",
    lighting: "Broadcast LED Stadium 800 Lux"
  },
];

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00"
];

// Slots that are already booked (simulation)
const bookedSlots: Record<number, string[]> = {
  1: ["10:00", "14:00", "18:00"],
  2: ["09:00", "15:00", "21:00"],
  3: ["11:00", "16:00", "19:00"],
};

interface AddonItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  icon: string;
  description: string;
}

const addonOptions: AddonItem[] = [
  { id: "shoes", name: "Sewa Sepatu Futsal", price: 15000, unit: "pasang/main", icon: "👟", description: "Tersedia ukuran 39 - 44, steril & bersih" },
  { id: "vests", name: "Rompi Tanding (2 Warna)", price: 0, unit: "set (GRATIS)", icon: "👕", description: "10 pcs rompi 2 warna pembeda tim" },
  { id: "ball", name: "Bola Match FIFA Spec", price: 20000, unit: "buah/main", icon: "⚽", description: "Bola kualitas pertandingan resmi" },
  { id: "referee", name: "Wasit Lisensi PSSI", price: 100000, unit: "match", icon: "👨‍⚖️", description: "Wasit berpengalaman untuk sparring resmi" },
  { id: "water", name: "Air Mineral Cold Pack", price: 30000, unit: "dus (24 botol)", icon: "🥤", description: "Dingin & siap di pinggir lapangan" },
];

const PROMO_CODES: Record<string, { type: "percent" | "fixed"; value: number; label: string; minTotal?: number }> = {
  FUTSALIN10: { type: "percent", value: 10, label: "Diskon 10% Spesial" },
  MAINMALAM: { type: "fixed", value: 20000, label: "Potongan Rp 20.000 Prime Time", minTotal: 100000 },
  FIRSTMATCH: { type: "fixed", value: 25000, label: "Diskon Member Baru Rp 25.000", minTotal: 120000 },
};

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courtParam = searchParams.get("court");

  const [courts, setCourts] = useState<Court[]>(DEFAULT_COURTS);
  const [selectedCourt, setSelectedCourt] = useState(courtParam ? parseInt(courtParam) : 1);

  useEffect(() => {
    fetch("/api/courts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setCourts(data.data);
        }
      })
      .catch(() => {});
  }, []);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [sessionFilter, setSessionFilter] = useState<"all" | "pagi" | "siang" | "malam">("all");
  const [serverBookedSlots, setServerBookedSlots] = useState<string[]>([]);
  
  // Add-ons
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({
    shoes: false,
    vests: true,
    ball: false,
    referee: false,
    water: false,
  });

  // Voucher
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; label: string; discountAmount: number } | null>(null);
  const [voucherMessage, setVoucherMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form inputs
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Modal court view
  const [modalCourt, setModalCourt] = useState<Court | null>(null);

  // Split bill counter
  const [playerCount, setPlayerCount] = useState(10);

  // Dates computation
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);
  const dayAfterTomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedCourt, selectedDate]);

  useEffect(() => {
    if (!selectedDate) return;
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const bookedForCourtAndDate = data.data
            .filter(
              (b: any) =>
                b.courtId === selectedCourt &&
                b.date === selectedDate &&
                b.status !== "CANCELLED"
            )
            .flatMap((b: any) => b.slots || []);
          setServerBookedSlots(bookedForCourtAndDate);
        }
      })
      .catch(() => {});
  }, [selectedCourt, selectedDate]);

  const court = courts.find((c) => c.id === selectedCourt) || courts[0];
  const staticBooked = selectedDate === todayStr ? (bookedSlots[selectedCourt] || []) : [];
  const booked = useMemo(() => {
    return Array.from(new Set([...staticBooked, ...serverBookedSlots]));
  }, [staticBooked, serverBookedSlots]);

  const toggleSlot = (slot: string) => {
    if (booked.includes(slot)) return;
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot].sort()
    );
  };

  const selectTwoConsecutiveSlots = () => {
    const available = timeSlots.filter(s => !booked.includes(s));
    for (let i = 0; i < available.length - 1; i++) {
      const idx1 = timeSlots.indexOf(available[i]);
      const idx2 = timeSlots.indexOf(available[i + 1]);
      if (idx2 === idx1 + 1) {
        setSelectedSlots([available[i], available[i + 1]]);
        return;
      }
    }
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculations
  const totalHours = selectedSlots.length;
  const courtSubtotal = totalHours * court.price;

  const addonsSubtotal = useMemo(() => {
    return addonOptions.reduce((sum, item) => {
      return selectedAddons[item.id] ? sum + item.price : sum;
    }, 0);
  }, [selectedAddons]);

  const grossTotal = courtSubtotal + addonsSubtotal;

  const discountAmount = useMemo(() => {
    if (!appliedVoucher) return 0;
    const rule = PROMO_CODES[appliedVoucher.code];
    if (!rule) return 0;
    if (rule.minTotal && grossTotal < rule.minTotal) {
      return 0;
    }
    if (rule.type === "percent") {
      return Math.round((grossTotal * rule.value) / 100);
    }
    return Math.min(rule.value, grossTotal);
  }, [appliedVoucher, grossTotal]);

  const totalPrice = Math.max(0, grossTotal - discountAmount);

  const [submitting, setSubmitting] = useState(false);

  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherMessage(null);
    const code = voucherInput.trim().toUpperCase();
    if (!code) {
      setVoucherMessage({ type: "error", text: "Masukkan kode voucher." });
      return;
    }

    try {
      const res = await fetch("/api/voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, grossTotal }),
      });
      const data = await res.json();

      if (data.success) {
        setAppliedVoucher({
          code: data.data.code,
          label: data.data.label,
          discountAmount: data.data.discountAmount,
        });
        setVoucherMessage({ type: "success", text: data.message });
      } else {
        setVoucherMessage({ type: "error", text: data.message || "Voucher tidak valid." });
      }
    } catch {
      // Fallback local rules if API fails
      const promo = PROMO_CODES[code];
      if (promo) {
        const calcDiscount = promo.type === "percent" ? Math.round((grossTotal * promo.value) / 100) : promo.value;
        setAppliedVoucher({ code, label: promo.label, discountAmount: calcDiscount });
        setVoucherMessage({ type: "success", text: `Voucher "${code}" berhasil digunakan!` });
      } else {
        setVoucherMessage({ type: "error", text: "Kode voucher tidak valid. Coba FUTSALIN10 atau MAINMALAM." });
      }
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput("");
    setVoucherMessage(null);
  };

  // Filtered Slots
  const filteredTimeSlots = useMemo(() => {
    if (sessionFilter === "pagi") return timeSlots.filter(s => parseInt(s) >= 8 && parseInt(s) <= 12);
    if (sessionFilter === "siang") return timeSlots.filter(s => parseInt(s) >= 13 && parseInt(s) <= 17);
    if (sessionFilter === "malam") return timeSlots.filter(s => parseInt(s) >= 18 && parseInt(s) <= 21);
    return timeSlots;
  }, [sessionFilter]);

  const isFormComplete = selectedCourt && court?.isActive !== false && selectedDate && selectedSlots.length > 0 && name.trim() && phone.trim() && email.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedCourt) {
      setError("Mohon pilih lapangan.");
      return;
    }
    if (court && court.isActive === false) {
      setError(`Lapangan "${court.name}" sedang dalam pemeliharaan (maintenance) dan tidak dapat dipesan.`);
      return;
    }
    if (!selectedDate) {
      setError("Mohon pilih tanggal bermain.");
      return;
    }
    if (selectedSlots.length === 0) {
      setError("Mohon pilih minimal 1 slot jam bermain.");
      return;
    }
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Mohon lengkapi semua data pemesan (Nama, No WA, dan Email).");
      return;
    }

    const activeAddonsList = addonOptions.filter(a => selectedAddons[a.id]).map(a => a.name);

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: selectedCourt,
          date: selectedDate,
          slots: selectedSlots,
          name,
          phone,
          email,
          addons: activeAddonsList,
          voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!data.success) {
        setError(data.message || "Gagal membuat reservasi. Silakan periksa kembali data Anda.");
        return;
      }

      const bookingCode = data.data ? data.data.bookingCode : `FSI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const params = new URLSearchParams({
        code: bookingCode,
        court: String(selectedCourt),
        date: selectedDate,
        slots: selectedSlots.join(","),
        name,
        phone,
        email,
        total: String(data.data ? data.data.totalPrice : totalPrice),
        addons: activeAddonsList.join("; "),
        discount: String(discountAmount),
        voucher: appliedVoucher ? appliedVoucher.code : "",
      });
      router.push(`/pembayaran?${params.toString()}`);
    } catch {
      setSubmitting(false);
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    }
  };

  return (
    <div className="booking-page">
      {/* Top Nav */}
      <nav className="booking-nav">
        <button onClick={() => router.push("/")} className="back-btn" aria-label="Kembali ke beranda">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali
        </button>
        <div className="booking-logo" onClick={() => router.push("/")}>Futsal<span>In</span></div>
        <div className="booking-steps">
          <span className="step active">
            <span className="step-num">1</span> Pilih Jadwal
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span className="step">
            <span className="step-num">2</span> Pembayaran
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span className="step">
            <span className="step-num">3</span> Konfirmasi Tiket
          </span>
        </div>
      </nav>

      <div className="booking-body">
        {/* LEFT: Form */}
        <form id="booking-form" onSubmit={handleSubmit} className="booking-form-wrap">
          <div className="booking-header">
            <h1 className="booking-title">Reservasi Lapangan Futsal</h1>
            <p className="booking-subtitle">Pilih spesifikasi arena, tentukan waktu bermain, dan lengkapi data pemesan secara mudah.</p>
          </div>

          {/* 1. Court Selector */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-label">
                <span className="section-badge">1</span> Pilih Arena Lapangan
              </div>
              <span className="section-hint">Semua lapangan berstandar resmi</span>
            </div>
            
            <div className="court-selector-grid">
              {courts.map((c) => {
                const isSelected = selectedCourt === c.id;
                const isMaintenance = c.isActive === false;
                return (
                  <div
                    key={c.id}
                    className={`court-select-card ${isSelected ? "selected" : ""} ${isMaintenance ? "in-maintenance" : ""}`}
                    onClick={() => {
                      setSelectedCourt(c.id);
                      if (isMaintenance) {
                        setError(`Lapangan "${c.name}" sedang dalam pemeliharaan (maintenance) dan tidak dapat dipesan.`);
                      } else {
                        setError("");
                      }
                    }}
                  >
                    <div className="court-card-image-wrap">
                      <img src={c.image} alt={c.name} className="court-select-img" />
                      {isSelected && !isMaintenance && (
                        <div className="court-select-check">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                      {isMaintenance ? (
                        <>
                          <div className="court-badge-tag maintenance">🔧 Pemeliharaan</div>
                          <div className="court-card-maintenance-overlay">
                            <span className="ccm-icon">🔒</span>
                            <span className="ccm-badge">TUTUP / MAINTENANCE</span>
                            <span className="ccm-sub">Sedang Dalam Perbaikan</span>
                          </div>
                        </>
                      ) : (
                        <div className="court-badge-tag">{c.floor}</div>
                      )}
                    </div>

                    <div className="court-select-info">
                      <div className="court-select-name">{c.name}</div>
                      <div className="court-select-tagline">{c.tagline}</div>
                      <div className="court-select-meta">
                        <span>📐 {c.size}</span>
                        <span>💡 {c.lighting.split(' ')[0]}</span>
                      </div>
                      <div className="court-select-footer">
                        <div className="court-select-price">
                          {formatRupiah(c.price)}<span>/jam</span>
                        </div>
                        <button
                          type="button"
                          className="btn-spec-detail"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalCourt(c);
                          }}
                        >
                          Spesifikasi
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {court?.isActive === false && (
              <div className="maintenance-notice-bar animate-fade-in-up">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>
                  <strong>Lapangan sedang dalam Pemeliharaan (Maintenance).</strong> Silakan pilih arena lapangan lain yang tersedia.
                </span>
              </div>
            )}
          </div>

          {/* 2. Date Selector */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-label">
                <span className="section-badge">2</span> Tanggal Bermain
              </div>
              {selectedDate && (
                <div className="selected-date-badge">
                  🗓️ {new Date(selectedDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </div>
              )}
            </div>

            <div className="date-selection-box">
              <div className="date-quick-chips">
                <button
                  type="button"
                  className={`date-chip ${selectedDate === todayStr ? "active" : ""}`}
                  onClick={() => setSelectedDate(todayStr)}
                >
                  <span>Hari Ini</span>
                  <small>{new Date(todayStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</small>
                </button>
                <button
                  type="button"
                  className={`date-chip ${selectedDate === tomorrowStr ? "active" : ""}`}
                  onClick={() => setSelectedDate(tomorrowStr)}
                >
                  <span>Besok</span>
                  <small>{new Date(tomorrowStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</small>
                </button>
                <button
                  type="button"
                  className={`date-chip ${selectedDate === dayAfterTomorrowStr ? "active" : ""}`}
                  onClick={() => setSelectedDate(dayAfterTomorrowStr)}
                >
                  <span>Lusa</span>
                  <small>{new Date(dayAfterTomorrowStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</small>
                </button>
              </div>

              <div className="date-picker-wrap">
                <label className="date-picker-label">Atau Pilih Tanggal Lain:</label>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input custom-date-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. Time Slots */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-label">
                <span className="section-badge">3</span> Pilih Slot Jam Bermain
              </div>
              {court?.isActive !== false && (
                <div className="slot-legend">
                  <span className="legend-item available">Tersedia</span>
                  <span className="legend-item booked">Terisi</span>
                  <span className="legend-item picked">Dipilih</span>
                </div>
              )}
            </div>

            {court?.isActive === false ? (
              <div className="maintenance-block-card animate-fade-in-up">
                <div className="mbc-icon">🛠️</div>
                <h3 className="mbc-title">LAPANGAN SEDANG DALAM PEMELIHARAAN (MAINTENANCE)</h3>
                <p className="mbc-desc">
                  Arena <strong>{court.name}</strong> sedang dalam perbaikan dan perawatan fasilitas oleh tim teknis kami. Pemesanan slot jam untuk arena ini sementara <strong>DIBLOKIR</strong>.
                </p>
                <button
                  type="button"
                  className="btn-gold"
                  onClick={() => {
                    const availableCourt = courts.find((c) => c.isActive !== false);
                    if (availableCourt) {
                      setSelectedCourt(availableCourt.id);
                      setError("");
                    }
                  }}
                >
                  PILIH LAPANGAN LAIN YANG TERSEDIA
                </button>
              </div>
            ) : (
              <>
                {/* Session Tabs & Helpers */}
                <div className="session-bar">
                  <div className="session-tabs">
                    <button
                      type="button"
                      className={`session-tab ${sessionFilter === "all" ? "active" : ""}`}
                      onClick={() => setSessionFilter("all")}
                    >
                      Semua Jam
                    </button>
                    <button
                      type="button"
                      className={`session-tab ${sessionFilter === "pagi" ? "active" : ""}`}
                      onClick={() => setSessionFilter("pagi")}
                    >
                      🌅 Pagi (08-12)
                    </button>
                    <button
                      type="button"
                      className={`session-tab ${sessionFilter === "siang" ? "active" : ""}`}
                      onClick={() => setSessionFilter("siang")}
                    >
                      ☀️ Siang (13-17)
                    </button>
                    <button
                      type="button"
                      className={`session-tab ${sessionFilter === "malam" ? "active" : ""}`}
                      onClick={() => setSessionFilter("malam")}
                    >
                      🌙 Malam Prime Time (18-21)
                    </button>
                  </div>

                  <div className="slot-helper-actions">
                    <button
                      type="button"
                      onClick={selectTwoConsecutiveSlots}
                      className="btn-slot-quick"
                      title="Pilih otomatis 2 jam berurutan yang tersedia"
                    >
                      ⚡ Pilih 2 Jam Langsung
                    </button>
                    {selectedSlots.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedSlots([])}
                        className="btn-slot-clear"
                      >
                        Reset Slot ({selectedSlots.length})
                      </button>
                    )}
                  </div>
                </div>

                <div className="slots-grid">
                  {filteredTimeSlots.map((slot) => {
                    const isBooked = booked.includes(slot);
                    const isSelected = selectedSlots.includes(slot);
                    const isPrimeTime = parseInt(slot) >= 18;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        onClick={() => toggleSlot(slot)}
                        className={`slot-btn ${isBooked ? "booked" : ""} ${isSelected ? "picked" : ""} ${isPrimeTime ? "prime-time" : ""}`}
                      >
                        <span className="slot-time-text">{slot}</span>
                        {isBooked ? (
                          <span className="slot-status">Terisi</span>
                        ) : isSelected ? (
                          <span className="slot-status">Dipilih ✓</span>
                        ) : isPrimeTime ? (
                          <span className="slot-badge-prime">Prime Time</span>
                        ) : (
                          <span className="slot-status">Tersedia</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* 4. Equipment & Addons Rental */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-label">
                <span className="section-badge">4</span> Sewa Equipment & Layanan Tambahan
              </div>
              <span className="section-hint">Opsional · Tambahkan sesuai kebutuhan</span>
            </div>

            <div className="addons-grid">
              {addonOptions.map((addon) => {
                const isChecked = selectedAddons[addon.id] || false;
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`addon-card ${isChecked ? "active" : ""}`}
                  >
                    <div className="addon-checkbox">
                      {isChecked ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : null}
                    </div>
                    <span className="addon-icon">{addon.icon}</span>
                    <div className="addon-info">
                      <div className="addon-title">{addon.name}</div>
                      <div className="addon-desc">{addon.description}</div>
                      <div className="addon-price">
                        {addon.price === 0 ? "GRATIS" : formatRupiah(addon.price)} <small>/ {addon.unit}</small>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Data Pemesan */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-label">
                <span className="section-badge">5</span> Data Pemesan (Contact Info)
              </div>
              <span className="section-hint">E-Tiket & konfirmasi akan dikirimkan via WA/Email</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nama Lengkap Pemesan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nomor WhatsApp *</label>
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Alamat Email *</label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="form-error animate-fade-in-up">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* RIGHT: Dynamic Summary Sidebar */}
        <div className="booking-summary">
          <div className="summary-card">
            <div className="summary-title">
              <span>Ringkasan Booking</span>
              <div className="summary-status-tag">
                {isFormComplete ? "✓ Siap Lanjut" : "Lengkapi Form"}
              </div>
            </div>

            {/* Selected Court Preview */}
            <div className="summary-court-box">
              <img src={court.image} alt={court.name} className="summary-court-img" />
              <div className="summary-court-details">
                <div className="summary-court-name">{court.name}</div>
                <div className="summary-court-meta">{court.floor} · {court.size}</div>
                <div className="summary-court-rate">{formatRupiah(court.price)} / jam</div>
              </div>
            </div>

            <div className="summary-divider" />

            {/* Schedule Details */}
            <div className="summary-row">
              <span className="s-label">Tanggal Bermain</span>
              <span className="s-val">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                  : <em className="muted">Pilih tanggal</em>}
              </span>
            </div>

            <div className="summary-row">
              <span className="s-label">Slot Waktu ({totalHours} jam)</span>
              <span className="s-val slot-badges">
                {selectedSlots.length > 0 ? (
                  selectedSlots.map((s) => <span key={s} className="s-slot-chip">{s}</span>)
                ) : (
                  <em className="muted">Pilih slot jam</em>
                )}
              </span>
            </div>

            {/* Addons List */}
            {Object.values(selectedAddons).some(Boolean) && (
              <>
                <div className="summary-divider" />
                <div className="summary-addons-section">
                  <div className="summary-subhead">Add-ons & Equipment:</div>
                  {addonOptions.map((a) => {
                    if (!selectedAddons[a.id]) return null;
                    return (
                      <div key={a.id} className="summary-addon-row">
                        <span>{a.icon} {a.name}</span>
                        <span>{a.price === 0 ? "GRATIS" : formatRupiah(a.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="summary-divider" />

            {/* Promo Code Input Box */}
            <div className="promo-box">
              <div className="promo-box-title">Gunakan Kode Promo</div>
              {!appliedVoucher ? (
                <form onSubmit={handleApplyVoucher} className="promo-input-row">
                  <input
                    type="text"
                    placeholder="Contoh: FUTSALIN10"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    className="promo-input"
                  />
                  <button type="submit" className="btn-promo-apply">Pakai</button>
                </form>
              ) : (
                <div className="applied-voucher-badge">
                  <div>
                    <span className="av-code">🎟️ {appliedVoucher.code}</span>
                    <span className="av-label">{appliedVoucher.label}</span>
                  </div>
                  <button type="button" onClick={removeVoucher} className="btn-remove-voucher" title="Hapus voucher">✕</button>
                </div>
              )}

              {voucherMessage && (
                <div className={`voucher-msg ${voucherMessage.type}`}>
                  {voucherMessage.text}
                </div>
              )}
            </div>

            <div className="summary-divider" />

            {/* Price Calculations */}
            <div className="summary-price-breakdown">
              <div className="summary-row">
                <span>Subtotal Lapangan ({totalHours} jam)</span>
                <span>{formatRupiah(courtSubtotal)}</span>
              </div>
              {addonsSubtotal > 0 && (
                <div className="summary-row">
                  <span>Subtotal Add-ons</span>
                  <span>{formatRupiah(addonsSubtotal)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="summary-row discount-row">
                  <span>Diskon Promo</span>
                  <span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div className="summary-row summary-total">
                <span>Total Pembayaran</span>
                <span className="total-highlight">{formatRupiah(totalPrice)}</span>
              </div>
            </div>

            {totalPrice > 0 && (
              <div className="split-bill-card">
                <div className="sb-title">
                  <span>⚽ Estimasi Patungan Tim</span>
                </div>
                <div className="sb-controls">
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Pemain:</span>
                  <div className="sb-counter">
                    <button
                      type="button"
                      className="sb-btn"
                      onClick={() => setPlayerCount((p) => Math.max(2, p - 1))}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: "800", color: "#fff", fontSize: "0.88rem" }}>{playerCount} Orang</span>
                    <button
                      type="button"
                      className="sb-btn"
                      onClick={() => setPlayerCount((p) => Math.min(20, p + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.6rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>Per Pemain:</span>
                  <span style={{ fontWeight: "900", color: "var(--color-green-neon)", fontSize: "1.05rem" }}>
                    {formatRupiah(Math.ceil(totalPrice / playerCount))}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              form="booking-form"
              disabled={submitting}
              onClick={(e) => {
                e.preventDefault();
                const form = document.querySelector<HTMLFormElement>("form#booking-form");
                if (form) {
                  form.requestSubmit();
                }
              }}
              className="btn-gold summary-btn"
            >
              {submitting ? "MEMPROSES RESERVASI..." : "LANJUT KE PEMBAYARAN"}
            </button>

            <div className="summary-guarantee">
              <div className="sg-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Jaminan Booking Langsung Terverifikasi
              </div>
              <div className="sg-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Konfirmasi Instan via WhatsApp & Email
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Court Specifications */}
      {modalCourt && (
        <div className="modal-backdrop" onClick={() => setModalCourt(null)}>
          <div className="modal-content animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setModalCourt(null)}>✕</button>

            <div className="modal-header">
              <img src={modalCourt.image} alt={modalCourt.name} className="modal-court-img" />
              <div className="modal-court-title-box">
                <h2 className="modal-court-title">{modalCourt.name}</h2>
                <div className="modal-court-tagline">{modalCourt.tagline}</div>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-spec-grid">
                <div className="spec-card">
                  <span className="spec-card-icon">🧱</span>
                  <div>
                    <div className="spec-card-label">Tipe Lantai</div>
                    <div className="spec-card-val">{modalCourt.floor}</div>
                  </div>
                </div>
                <div className="spec-card">
                  <span className="spec-card-icon">📐</span>
                  <div>
                    <div className="spec-card-label">Ukuran Arena</div>
                    <div className="spec-card-val">{modalCourt.size}</div>
                  </div>
                </div>
                <div className="spec-card">
                  <span className="spec-card-icon">💡</span>
                  <div>
                    <div className="spec-card-label">Pencahayaan</div>
                    <div className="spec-card-val">{modalCourt.lighting}</div>
                  </div>
                </div>
                <div className="spec-card">
                  <span className="spec-card-icon">💰</span>
                  <div>
                    <div className="spec-card-label">Tarif Per Jam</div>
                    <div className="spec-card-val highlight">{formatRupiah(modalCourt.price)}</div>
                  </div>
                </div>
              </div>

              <div className="modal-desc-box">
                <h3>Deskripsi Arena</h3>
                <p>{modalCourt.description}</p>
              </div>

              <div className="modal-features-box">
                <h3>Fasilitas & Keunggulan Utama</h3>
                <div className="modal-features-list">
                  {modalCourt.features.map((feat, idx) => (
                    <div key={idx} className="modal-feature-item">
                      <span className="feat-check">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-recommend-box">
                <strong>🎯 Rekomendasi Penggunaan:</strong> {modalCourt.recommendedFor}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-gold full-width"
                onClick={() => {
                  setSelectedCourt(modalCourt.id);
                  setModalCourt(null);
                }}
              >
                PILIH LAPANGAN INI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingClient() {
  return (
    <Suspense fallback={<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",color:"#00f59b",fontSize:"1.1rem"}}>Memuat Arena FutsalIn...</div>}>
      <BookingForm />
    </Suspense>
  );
}
