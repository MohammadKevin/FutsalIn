import { NextResponse, NextRequest } from "next/server";
import {
  getCourtById,
  createBooking,
  getBookingByCode,
  getAllBookings,
  updateBookingStatus,
  PROMO_RULES,
} from "@/app/lib/bookingStore";

// GET /api/bookings?code=FSI-XXXXXX
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (code) {
    const booking = await getBookingByCode(code);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Kode booking tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: booking });
  }

  const allBookings = await getAllBookings();
  return NextResponse.json({ success: true, data: allBookings });
}

// POST /api/bookings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      courtId,
      date,
      slots,
      name,
      phone,
      email,
      addons = [],
      voucherCode,
    } = body;

    // Validation
    if (!courtId || !date || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { success: false, message: "Mohon lengkapi lapangan, tanggal, dan slot jam." },
        { status: 400 }
      );
    }

    if (!name || !phone || !email) {
      return NextResponse.json(
        { success: false, message: "Data pemesan (Nama, No WA, Email) wajib diisi." },
        { status: 400 }
      );
    }

    const court = await getCourtById(Number(courtId));
    if (!court) {
      return NextResponse.json(
        { success: false, message: "Lapangan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Calculations
    const subtotalCourt = slots.length * court.price;
    let subtotalAddons = 0;

    const addonPriceMap: Record<string, number> = {
      "Sewa Sepatu Futsal": 15000,
      "Rompi Tanding (2 Warna)": 0,
      "Bola Match FIFA Spec": 20000,
      "Wasit Lisensi PSSI": 100000,
      "Air Mineral Cold Pack": 30000,
    };

    addons.forEach((addonName: string) => {
      Object.keys(addonPriceMap).forEach((key) => {
        if (addonName.includes(key)) {
          subtotalAddons += addonPriceMap[key];
        }
      });
    });

    const grossTotal = subtotalCourt + subtotalAddons;
    let discountAmount = 0;

    if (voucherCode) {
      const cleanCode = String(voucherCode).trim().toUpperCase();
      const promo = PROMO_RULES[cleanCode];
      if (promo) {
        if (promo.type === "percent") {
          discountAmount = Math.round((grossTotal * promo.value) / 100);
        } else {
          discountAmount = Math.min(promo.value, grossTotal);
        }
      }
    }

    const totalPrice = Math.max(0, grossTotal - discountAmount);

    // Save to store or Supabase
    const booking = await createBooking({
      courtId: court.id,
      courtName: court.name,
      date,
      slots,
      name,
      phone,
      email,
      addons,
      subtotalCourt,
      subtotalAddons,
      discountAmount,
      totalPrice,
      voucherCode,
    });

    return NextResponse.json({
      success: true,
      data: booking,
      message: "Reservasi berhasil dibuat! Silakan lanjutkan pembayaran.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal membuat reservasi." },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings (Update payment status)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, status } = body;

    if (!code || !status) {
      return NextResponse.json(
        { success: false, message: "Kode booking dan status wajib diberikan." },
        { status: 400 }
      );
    }

    const updated = await updateBookingStatus(code, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Booking tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Status booking ${code} berhasil diperbarui menjadi ${status}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status booking." },
      { status: 500 }
    );
  }
}
