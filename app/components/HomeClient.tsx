"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface BookingRecord {
  id: string;
  bookingCode: string;
  courtId: number;
  courtName: string;
  date: string;
  slots: string[];
  name: string;
  phone: string;
  email: string;
  addons: string[];
  subtotalCourt: number;
  subtotalAddons: number;
  discountAmount: number;
  totalPrice: number;
  voucherCode?: string;
  status: "PENDING_PAYMENT" | "PAID" | "CANCELLED";
  createdAt: string;
}

export default function HomeClient() {
  const router = useRouter();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // E-Ticket Modal State
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSearchCode, setTicketSearchCode] = useState("");
  const [ticketData, setTicketData] = useState<BookingRecord | null>(null);
  const [searchingTicket, setSearchingTicket] = useState(false);
  const [ticketError, setTicketError] = useState("");
  const [copiedWa, setCopiedWa] = useState(false);

  // Split bill counter
  const [playerCount, setPlayerCount] = useState(10);

  // Live schedule matrix state
  const [activeScheduleCourt, setActiveScheduleCourt] = useState(1);
  const [todayBookings, setTodayBookings] = useState<BookingRecord[]>([]);

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTodayBookings(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const testimonials = [
    {
      quote: "Proses pemesanan online sangat mudah dan tidak pernah bentrok. Lapangannya juga dalam kondisi prima. Tim saya menyukainya.",
      author: "Roni, Kapten Tim 'The Kickers', Pelanggan Tetap",
    },
    {
      quote: "Fasilitas lengkap dan bersih! Ruang ganti luas, shower air panas, dan kafe-nya mantap. Worth it banget untuk harga yang ditawarkan.",
      author: "Andi, Tim 'Garuda FC', Member Sejak 2022",
    },
    {
      quote: "Sistem booking 24/7 sangat membantu tim kami yang sering main malam. Tidak ada lagi drama rebutan jadwal!",
      author: "Budi, Kapten 'Thunder Squad', Pelanggan VIP",
    },
  ];

  const courts = [
    {
      id: 1,
      name: "Lapangan Standar Interlock",
      image: "/img/13c3423cd3d2e12a6087d33e14093615.jpg",
      tag: "Traksi Tinggi Anti-Slip",
      players: 10,
      size: "25m x 15m",
      floor: "Interlock",
      price: "150rb",
    },
    {
      id: 2,
      name: "Lapangan Vinyl Deluxe",
      image: "/img/sintetis.jpg",
      tag: "Shock Absorption Multilayer",
      players: 10,
      size: "25m x 15m",
      floor: "Vinyl Premium",
      price: "200rb",
    },
    {
      id: 3,
      name: "Lapangan Premier International",
      image: "/img/outdor.jpg",
      tag: "Spesifikasi Kayu FIFA",
      players: 10,
      size: "30m x 20m",
      floor: "Parquet",
      price: "250rb",
    },
  ];

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00"
  ];

  const handleBooking = (courtId: number) => {
    router.push(`/booking?court=${courtId}`);
  };

  const handleScroll = () => {
    document.getElementById("courts-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearchTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSearchCode.trim()) return;

    setSearchingTicket(true);
    setTicketError("");
    setTicketData(null);

    try {
      const res = await fetch(`/api/bookings?code=${ticketSearchCode.trim().toUpperCase()}`);
      const data = await res.json();
      setSearchingTicket(false);

      if (data.success && data.data) {
        setTicketData(data.data);
      } else {
        setTicketError("Kode booking tidak ditemukan. Silakan periksa kembali kode booking Anda.");
      }
    } catch {
      setSearchingTicket(false);
      setTicketError("Terjadi kesalahan koneksi saat mencari tiket.");
    }
  };

  const copyWaSplitBill = (b: BookingRecord) => {
    const perPerson = Math.ceil(b.totalPrice / (playerCount || 10));
    const text = `⚽ *PATUNGAN FUTSAL - FUTSALIN* ⚽
----------------------------------------
📌 *Arena:* ${b.courtName}
🗓️ *Tanggal:* ${b.date}
⏰ *Jam Bermain:* ${b.slots.join(", ")}
🎫 *Kode Booking:* ${b.bookingCode}
----------------------------------------
💰 *Total Biaya:* Rp ${b.totalPrice.toLocaleString("id-ID")}
👥 *Jumlah Pemain:* ${playerCount} Orang
👉 *PATUNGAN PER ORANG: Rp ${perPerson.toLocaleString("id-ID")}*
----------------------------------------
Transfer/Bayar Patungan ke Kapten:
👤 *${b.name}*

_Booking Online via FutsalIn - Tanpa Drama Bentrok Jadwal!_`;

    navigator.clipboard.writeText(text);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2000);
  };

  // Get booked slots for active schedule court today
  const todayStr = new Date().toISOString().split("T")[0];
  const activeCourtBookedSlots = todayBookings
    .filter((b) => b.courtId === activeScheduleCourt && b.date === todayStr && b.status !== "CANCELLED")
    .flatMap((b) => b.slots);

  return (
    <div className="min-h-screen">
      {/* ===== HEADER / NAV ===== */}
      <nav className="site-nav">
        <div className="logo" onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
          Futsal<span>In</span>
        </div>

        {/* Desktop Nav */}
        <div className="site-nav-desktop">
          <a href="#courts-section" className="nav-link-item">Pilih Lapangan</a>
          <a href="#schedule-section" className="nav-link-item">Jadwal Live</a>
          <a href="#facilities-section" className="nav-link-item">Fasilitas</a>
          <a href="#testimonial-section" className="nav-link-item">Testimoni</a>
          <button
            type="button"
            className="btn-nav-ticket"
            onClick={() => setShowTicketModal(true)}
          >
            <span>🎫</span> Cek Tiket / Booking
          </button>
        </div>

        <button 
          className={`burger-btn ${isMenuOpen ? "active" : ""}`} 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* ===== MOBILE NAV DRAWER ===== */}
      <div className={`nav-drawer ${isMenuOpen ? "open" : ""}`}>
        <div className="nav-drawer-links">
          <a 
            href="#courts-section" 
            className="nav-drawer-link" 
            onClick={(e) => { 
              e.preventDefault(); 
              setIsMenuOpen(false); 
              handleScroll(); 
            }}
          >
            Pilih Lapangan
          </a>
          <a 
            href="#schedule-section" 
            className="nav-drawer-link" 
            onClick={(e) => { 
              e.preventDefault(); 
              setIsMenuOpen(false); 
              document.getElementById("schedule-section")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Jadwal Live
          </a>
          <a 
            href="#facilities-section" 
            className="nav-drawer-link" 
            onClick={(e) => { 
              e.preventDefault(); 
              setIsMenuOpen(false); 
              document.getElementById("facilities-section")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Fasilitas
          </a>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              setShowTicketModal(true);
            }}
            className="btn-nav-ticket"
            style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}
          >
            <span>🎫</span> Cek status booking
          </button>
          <button 
            onClick={() => { 
              setIsMenuOpen(false); 
              handleScroll(); 
            }} 
            className="btn-gold" 
            style={{ marginTop: "1rem", width: "100%" }}
          >
            BOOKING SEKARANG
          </button>
        </div>
      </div>
      <div className={`nav-drawer-overlay ${isMenuOpen ? "open" : ""}`} onClick={() => setIsMenuOpen(false)} />

      {/* ===== SOCIAL SIDEBAR ===== */}
      <div className="social-sidebar">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>
        <a href="https://wa.me/6221234567" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="WhatsApp">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </a>
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-eyebrow">
            Booking Online. Tanpa Bentrok
          </div>
          <h1 className="hero-title">
            Nikmati Pengalaman Bermain Futsal <em>Terbaik</em>. Jadwal Pasti.
          </h1>
          <p className="hero-subtitle">
            FutsalIn adalah pilihan tepat untuk tim yang mencari kenyamanan, kualitas arena, dan fasilitas lengkap tanpa ribet.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button onClick={handleScroll} className="btn-gold">
              PILIH LAPANGAN
            </button>
            <button 
              type="button" 
              onClick={() => setShowTicketModal(true)} 
              className="btn-nav-ticket"
              style={{ padding: "0.9rem 1.8rem", borderRadius: "50px", fontSize: "0.85rem" }}
            >
              🎫 CEK TIKET BOOOKING
            </button>
          </div>
        </div>
      </section>

      {/* ===== INFO BAR ===== */}
      <div className="info-bar">
        <div className="info-item">
          <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>
            <strong>JAM OPERASIONAL:</strong> Senin - Minggu, 08:00 - 22:00
          </span>
        </div>
        <div className="info-divider" />
        <div className="info-item">
          <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>
            <strong>LOKASI:</strong> Jl. Olahraga No. 10, Jakarta
          </span>
        </div>
        <div className="info-divider" />
        <div className="info-item">
          <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l18-5v12L3 14v-3z"/>
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
          </svg>
          <span>
            <strong>DUKUNGAN PELANGGAN:</strong> +62 21 1234 567
          </span>
        </div>
      </div>

      {/* ===== OUR COURTS SECTION ===== */}
      <section id="courts-section" className="courts-section">
        <div className="section-header">
          <div className="section-label">Fasilitas Premium</div>
          <h2 className="section-title">Lapangan Kami</h2>
          <div className="section-divider">
            <div className="diamond" />
          </div>
        </div>

        <div className="courts-grid">
          {courts.map((court) => (
            <div key={court.id} className="court-card">
              <div className="court-img-wrap">
                <img 
                  src={court.image}
                  alt={court.name}
                />
                <div className="court-tag">{court.tag}</div>
              </div>
              <div className="court-body">
                <div className="court-specs">
                  <div className="court-spec">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>{court.players}</span>
                  </div>
                  <div className="court-spec">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="4 7 4 4 20 4 20 7"/>
                      <line x1="9" y1="20" x2="15" y2="20"/>
                      <line x1="12" y1="4" x2="12" y2="20"/>
                    </svg>
                    <span>{court.size}</span>
                  </div>
                  <div className="court-spec">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="9" y1="3" x2="9" y2="21"/>
                      <line x1="15" y1="3" x2="15" y2="21"/>
                    </svg>
                    <span>{court.floor}</span>
                  </div>
                </div>
                <h3 className="court-name">{court.name}</h3>
                <div className="court-divider" />
                <div className="court-price-row">
                  <div className="court-price">
                    Rp {court.price}<span className="court-price-sub">/jam</span>
                  </div>
                  <button onClick={() => handleBooking(court.id)} className="court-book-btn">
                    Booking
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== LIVE SCHEDULE MATRIX SECTION ===== */}
      <section id="schedule-section" className="schedule-live-section">
        <div className="section-header">
          <div className="section-label">Real-Time Availability</div>
          <h2 className="section-title">Jadwal Live Arena Hari Ini</h2>
          <div className="section-divider"><div className="diamond" /></div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Pantau status ketersediaan slot jam bermain hari ini secara terintegrasi.
          </p>
        </div>

        <div className="schedule-matrix-wrap">
          <div className="court-tabs-row">
            {courts.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`court-tab-btn ${activeScheduleCourt === c.id ? "active" : ""}`}
                onClick={() => setActiveScheduleCourt(c.id)}
              >
                {c.name} ({c.floor})
              </button>
            ))}
          </div>

          <div className="matrix-slots-grid">
            {timeSlots.map((slot) => {
              const isBooked = activeCourtBookedSlots.includes(slot);
              const isPrime = parseInt(slot) >= 18;
              return (
                <div
                  key={slot}
                  className={`matrix-slot-card ${isBooked ? "booked" : ""}`}
                  onClick={() => {
                    if (!isBooked) {
                      router.push(`/booking?court=${activeScheduleCourt}`);
                    }
                  }}
                  title={isBooked ? "Slot Terisi" : "Klik untuk Booking Slot Ini"}
                >
                  <div style={{ fontSize: "1rem", fontWeight: "800", color: "#fff" }}>{slot}</div>
                  <div style={{ fontSize: "0.72rem", marginTop: "0.25rem", color: isBooked ? "#f87171" : isPrime ? "#a78bfa" : "#34d399" }}>
                    {isBooked ? "Terisi ✗" : isPrime ? "Prime Time ★" : "Tersedia ✓"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FACILITIES SECTION ===== */}
      <section id="facilities-section" className="facilities-section">
        <div className="facilities-images">
          <div className="fac-img">
            <img 
              src="/img/6d385d010d7e5006312c8fbaeacdb3a1.jpg"
              alt="Lapangan Futsal Standar"
            />
          </div>
          <div className="fac-img">
            <img 
              src="/img/eb7bc01b1bd6c78475b2033f6c409bd5.jpg"
              alt="Lapangan Futsal Premier"
            />
          </div>
        </div>

        <div className="facilities-text">
          <div className="section-label">Fasilitas Lengkap</div>
          <h2 className="facilities-heading">
            Kenyamanan Lebih untuk Tim Anda
          </h2>
          <p className="facilities-desc">
            Kami menyediakan lebih dari sekadar lapangan berkualitas tinggi. Nikmati fasilitas modern yang dirancang untuk memberikan pengalaman bermain terbaik.
          </p>
          <ul className="fac-list">
            <li>Ruang ganti bersih dan luas</li>
            <li>Fasilitas shower air panas dan dingin</li>
            <li>Area penonton yang nyaman</li>
            <li>Kafe in-house dengan menu lengkap</li>
            <li>Parkir luas dan aman</li>
            <li>Sistem booking online 24/7</li>
          </ul>
          <button onClick={handleScroll} className="btn-gold">
            BOOKING SEKARANG
          </button>
        </div>
      </section>

      {/* ===== TESTIMONIAL SECTION ===== */}
      <section id="testimonial-section" className="testimonial-section">
        <div className="testimonial-bg" />
        <div className="testimonial-content">
          <div className="quote-mark">&ldquo;</div>
          <p className="testimonial-quote">
            {testimonials[activeTestimonial].quote}
          </p>
          <div className="testimonial-divider" />
          <div className="testimonial-author">
            {testimonials[activeTestimonial].author}
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`dot ${activeTestimonial === index ? 'active' : ''}`}
                aria-label={`Testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer">
        <div className="footer-copy">
          © Copyright 2026 - FutsalIn Court Reservation System
        </div>
        <div className="footer-socials">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Facebook">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
          <a href="https://wa.me/6221234567" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="WhatsApp">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </a>
        </div>
      </footer>

      {/* ===== E-TICKET SEARCH MODAL ===== */}
      {showTicketModal && (
        <div className="modal-backdrop animate-fade-in-up">
          <div className="ticket-lookup-modal">
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => {
                setShowTicketModal(false);
                setTicketData(null);
                setTicketError("");
              }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fff" }}>
              🎫 Cek Tiket & Status Booking
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginTop: "0.2rem" }}>
              Masukkan kode booking Anda (contoh: <code>FSI-DEMO01</code>) untuk melihat e-tiket dan rincian patungan tim.
            </p>

            <form onSubmit={handleSearchTicket} className="ticket-search-box">
              <input
                type="text"
                placeholder="Masukkan Kode Booking (e.g. FSI-XXXXXX)"
                value={ticketSearchCode}
                onChange={(e) => setTicketSearchCode(e.target.value)}
                className="ticket-search-input"
                required
              />
              <button type="submit" className="btn-gold" disabled={searchingTicket}>
                {searchingTicket ? "Mencari..." : "CARI TIKET"}
              </button>
            </form>

            {ticketError && (
              <div style={{ color: "#f87171", fontSize: "0.88rem", padding: "0.6rem 0.8rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                ⚠️ {ticketError}
              </div>
            )}

            {ticketData && (
              <div className="e-ticket-card">
                <div className="et-header">
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>KODE RESERVASI</div>
                    <div className="et-code">{ticketData.bookingCode}</div>
                  </div>
                  <div className={`et-status-badge ${ticketData.status === "PAID" ? "paid" : "pending"}`}>
                    {ticketData.status === "PAID" ? "✓ LUNAS" : "⏳ MENUNGGU BAYAR"}
                  </div>
                </div>

                <div className="et-grid">
                  <div className="et-field">
                    <span className="et-label">Nama Pemesan</span>
                    <span className="et-val">{ticketData.name}</span>
                  </div>
                  <div className="et-field">
                    <span className="et-label">Arena Lapangan</span>
                    <span className="et-val">{ticketData.courtName}</span>
                  </div>
                  <div className="et-field">
                    <span className="et-label">Tanggal Main</span>
                    <span className="et-val">{ticketData.date}</span>
                  </div>
                  <div className="et-field">
                    <span className="et-label">Slot Waktu</span>
                    <span className="et-val">{ticketData.slots.join(", ")}</span>
                  </div>
                  <div className="et-field">
                    <span className="et-label">Add-ons</span>
                    <span className="et-val">{ticketData.addons.length > 0 ? ticketData.addons.join(", ") : "Tanpa Add-on"}</span>
                  </div>
                  <div className="et-field">
                    <span className="et-label">Total Pembayaran</span>
                    <span className="et-val" style={{ color: "var(--color-green-neon)", fontWeight: "800" }}>
                      Rp {ticketData.totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="barcode-sim">
                  <div className="barcode-lines" />
                  <div className="barcode-text">{ticketData.bookingCode} - VERIFIED E-TICKET</div>
                </div>

                {/* SPLIT BILL WIDGET */}
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
                        Rp {Math.ceil(ticketData.totalPrice / playerCount).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-copy-wa"
                      onClick={() => copyWaSplitBill(ticketData)}
                    >
                      {copiedWa ? "✓ Tersalin!" : "💬 Salin ke WA"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
