"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomeClient() {
  const router = useRouter();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const testimonials = [
    {
      quote: "Proses pemesanan online sangat mudah dan tidak pernah bentrok. Lapangannya juga dalam kondisi prima. Tim saya menyukainya.",
      author: "Roni, Kapten Tim 'The Kickers', Pelanggan Tetap"
    },
    {
      quote: "Fasilitas lengkap dan bersih! Ruang ganti luas, shower air panas, dan kafe-nya mantap. Worth it banget untuk harga yang ditawarkan.",
      author: "Andi, Tim 'Garuda FC', Member Sejak 2022"
    },
    {
      quote: "Sistem booking 24/7 sangat membantu tim kami yang sering main malam. Tidak ada lagi drama rebutan jadwal!",
      author: "Budi, Kapten 'Thunder Squad', Pelanggan VIP"
    }
  ];

  const courts = [
    {
      id: 1,
      name: "Lapangan Standar",
      image: "/img/13c3423cd3d2e12a6087d33e14093615.jpg",
      tag: "Only 3 Slots Left",
      players: 10,
      size: "25m x 15m",
      floor: "Interlock",
      price: "150rb"
    },
    {
      id: 2,
      name: "Lapangan Deluxe",
      image: "/img/sintetis.jpg",
      tag: "Only 1 Slot Left",
      players: 10,
      size: "25m x 15m",
      floor: "Vinyl Premium",
      price: "200rb"
    },
    {
      id: 3,
      name: "Lapangan Premier ",
      image: "/img/outdor.jpg",
      tag: "Only 2 Slots Left",
      players: 10,
      size: "30m x 20m",
      floor: "Parquet",
      price: "250rb"
    }
  ];

  const handleBooking = (courtId: number) => {
    router.push(`/booking?court=${courtId}`);
  };

  const handleScroll = () => {
    document.getElementById("courts-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* ===== HEADER / NAV ===== */}
      <nav className="site-nav">
        <div className="logo">
          Futsal<span>In</span>
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
          <a 
            href="#testimonial-section" 
            className="nav-drawer-link" 
            onClick={(e) => { 
              e.preventDefault(); 
              setIsMenuOpen(false); 
              document.getElementById("testimonial-section")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Testimoni
          </a>
          <button 
            onClick={() => { 
              setIsMenuOpen(false); 
              handleScroll(); 
            }} 
            className="btn-gold" 
            style={{ marginTop: "1.5rem", width: "100%" }}
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
            FutsalIn adalah pilihan tepat untuk tim yang mencari kenyamanan, kualitas, dan fasilitas lengkap tanpa ribet.
          </p>
          <button onClick={handleScroll} className="btn-gold">
            PILIH LAPANGAN
          </button>
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
          © Copyright 2023 - FutsalIn by Designesia
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
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Twitter">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
