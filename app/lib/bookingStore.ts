import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "./supabase";

const CACHE_FILE = path.join(process.cwd(), ".bookings_cache.json");

function loadDiskCache(): BookingRecord[] {
  try {
    if (typeof window === "undefined" && fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore
  }
  return [];
}

function saveDiskCache(bookings: BookingRecord[]) {
  try {
    if (typeof window === "undefined") {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(bookings, null, 2), "utf8");
    }
  } catch {
    // Ignore
  }
}

export interface CourtData {
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

export interface BookingRecord {
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

export const COURTS_DATA: CourtData[] = [
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
    lighting: "LED Day-bright 400 Lux",
    isActive: true,
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
    lighting: "LED Pro Stadium 600 Lux",
    isActive: true,
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
    lighting: "Broadcast LED Stadium 800 Lux",
    isActive: true,
  },
];

export const PROMO_RULES: Record<string, { type: "percent" | "fixed"; value: number; label: string; minTotal?: number }> = {
  FUTSALIN10: { type: "percent", value: 10, label: "Diskon 10% Spesial" },
  MAINMALAM: { type: "fixed", value: 20000, label: "Potongan Rp 20.000 Prime Time", minTotal: 100000 },
  FIRSTMATCH: { type: "fixed", value: 25000, label: "Diskon Member Baru Rp 25.000", minTotal: 120000 },
};

// In-Memory Database Simulation
const bookingsDb: BookingRecord[] = [
  {
    id: "b-101",
    bookingCode: "FSI-DEMO01",
    courtId: 1,
    courtName: "Lapangan Standar Interlock",
    date: new Date().toISOString().split("T")[0],
    slots: ["19:00", "20:00"],
    name: "Rizky Pratama",
    phone: "081298765432",
    email: "rizky@example.com",
    addons: ["Rompi Tanding (2 Warna)"],
    subtotalCourt: 300000,
    subtotalAddons: 0,
    discountAmount: 30000,
    totalPrice: 270000,
    voucherCode: "FUTSALIN10",
    status: "PAID",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "b-102",
    bookingCode: "FSI-DEMO02",
    courtId: 2,
    courtName: "Lapangan Vinyl Deluxe",
    date: new Date().toISOString().split("T")[0],
    slots: ["15:00"],
    name: "Budi Santoso",
    phone: "081345678901",
    email: "budi@example.com",
    addons: ["Sewa Sepatu Futsal", "Air Mineral Cold Pack"],
    subtotalCourt: 200000,
    subtotalAddons: 45000,
    discountAmount: 20000,
    totalPrice: 225000,
    voucherCode: "MAINMALAM",
    status: "PENDING_PAYMENT",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  }
];

export async function getAllCourts(): Promise<CourtData[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("courts").select("*").order("id", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: Number(c.id),
          name: c.name,
          floor: c.floor,
          size: c.size,
          price: Number(c.price),
          image: c.image,
          tagline: c.tagline || "",
          description: c.description || "",
          features: c.features || [],
          recommendedFor: c.recommended_for || "",
          lighting: c.lighting || "",
          isActive: c.is_active !== false,
        }));
      }
    } catch {
      // Fallback
    }
  }
  return COURTS_DATA;
}

export async function getCourtById(id: number): Promise<CourtData | undefined> {
  const courts = await getAllCourts();
  return courts.find((c) => c.id === id);
}

export async function createCourt(data: Omit<CourtData, "id">): Promise<CourtData> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from("courts")
        .insert([
          {
            name: data.name,
            floor: data.floor,
            size: data.size,
            price: data.price,
            image: data.image,
            tagline: data.tagline,
            description: data.description,
            features: data.features,
            recommended_for: data.recommendedFor,
            lighting: data.lighting,
            is_active: data.isActive !== false,
          },
        ])
        .select()
        .single();

      if (!error && inserted) {
        return {
          id: Number(inserted.id),
          name: inserted.name,
          floor: inserted.floor,
          size: inserted.size,
          price: Number(inserted.price),
          image: inserted.image,
          tagline: inserted.tagline || "",
          description: inserted.description || "",
          features: inserted.features || [],
          recommendedFor: inserted.recommended_for || "",
          lighting: inserted.lighting || "",
          isActive: inserted.is_active !== false,
        };
      }
    } catch {
      // Fallback
    }
  }

  const newId = COURTS_DATA.length > 0 ? Math.max(...COURTS_DATA.map((c) => c.id)) + 1 : 1;
  const newCourt: CourtData = {
    ...data,
    id: newId,
    isActive: true,
  };

  COURTS_DATA.push(newCourt);
  return newCourt;
}

export async function updateCourtActive(id: number, isActive: boolean): Promise<CourtData | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: updated, error } = await supabase
        .from("courts")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();

      if (!error && updated) {
        return {
          id: Number(updated.id),
          name: updated.name,
          floor: updated.floor,
          size: updated.size,
          price: Number(updated.price),
          image: updated.image,
          tagline: updated.tagline || "",
          description: updated.description || "",
          features: updated.features || [],
          recommendedFor: updated.recommended_for || "",
          lighting: updated.lighting || "",
          isActive: updated.is_active !== false,
        };
      }
    } catch {
      // Fallback
    }
  }

  const court = COURTS_DATA.find((c) => c.id === id);
  if (court) {
    court.isActive = isActive;
    return court;
  }
  return null;
}

export async function getAllBookings(): Promise<BookingRecord[]> {
  let supabaseBookings: BookingRecord[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        supabaseBookings = data.map((b: any) => ({
          id: b.id,
          bookingCode: b.booking_code,
          courtId: Number(b.court_id),
          courtName: b.court_name,
          date: b.date,
          slots: b.slots || [],
          name: b.customer_name,
          phone: b.customer_phone,
          email: b.customer_email,
          addons: b.addons || [],
          subtotalCourt: Number(b.subtotal_court),
          subtotalAddons: Number(b.subtotal_addons || 0),
          discountAmount: Number(b.discount_amount || 0),
          totalPrice: Number(b.total_price),
          voucherCode: b.voucher_code || undefined,
          status: b.status || "PENDING_PAYMENT",
          createdAt: b.created_at,
        }));
      }
    } catch {
      // Fallback
    }
  }

  const diskBookings = loadDiskCache();
  const map = new Map<string, BookingRecord>();

  bookingsDb.forEach((b) => map.set(b.bookingCode.toUpperCase(), b));
  diskBookings.forEach((b) => map.set(b.bookingCode.toUpperCase(), b));
  supabaseBookings.forEach((b) => map.set(b.bookingCode.toUpperCase(), b));

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getBookingByCode(code: string): Promise<BookingRecord | undefined> {
  const cleanCode = code.trim().toUpperCase();
  const bookings = await getAllBookings();
  return bookings.find((b) => b.bookingCode.toUpperCase() === cleanCode);
}

export async function createBooking(data: Omit<BookingRecord, "id" | "bookingCode" | "status" | "createdAt">): Promise<BookingRecord> {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const bookingCode = `FSI-${randomStr}`;
  const nowIso = new Date().toISOString();

  let createdRecord: BookingRecord | null = null;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from("bookings")
        .insert([
          {
            booking_code: bookingCode,
            court_id: data.courtId,
            court_name: data.courtName,
            date: data.date,
            slots: data.slots,
            customer_name: data.name,
            customer_phone: data.phone,
            customer_email: data.email,
            addons: data.addons,
            subtotal_court: data.subtotalCourt,
            subtotal_addons: data.subtotalAddons,
            discount_amount: data.discountAmount,
            total_price: data.totalPrice,
            voucher_code: data.voucherCode,
            status: "PENDING_PAYMENT",
          },
        ])
        .select()
        .single();

      if (!error && inserted) {
        createdRecord = {
          id: inserted.id,
          bookingCode: inserted.booking_code,
          courtId: Number(inserted.court_id),
          courtName: inserted.court_name,
          date: inserted.date,
          slots: inserted.slots || [],
          name: inserted.customer_name,
          phone: inserted.customer_phone,
          email: inserted.customer_email,
          addons: inserted.addons || [],
          subtotalCourt: Number(inserted.subtotal_court),
          subtotalAddons: Number(inserted.subtotal_addons || 0),
          discountAmount: Number(inserted.discount_amount || 0),
          totalPrice: Number(inserted.total_price),
          voucherCode: inserted.voucher_code || undefined,
          status: inserted.status || "PENDING_PAYMENT",
          createdAt: inserted.created_at,
        };
      }
    } catch {
      // Fallback
    }
  }

  const fallbackBooking: BookingRecord = createdRecord || {
    ...data,
    id: `b-${Date.now()}`,
    bookingCode,
    status: "PENDING_PAYMENT",
    createdAt: nowIso,
  };

  // Sync memory DB & disk cache
  const existingIdx = bookingsDb.findIndex((b) => b.bookingCode.toUpperCase() === bookingCode.toUpperCase());
  if (existingIdx >= 0) {
    bookingsDb[existingIdx] = fallbackBooking;
  } else {
    bookingsDb.unshift(fallbackBooking);
  }
  saveDiskCache(bookingsDb);

  return fallbackBooking;
}

export async function updateBookingStatus(code: string, status: "PAID" | "CANCELLED"): Promise<BookingRecord | null> {
  const cleanCode = code.trim().toUpperCase();

  // Sync memory DB
  const localBooking = bookingsDb.find((b) => b.bookingCode.toUpperCase() === cleanCode);
  if (localBooking) {
    localBooking.status = status;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: updated, error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("booking_code", cleanCode)
        .select()
        .single();

      if (!error && updated) {
        const record = {
          id: updated.id,
          bookingCode: updated.booking_code,
          courtId: Number(updated.court_id),
          courtName: updated.court_name,
          date: updated.date,
          slots: updated.slots || [],
          name: updated.customer_name,
          phone: updated.customer_phone,
          email: updated.customer_email,
          addons: updated.addons || [],
          subtotalCourt: Number(updated.subtotal_court),
          subtotalAddons: Number(updated.subtotal_addons || 0),
          discountAmount: Number(updated.discount_amount || 0),
          totalPrice: Number(updated.total_price),
          voucherCode: updated.voucher_code || undefined,
          status: updated.status,
          createdAt: updated.created_at,
        };
        saveDiskCache(bookingsDb);
        return record;
      }
    } catch {
      // Fallback
    }
  }

  saveDiskCache(bookingsDb);
  return localBooking || null;
}
