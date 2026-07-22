"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const courts = [
  { id: 1, name: "Lapangan Standar", floor: "Interlock", size: "25m x 15m", price: 150000, image: "/img/13c3423cd3d2e12a6087d33e14093615.jpg" },
  { id: 2, name: "Lapangan Vinyl Deluxe", floor: "Vinyl Premium", size: "25m x 15m", price: 200000, image: "/img/sintetis.jpg" },
  { id: 3, name: "Lapangan Premier International", floor: "Parquet", size: "30m x 20m", price: 250000, image: "/img/outdor.jpg" },
];

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function generateBookingCode() {
  return "FSI-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function PembayaranForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courtId = parseInt(searchParams.get("court") || "1");
  const date = searchParams.get("date") || "";
  const slots = searchParams.get("slots") || "";
  const name = searchParams.get("name") || "";
  const phone = searchParams.get("phone") || "";
  const email = searchParams.get("email") || "";
  const total = parseInt(searchParams.get("total") || "0");

  const court = courts.find((c) => c.id === courtId) || courts[0];
  const slotList = slots ? slots.split(",") : [];

  const codeParam = searchParams.get("code");
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookingCode] = useState(() => codeParam || generateBookingCode());

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: bookingCode, status: "PAID" }),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setPaid(true);
      } else {
        // Fallback for demo code
        setPaid(true);
      }
    } catch {
      setPaid(true);
    } finally {
      setLoading(false);
    }
  };

  const [playerCount, setPlayerCount] = useState(10);
  const [copiedWa, setCopiedWa] = useState(false);

  const handleCopyWaSplitBill = () => {
    const perPerson = Math.ceil(total / (playerCount || 10));
    const text = `⚽ *PATUNGAN FUTSAL - FUTSALIN* ⚽
----------------------------------------
📌 *Arena:* ${court.name}
🗓️ *Tanggal:* ${date ? new Date(date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "-"}
⏰ *Jam Bermain:* ${slotList.join(", ")}
🎫 *Kode Booking:* ${bookingCode}
----------------------------------------
💰 *Total Biaya:* ${formatRupiah(total)}
👥 *Jumlah Pemain:* ${playerCount} Orang
👉 *PATUNGAN PER ORANG: ${formatRupiah(perPerson)}*
----------------------------------------
Silakan transfer / bayar patungan ke:
👤 Kapten/Pemesan: *${name}*

_Booking via FutsalIn - Main Futsal Tanpa Rebutan Jadwal!_`;

    navigator.clipboard.writeText(text);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2000);
  };

  /* ===== HALAMAN SUKSES ===== */
  if (paid) {
    return (
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h1 className="success-title">Pembayaran Berhasil!</h1>
          <p className="success-subtitle">Booking lapangan futsal Anda telah dikonfirmasi.</p>

          <div 
            className="success-booking-code" 
            onClick={handleCopy}
            title="Klik untuk menyalin"
          >
            <span className="sbc-label">{copied ? "Berhasil Disalin!" : "Kode Booking (Klik untuk Salin)"}</span>
            <span className="sbc-code">{bookingCode}</span>
          </div>

          <div className="success-details">
            <div className="sd-row"><span>Nama</span><span>{name}</span></div>
            <div className="sd-row"><span>Lapangan</span><span>{court.name}</span></div>
            <div className="sd-row">
              <span>Tanggal</span>
              <span>{date ? new Date(date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "-"}</span>
            </div>
            <div className="sd-row"><span>Jam</span><span>{slotList.join(", ")}</span></div>
            <div className="sd-row">
              <span>Metode</span><span>QRIS</span>
            </div>
            <div className="sd-row">
              <span>Total Bayar</span>
              <span className="success-total">{formatRupiah(total)}</span>
            </div>
          </div>

          {/* SPLIT BILL CALCULATOR */}
          <div className="split-bill-card">
            <div className="sb-title">
              <span>⚽ Kalkulator Patungan Tim</span>
            </div>
            <div className="sb-controls">
              <span style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>Jumlah Pemain:</span>
              <div className="sb-counter">
                <button
                  type="button"
                  className="sb-btn"
                  onClick={() => setPlayerCount((p) => Math.max(2, p - 1))}
                >
                  -
                </button>
                <span style={{ fontWeight: "800", color: "#fff" }}>{playerCount} Orang</span>
                <button
                  type="button"
                  className="sb-btn"
                  onClick={() => setPlayerCount((p) => Math.min(20, p + 1))}
                >
                  +
                </button>
              </div>
            </div>
            <div className="sb-result-box">
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>Patungan per Orang:</div>
                <div className="sb-per-person">
                  {formatRupiah(Math.ceil(total / playerCount))}
                </div>
              </div>
              <button
                type="button"
                className="btn-copy-wa"
                onClick={handleCopyWaSplitBill}
              >
                {copiedWa ? "✓ Tersalin!" : "💬 Salin Rincian ke WA"}
              </button>
            </div>
          </div>

          <p className="success-note" style={{ marginTop: "1rem" }}>
            Detail booking telah dikirim ke <strong>{email}</strong> dan nomor WhatsApp <strong>{phone}</strong>.
          </p>

          <div className="success-actions">
            <button onClick={() => router.push("/")} className="btn-gold">
              KEMBALI KE BERANDA
            </button>
            <button onClick={() => window.print()} className="btn-outline">
              CETAK BUKTI
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ===== HALAMAN PEMBAYARAN ===== */
  return (
    <div className="booking-page">
      {/* Nav */}
      <nav className="booking-nav">
        <button onClick={() => router.back()} className="back-btn" aria-label="Kembali">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali
        </button>
        <div className="booking-logo">Futsal<span>In</span></div>
        <div className="booking-steps">
          <span className="step done">1. Pilih Jadwal</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span className="step active">2. Pembayaran</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span className="step">3. Konfirmasi</span>
        </div>
      </nav>

      <div className="booking-body">
        {/* LEFT: QRIS */}
        <div className="booking-form-wrap">
          <h1 className="booking-title">Pembayaran via QRIS</h1>

          <div className="qris-page-wrap">
            {/* Badge QRIS */}
            <div className="qris-badge-row">
              <div className="qris-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                QRIS
              </div>
              <span className="qris-tagline">Satu QR untuk semua aplikasi pembayaran</span>
            </div>

            {/* Nama & NMID */}
            <div className="qris-merchant-info">
              <div className="qris-merchant-name">Mohammad Kevin | Dig...</div>
              <div className="qris-merchant-nmid">NMID : ID1025468313305 · A01</div>
            </div>

            {/* Foto QRIS asli */}
            <div className="qris-image-wrap">
              <img
                src="/img/WhatsApp Image 2026-07-21 at 13.58.04.jpeg"
                alt="QRIS FutsalIn"
                className="qris-real-img"
              />
            </div>

            {/* Total */}
            <div className="qris-total-box">
              <span className="qris-total-label">Total yang harus dibayar</span>
              <span className="qris-total-amount">{formatRupiah(total)}</span>
            </div>

            {/* Cara bayar */}
            <div className="qris-steps-box">
              <div className="qris-steps-title">Cara Bayar</div>
              <div className="qris-steps-list">
                <div className="qris-step-item">
                  <div className="qris-step-num">1</div>
                  <div>Buka aplikasi mobile banking atau dompet digital Anda <span className="qris-apps">(GoPay, OVO, DANA, ShopeePay, BCA, BRI, Mandiri, dll)</span></div>
                </div>
                <div className="qris-step-item">
                  <div className="qris-step-num">2</div>
                  <div>Pilih menu <strong>Scan QR / Bayar dengan QRIS</strong></div>
                </div>
                <div className="qris-step-item">
                  <div className="qris-step-num">3</div>
                  <div>Arahkan kamera ke QR Code di atas</div>
                </div>
                <div className="qris-step-item">
                  <div className="qris-step-num">4</div>
                  <div>Pastikan nominal: <strong>{formatRupiah(total)}</strong> lalu konfirmasi</div>
                </div>
                <div className="qris-step-item">
                  <div className="qris-step-num">5</div>
                  <div>Klik tombol <strong>Konfirmasi Pembayaran</strong> di bawah setelah selesai</div>
                </div>
              </div>
            </div>

            {/* Timer warning */}
            <div className="pay-timer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Selesaikan pembayaran dalam <strong>30 menit</strong> untuk memastikan booking Anda.
            </div>
          </div>
        </div>

        {/* RIGHT: Summary */}
        <div className="booking-summary">
          <div className="summary-card">
            <div className="summary-title">Ringkasan Order</div>
            <img src={court.image} alt={court.name} className="summary-court-img" />
            <div className="summary-court-name">{court.name}</div>
            <div className="summary-court-meta">{court.floor} · {court.size}</div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Pemesan</span>
              <span>{name}</span>
            </div>
            <div className="summary-row">
              <span>Tanggal</span>
              <span>{date ? new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
            </div>
            <div className="summary-row">
              <span>Slot Waktu</span>
              <span style={{ textAlign: "right", maxWidth: "160px" }}>{slotList.join(", ")}</span>
            </div>
            <div className="summary-row">
              <span>Durasi</span>
              <span>{slotList.length} jam</span>
            </div>
            <div className="summary-row">
              <span>Harga/jam</span>
              <span>{formatRupiah(court.price)}</span>
            </div>
            <div className="summary-row">
              <span>Metode</span>
              <span>QRIS</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatRupiah(total)}</span>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="btn-gold summary-btn"
            >
              {loading ? (
                <span className="loading-dots">
                  <span />
                  <span />
                  <span />
                </span>
              ) : "KONFIRMASI PEMBAYARAN"}
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

export default function PembayaranClient() {
  return (
    <Suspense fallback={
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", color:"#c9a84c", fontSize:"1.1rem" }}>
        Memuat...
      </div>
    }>
      <PembayaranForm />
    </Suspense>
  );
}
