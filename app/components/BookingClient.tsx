"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

const courts = [
  { id: 1, name: "Lapangan Standar", floor: "Interlock", size: "25m x 15m", price: 150000, image: "/img/13c3423cd3d2e12a6087d33e14093615.jpg" },
  { id: 2, name: "Lapangan Vinyl Deluxe", floor: "Vinyl Premium", size: "25m x 15m", price: 200000, image: "/img/sintetis.jpg" },
  { id: 3, name: "Lapangan Premier International", floor: "Parquet", size: "30m x 20m", price: 250000, image: "/img/outdor.jpg" },
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

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courtParam = searchParams.get("court");

  const [selectedCourt, setSelectedCourt] = useState(courtParam ? parseInt(courtParam) : 1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Set min date to today
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedCourt, selectedDate]);

  const court = courts.find((c) => c.id === selectedCourt)!;
  const booked = bookedSlots[selectedCourt] || [];

  const toggleSlot = (slot: string) => {
    if (booked.includes(slot)) return;
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const totalHours = selectedSlots.length;
  const totalPrice = totalHours * court.price;

  const formatRupiah = (n: number) =>
    "Rp " + n.toLocaleString("id-ID");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Mohon lengkapi semua data diri.");
      return;
    }
    if (!selectedDate) {
      setError("Mohon pilih tanggal bermain.");
      return;
    }
    if (selectedSlots.length === 0) {
      setError("Mohon pilih minimal 1 slot jam.");
      return;
    }

    // Pass booking data to payment page via query params
    const params = new URLSearchParams({
      court: String(selectedCourt),
      date: selectedDate,
      slots: selectedSlots.join(","),
      name,
      phone,
      email,
      total: String(totalPrice),
    });
    router.push(`/pembayaran?${params.toString()}`);
  };

  return (
    <div className="booking-page">
      {/* Top Nav */}
      <nav className="booking-nav">
        <button onClick={() => router.push("/")} className="back-btn" aria-label="Kembali">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali
        </button>
        <div className="booking-logo">Futsal<span>In</span></div>
        <div className="booking-steps">
          <span className="step active">1. Pilih Jadwal</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span className="step">2. Pembayaran</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span className="step">3. Konfirmasi</span>
        </div>
      </nav>

      <div className="booking-body">
        {/* LEFT: Form */}
        <form id="booking-form" onSubmit={handleSubmit} className="booking-form-wrap">
          <h1 className="booking-title">Pilih Lapangan & Jadwal</h1>

          {/* Court Selector */}
          <div className="form-section">
            <div className="form-section-label">Pilih Lapangan</div>
            <div className="court-selector-grid">
              {courts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCourt(c.id)}
                  className={`court-select-card ${selectedCourt === c.id ? "selected" : ""}`}
                >
                  <img src={c.image} alt={c.name} className="court-select-img" />
                  <div className="court-select-info">
                    <div className="court-select-name">{c.name}</div>
                    <div className="court-select-detail">{c.floor} · {c.size}</div>
                    <div className="court-select-price">{formatRupiah(c.price)}/jam</div>
                  </div>
                  {selectedCourt === c.id && (
                    <div className="court-select-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="form-section">
            <div className="form-section-label">Tanggal Bermain</div>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Time Slots */}
          <div className="form-section">
            <div className="form-section-label">
              Pilih Slot Jam
              <span className="slot-legend">
                <span className="legend-item available">Tersedia</span>
                <span className="legend-item booked">Terisi</span>
                <span className="legend-item picked">Dipilih</span>
              </span>
            </div>
            <div className="slots-grid">
              {timeSlots.map((slot) => {
                const isBooked = booked.includes(slot);
                const isSelected = selectedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBooked}
                    onClick={() => toggleSlot(slot)}
                    className={`slot-btn ${isBooked ? "booked" : ""} ${isSelected ? "picked" : ""}`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data Diri */}
          <div className="form-section">
            <div className="form-section-label">Data Pemesan</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nomor WhatsApp</label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
        </form>

        {/* RIGHT: Summary */}
        <div className="booking-summary">
          <div className="summary-card">
            <div className="summary-title">Ringkasan Booking</div>
            <img src={court.image} alt={court.name} className="summary-court-img" />
            <div className="summary-court-name">{court.name}</div>
            <div className="summary-court-meta">{court.floor} · {court.size}</div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Tanggal</span>
              <span>{selectedDate ? new Date(selectedDate).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : "-"}</span>
            </div>
            <div className="summary-row">
              <span>Slot Waktu</span>
              <span>{selectedSlots.length > 0 ? selectedSlots.join(", ") : "-"}</span>
            </div>
            <div className="summary-row">
              <span>Durasi</span>
              <span>{totalHours} jam</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatRupiah(totalPrice)}</span>
            </div>

            <button
              type="submit"
              form="booking-form"
              onClick={(e) => {
                e.preventDefault();
                const form = document.querySelector<HTMLFormElement>("form.booking-form-wrap");
                if (form) {
                  const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
                  form.dispatchEvent(submitEvent);
                }
              }}
              className="btn-gold summary-btn"
            >
              LANJUT KE PEMBAYARAN
            </button>

            <div className="summary-secure">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Transaksi aman & terenkripsi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingClient() {
  return (
    <Suspense fallback={<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",color:"#c9a84c",fontSize:"1.1rem"}}>Memuat...</div>}>
      <BookingForm />
    </Suspense>
  );
}
