"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface BookingItem {
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

interface CourtItem {
  id: number;
  name: string;
  floor: string;
  size: string;
  price: number;
  image: string;
  tagline?: string;
  description?: string;
  features?: string[];
  recommendedFor?: string;
  lighting?: string;
  isActive: boolean;
}

const SQL_SCHEMA_TEXT = `-- Copy & Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.courts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  floor TEXT NOT NULL,
  size TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  recommended_for TEXT,
  lighting TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE,
  court_id BIGINT REFERENCES public.courts(id),
  court_name TEXT NOT NULL,
  date DATE NOT NULL,
  slots TEXT[] NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  addons TEXT[] DEFAULT '{}',
  subtotal_court NUMERIC NOT NULL,
  subtotal_addons NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  voucher_code TEXT,
  status TEXT DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES FOR SUPABASE
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public courts selection policy" ON public.courts FOR SELECT USING (true);
CREATE POLICY "Public courts insertion policy" ON public.courts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public courts update policy" ON public.courts FOR UPDATE USING (true);
CREATE POLICY "Public bookings insertion policy" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public bookings selection policy" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public bookings update policy" ON public.bookings FOR UPDATE USING (true);`;

export default function AdminClient() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING_PAYMENT" | "CANCELLED">("ALL");
  const [activeTab, setActiveTab] = useState<"bookings" | "courts" | "supabase">("bookings");
  const [updatingCode, setUpdatingCode] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Add Court State
  const [showAddCourtModal, setShowAddCourtModal] = useState(false);
  const [newCourtName, setNewCourtName] = useState("");
  const [newCourtFloor, setNewCourtFloor] = useState("Polypropylene Interlock");
  const [newCourtSize, setNewCourtSize] = useState("25m x 15m");
  const [newCourtPrice, setNewCourtPrice] = useState("180000");
  const [newCourtImage, setNewCourtImage] = useState("/img/13c3423cd3d2e12a6087d33e14093615.jpg");
  const [newCourtTagline, setNewCourtTagline] = useState("");
  const [newCourtDesc, setNewCourtDesc] = useState("");
  const [newCourtFeatures, setNewCourtFeatures] = useState("");
  const [newCourtLighting, setNewCourtLighting] = useState("LED Stadium 500 Lux");
  const [addingCourt, setAddingCourt] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resB, resC] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/courts"),
      ]);
      const dataB = await resB.json();
      const dataC = await resC.json();

      if (dataB.success) setBookings(dataB.data || []);
      if (dataC.success) setCourts(dataC.data || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateStatus = async (code: string, newStatus: "PAID" | "CANCELLED") => {
    setUpdatingCode(code);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.bookingCode === code ? { ...b, status: newStatus } : b))
        );
        if (selectedBooking && selectedBooking.bookingCode === code) {
          setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingCode(null);
    }
  };

  const handleToggleCourtStatus = async (id: number) => {
    const court = courts.find((c) => c.id === id);
    if (!court) return;
    const newStatus = !court.isActive;

    setCourts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: newStatus } : c))
    );

    try {
      await fetch("/api/courts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: newStatus }),
      });
    } catch (err) {
      console.error("Error toggling court status:", err);
    }
  };

  const handleAddCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourtName || !newCourtPrice) return;

    setAddingCourt(true);
    try {
      const res = await fetch("/api/courts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCourtName,
          floor: newCourtFloor,
          size: newCourtSize,
          price: Number(newCourtPrice),
          image: newCourtImage,
          tagline: newCourtTagline || "Arena Futsal Standar Nasional",
          description: newCourtDesc || "Lapangan futsal berstandar nasional dengan daya cengkeram traksi tinggi dan pencahayaan terang.",
          features: newCourtFeatures ? newCourtFeatures.split(",").map((f) => f.trim()) : ["Bantalan Shock Absorption", "Pencahayaan LED High-Lumen", "Jaring Pengaman High Density"],
          lighting: newCourtLighting,
        }),
      });

      const data = await res.json();
      setAddingCourt(false);

      if (data.success && data.data) {
        setCourts((prev) => [...prev, data.data]);
        setShowAddCourtModal(false);
        setNewCourtName("");
        setNewCourtTagline("");
        setNewCourtDesc("");
        setNewCourtFeatures("");
      }
    } catch {
      setAddingCourt(false);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_TEXT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const totalPaid = bookings.filter((b) => b.status === "PAID").reduce((sum, b) => sum + b.totalPrice, 0);
    const countTotal = bookings.length;
    const countPaid = bookings.filter((b) => b.status === "PAID").length;
    const countPending = bookings.filter((b) => b.status === "PENDING_PAYMENT").length;
    const countCancelled = bookings.filter((b) => b.status === "CANCELLED").length;

    return { totalPaid, countTotal, countPaid, countPending, countCancelled };
  }, [bookings]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        b.bookingCode.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.courtName.toLowerCase().includes(q);

      return matchStatus && matchQuery;
    });
  }, [bookings, statusFilter, searchQuery]);

  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

  return (
    <div className="admin-page">
      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-logo" onClick={() => router.push("/")}>
            Futsal<span>In</span>
          </div>
          <span className="admin-badge">Admin Dashboard PRO</span>
        </div>

        <div className="admin-header-actions">
          <button onClick={fetchAdminData} className="btn-admin-secondary">
            🔄 Refresh Data
          </button>
          <button onClick={() => router.push("/")} className="btn-admin-primary">
            🌐 Main Web Site
          </button>
        </div>
      </header>

      {/* Main Admin Layout */}
      <div className="admin-container">
        {/* Metric Cards Grid */}
        <div className="metrics-grid">
          <div className="metric-card gold">
            <div className="metric-icon">💰</div>
            <div className="metric-info">
              <div className="metric-label">Total Pendapatan (Lunas)</div>
              <div className="metric-value">{formatRupiah(metrics.totalPaid)}</div>
              <div className="metric-sub">{metrics.countPaid} Transaksi terkonfirmasi</div>
            </div>
          </div>

          <div className="metric-card green">
            <div className="metric-icon">📋</div>
            <div className="metric-info">
              <div className="metric-label">Total Reservasi</div>
              <div className="metric-value">{metrics.countTotal} <small>Pemesanan</small></div>
              <div className="metric-sub">Dalam sistem FutsalIn</div>
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-icon">⏳</div>
            <div className="metric-info">
              <div className="metric-label">Menunggu Pembayaran</div>
              <div className="metric-value">{metrics.countPending} <small>Pending</small></div>
              <div className="metric-sub">Perlu verifikasi pembayaran</div>
            </div>
          </div>

          <div className="metric-card info">
            <div className="metric-icon">🏟️</div>
            <div className="metric-info">
              <div className="metric-label">Arena Lapangan</div>
              <div className="metric-value">{courts.length} <small>Arena</small></div>
              <div className="metric-sub">{courts.filter((c) => c.isActive).length} Aktif Dipakai</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tab-bar">
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === "bookings" ? "active" : ""}`}
              onClick={() => setActiveTab("bookings")}
            >
              📋 Daftar Reservasi Booking ({bookings.length})
            </button>
            <button
              className={`admin-tab ${activeTab === "courts" ? "active" : ""}`}
              onClick={() => setActiveTab("courts")}
            >
              🏟️ Kelola Arena Lapangan ({courts.length})
            </button>
            <button
              className={`admin-tab ${activeTab === "supabase" ? "active" : ""}`}
              onClick={() => setActiveTab("supabase")}
            >
              ⚡ Integrasi Supabase DB
            </button>
          </div>
        </div>

        {/* TAB 1: BOOKINGS MANAGEMENT */}
        {activeTab === "bookings" && (
          <div className="admin-section animate-fade-in-up">
            {/* Filter & Search Bar */}
            <div className="table-controls">
              <div className="status-filter-chips">
                <button
                  className={`chip ${statusFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setStatusFilter("ALL")}
                >
                  Semua ({metrics.countTotal})
                </button>
                <button
                  className={`chip paid ${statusFilter === "PAID" ? "active" : ""}`}
                  onClick={() => setStatusFilter("PAID")}
                >
                  ✓ Lunas ({metrics.countPaid})
                </button>
                <button
                  className={`chip pending ${statusFilter === "PENDING_PAYMENT" ? "active" : ""}`}
                  onClick={() => setStatusFilter("PENDING_PAYMENT")}
                >
                  ⏳ Pending ({metrics.countPending})
                </button>
                <button
                  className={`chip cancelled ${statusFilter === "CANCELLED" ? "active" : ""}`}
                  onClick={() => setStatusFilter("CANCELLED")}
                >
                  ✕ Batal ({metrics.countCancelled})
                </button>
              </div>

              <div className="admin-search-box">
                <input
                  type="text"
                  placeholder="Cari kode booking, nama, No WA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-search-input"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="btn-clear-search">✕</button>
                )}
              </div>
            </div>

            {/* Bookings Data Table Wrap with Overflow */}
            <div className="admin-table-wrap">
              {loading ? (
                <div className="admin-table-loading">Memuat data reservasi...</div>
              ) : filteredBookings.length === 0 ? (
                <div className="admin-table-empty">
                  Tidak ada data reservasi yang cocok dengan pencarian atau filter.
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kode Tiket</th>
                      <th>Pemesan</th>
                      <th>Arena Lapangan</th>
                      <th>Tanggal & Jam</th>
                      <th>Total Bayar</th>
                      <th>Status Tiket</th>
                      <th style={{ textAlign: "right" }}>Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => {
                      const isUpdating = updatingCode === b.bookingCode;
                      return (
                        <tr key={b.id || b.bookingCode}>
                          <td>
                            <div className="b-code-cell" onClick={() => setSelectedBooking(b)} title="Klik untuk rincian tiket">
                              <span className="code-tag">{b.bookingCode}</span>
                              <small className="created-at">
                                {new Date(b.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div className="b-user-cell">
                              <div className="b-user-name">{b.name}</div>
                              <div className="b-user-contact">📞 {b.phone}</div>
                              <div className="b-user-email">{b.email}</div>
                            </div>
                          </td>
                          <td>
                            <div className="b-court-cell">
                              <span className="court-title-text">{b.courtName}</span>
                              {b.addons && b.addons.length > 0 && (
                                <span className="b-addons-tag">+{b.addons.length} Add-on Equipment</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="b-time-cell">
                              <div className="b-date">🗓️ {new Date(b.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</div>
                              <div className="b-slots">⏰ {b.slots.join(", ")} ({b.slots.length} jam)</div>
                            </div>
                          </td>
                          <td>
                            <div className="b-price-cell">
                              <span className="b-total">{formatRupiah(b.totalPrice)}</span>
                              {b.discountAmount > 0 && (
                                <span className="b-disc">Hemat {formatRupiah(b.discountAmount)}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill ${b.status.toLowerCase()}`}>
                              {b.status === "PAID"
                                ? "✓ LUNAS"
                                : b.status === "PENDING_PAYMENT"
                                ? "⏳ PENDING"
                                : "✕ BATAL"}
                            </span>
                          </td>
                          <td>
                            <div className="admin-actions">
                              {b.status !== "PAID" && (
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateStatus(b.bookingCode, "PAID")}
                                  className="btn-act approve"
                                  title="Verifikasi Pembayaran Lunas"
                                >
                                  {isUpdating ? "..." : "✓ Lunas"}
                                </button>
                              )}
                              {b.status !== "CANCELLED" && (
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateStatus(b.bookingCode, "CANCELLED")}
                                  className="btn-act cancel"
                                  title="Batalkan Tiket Booking"
                                >
                                  {isUpdating ? "..." : "Batalkan"}
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedBooking(b)}
                                className="btn-act view"
                                title="Lihat Rincian Detail"
                              >
                                Detail
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: COURTS MANAGEMENT */}
        {activeTab === "courts" && (
          <div className="admin-section animate-fade-in-up">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Kelola Arena Lapangan Futsal</h2>
                <p className="admin-section-sub">Atur status ketersediaan atau tambahkan arena lapangan baru.</p>
              </div>
              <button
                onClick={() => setShowAddCourtModal(true)}
                className="btn-admin-primary"
              >
                + Tambah Lapangan Baru
              </button>
            </div>

            <div className="courts-admin-grid">
              {courts.map((c) => (
                <div key={c.id} className="court-admin-card">
                  <div className="court-admin-img-wrap">
                    <img src={c.image} alt={c.name} className="court-admin-img" />
                    <span className={`court-status-tag ${c.isActive ? "active" : "maintenance"}`}>
                      {c.isActive ? "🟢 SIAP DIGUNAKAN" : "🟠 MAINTENANCE"}
                    </span>
                  </div>

                  <div className="court-admin-body">
                    <h3 className="court-admin-name">{c.name}</h3>
                    {c.tagline && <p className="court-admin-tagline">{c.tagline}</p>}

                    <div className="court-admin-specs">
                      <span>🧱 {c.floor}</span>
                      <span>📐 {c.size}</span>
                    </div>

                    <div className="court-admin-footer">
                      <div className="court-admin-price">
                        {formatRupiah(c.price)}<span> / jam</span>
                      </div>

                      <button
                        onClick={() => handleToggleCourtStatus(c.id)}
                        className={`btn-toggle-status ${c.isActive ? "btn-warn" : "btn-succ"}`}
                      >
                        {c.isActive ? "Ubah ke Maintenance" : "Aktifkan Lapangan"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SUPABASE INTEGRATION INFO */}
        {activeTab === "supabase" && (
          <div className="admin-section animate-fade-in-up">
            <div className="supabase-box">
              <div className="supabase-header">
                <span className="sp-icon">⚡</span>
                <div>
                  <h2>Integrasi Database Supabase Real-Time</h2>
                  <p>Panduan pengaktifan dan skema SQL database untuk proyek FutsalIn.</p>
                </div>
              </div>

              <div className="sp-status-alert">
                <div className="sp-status-indicator">
                  <span className="dot"></span>
                  <strong>Status Koneksi Database:</strong> In-Memory Active Store (Siap dihubungkan ke Supabase)
                </div>
                <p>
                  Untuk menghubungkan langsung ke instance Supabase Anda, isi environment variables pada file <code>.env.local</code> di folder root proyek:
                </p>
                <pre className="sp-code-block">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}
                </pre>
              </div>

              <div className="sp-sql-guide">
                <div className="sp-sql-header">
                  <div>
                    <h3>Skrip SQL Schema Supabase (`supabase_schema.sql`)</h3>
                    <p>Jalankan kode SQL di bawah ini pada menu <strong>SQL Editor</strong> di dashboard Supabase Anda:</p>
                  </div>
                  <button onClick={copySqlToClipboard} className="btn-copy-sql">
                    {copiedSql ? "✓ Berhasil Disalin!" : "📋 Salin Kode SQL"}
                  </button>
                </div>

                <textarea
                  readOnly
                  className="sp-sql-textarea"
                  value={SQL_SCHEMA_TEXT}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL BOOKING MODAL */}
      {selectedBooking && (
        <div className="modal-backdrop" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content admin-modal modal-pro animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedBooking(null)}>✕</button>

            <div className="admin-modal-top-glow"></div>

            <div className="admin-modal-header">
              <div>
                <span className="modal-badge-tag">TIKET RESERVASI FUTSALIN</span>
                <div className="code-highlight">{selectedBooking.bookingCode}</div>
              </div>
              <span className={`status-pill ${selectedBooking.status.toLowerCase()}`}>
                {selectedBooking.status === "PAID" ? "✓ LUNAS" : selectedBooking.status === "PENDING_PAYMENT" ? "⏳ PENDING" : "✕ BATAL"}
              </span>
            </div>

            <div className="modal-body-pro">
              <div className="admin-detail-rows">
                <div className="ad-row"><span>Nama Pemesan</span><strong>{selectedBooking.name}</strong></div>
                <div className="ad-row"><span>No. WhatsApp</span><strong>{selectedBooking.phone}</strong></div>
                <div className="ad-row"><span>Email</span><strong>{selectedBooking.email}</strong></div>
                <div className="ad-row"><span>Arena Lapangan</span><strong>{selectedBooking.courtName}</strong></div>
                <div className="ad-row">
                  <span>Tanggal Bermain</span>
                  <strong>{new Date(selectedBooking.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>
                </div>
                <div className="ad-row"><span>Slot Jam ({selectedBooking.slots.length} jam)</span><strong>{selectedBooking.slots.join(", ")}</strong></div>
                {selectedBooking.addons && selectedBooking.addons.length > 0 && (
                  <div className="ad-row"><span>Equipment Addons</span><strong>{selectedBooking.addons.join(", ")}</strong></div>
                )}
                {selectedBooking.voucherCode && (
                  <div className="ad-row"><span>Voucher Promo</span><strong>🎟️ {selectedBooking.voucherCode} (-{formatRupiah(selectedBooking.discountAmount)})</strong></div>
                )}
                <div className="ad-row total-row">
                  <span>Total Tagihan Tiket</span>
                  <strong className="price">{formatRupiah(selectedBooking.totalPrice)}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer-pro">
              {selectedBooking.status !== "PAID" && (
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.bookingCode, "PAID")}
                  className="btn-modal-action-primary"
                >
                  ✓ VERIFIKASI SEBAGAI LUNAS
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD COURT MODAL - REDESIGNED 760PX WIDE GLASSMORPHISM */}
      {showAddCourtModal && (
        <div className="modal-backdrop" onClick={() => setShowAddCourtModal(false)}>
          <div className="modal-content admin-modal modal-wide-760 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            {/* Top Glowing Gradient Bar */}
            <div className="admin-modal-top-glow"></div>

            {/* Floating Close Button */}
            <button className="modal-close-btn-floating" onClick={() => setShowAddCourtModal(false)} title="Tutup Modal">
              ✕
            </button>

            {/* Modal Header */}
            <div className="modal-header-hero">
              <div className="modal-header-badge">🏟️ ARENA MANAGEMENT PRO</div>
              <h2>+ Tambahkan Arena Lapangan Baru</h2>
              <p>Lengkapi formulir di bawah ini untuk mempublikasikan arena futsal baru secara real-time ke sistem reservasi FutsalIn.</p>
            </div>

            <form onSubmit={handleAddCourt} className="modal-form-wrap">
              {/* SECTION 1: INFORMASI UTAMA */}
              <div className="form-section">
                <div className="section-header-pill">📌 INFORMASI UTAMA ARENA</div>
                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Nama Arena Lapangan *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Lapangan Rumput Sintetis VIP"
                      value={newCourtName}
                      onChange={(e) => setNewCourtName(e.target.value)}
                      className="form-input-pro"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tipe Lantai Arena *</label>
                    <select
                      value={newCourtFloor}
                      onChange={(e) => setNewCourtFloor(e.target.value)}
                      className="form-input-pro custom-select-dark"
                    >
                      <option value="Polypropylene Interlock">Polypropylene Interlock</option>
                      <option value="Vinyl Premium 8mm">Vinyl Premium 8mm</option>
                      <option value="Parquet Kayu Hard Maple">Parquet Kayu Hard Maple</option>
                      <option value="Rumput Sintetis FIFA Spec">Rumput Sintetis FIFA Spec</option>
                      <option value="Rubber Synthetic Mat">Rubber Synthetic Mat</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ukuran Dimensi Arena</label>
                    <input
                      type="text"
                      placeholder="Contoh: 26m x 16m"
                      value={newCourtSize}
                      onChange={(e) => setNewCourtSize(e.target.value)}
                      className="form-input-pro"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tarif Sewa Per Jam (Rp) *</label>
                    <input
                      type="number"
                      placeholder="180000"
                      value={newCourtPrice}
                      onChange={(e) => setNewCourtPrice(e.target.value)}
                      className="form-input-pro price-highlight"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: VISUAL & MEDIA */}
              <div className="form-section">
                <div className="section-header-pill">🖼️ MEDIA & GAMBAR ARENA</div>
                
                <div className="form-group-full">
                  <label className="form-label">Upload Foto Lapangan dari Komputer / HP (Lokal)</label>
                  <div className="file-upload-dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      id="court-file-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setNewCourtImage(event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden-file-input"
                    />
                    <label htmlFor="court-file-input" className="file-upload-btn-label">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span>📁 Klik untuk Upload Foto dari File Lokal</span>
                    </label>
                  </div>

                  {newCourtImage && (
                    <div className="image-preview-card">
                      <div className="ipc-img-wrap">
                        <img src={newCourtImage} alt="Preview Foto Arena" />
                      </div>
                      <div className="ipc-info">
                        <span className="ipc-title">Preview Foto Arena Lapangan:</span>
                        <span className="ipc-sub">
                          {newCourtImage.startsWith("data:") ? "✓ Foto Berhasil Diunggah dari File Lokal" : newCourtImage}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group-full" style={{ marginTop: "1rem" }}>
                  <label className="form-label">Atau Gunakan URL Gambar / Preset Preset:</label>
                  <input
                    type="text"
                    placeholder="/img/sintetis.jpg atau URL Gambar HTTPS"
                    value={newCourtImage.startsWith("data:") ? "[Foto Ter-upload dari File Lokal]" : newCourtImage}
                    onChange={(e) => setNewCourtImage(e.target.value)}
                    className="form-input-pro"
                  />
                  <div className="preset-img-chips-container">
                    <span className="chip-lbl-title">Pilih Preset Gambar Cepat:</span>
                    <div className="preset-chips-row">
                      <button
                        type="button"
                        onClick={() => setNewCourtImage("/img/sintetis.jpg")}
                        className={`preset-chip-pro ${newCourtImage === "/img/sintetis.jpg" ? "active" : ""}`}
                      >
                        🌿 Rumput Sintetis
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCourtImage("/img/13c3423cd3d2e12a6087d33e14093615.jpg")}
                        className={`preset-chip-pro ${newCourtImage.includes("13c34") ? "active" : ""}`}
                      >
                        🧱 Matras Interlock
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCourtImage("/img/outdor.jpg")}
                        className={`preset-chip-pro ${newCourtImage === "/img/outdor.jpg" ? "active" : ""}`}
                      >
                        🏟️ Parquet Kayu VIP
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: DETAIL & FASILITAS */}
              <div className="form-section">
                <div className="section-header-pill">📝 DETAIL & FASILITAS ARENA</div>
                <div className="form-group-full margin-b-1">
                  <label className="form-label">Tagline Keunggulan Lapangan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rumput Sintetis Empuk & Anti Slip Kualitas Pro"
                    value={newCourtTagline}
                    onChange={(e) => setNewCourtTagline(e.target.value)}
                    className="form-input-pro"
                  />
                </div>

                <div className="form-group-full margin-b-1">
                  <label className="form-label">Deskripsi Lengkap Lapangan</label>
                  <textarea
                    placeholder="Jelaskan kenyamanan, material lantai, dan keunggulan arena ini untuk pengunjung..."
                    value={newCourtDesc}
                    onChange={(e) => setNewCourtDesc(e.target.value)}
                    className="form-input-pro form-textarea-pro"
                  />
                </div>

                <div className="form-group-full">
                  <label className="form-label">Fasilitas Arena (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    placeholder="Bantalan Empuk 8mm, LED 600 Lux, Scoreboard Digital, Tribun VIP"
                    value={newCourtFeatures}
                    onChange={(e) => setNewCourtFeatures(e.target.value)}
                    className="form-input-pro"
                  />
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="modal-action-footer">
                <button
                  type="submit"
                  disabled={addingCourt}
                  className="btn-modal-action-primary"
                >
                  {addingCourt ? "🔄 PUBLISHING LAPANGAN BARU..." : "🚀 SIMPAN & PUBLIKASIKAN LAPANGAN BARU"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
