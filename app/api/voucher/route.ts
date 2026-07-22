import { NextResponse, NextRequest } from "next/server";
import { PROMO_RULES } from "@/app/lib/bookingStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, grossTotal } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, message: "Kode voucher tidak valid" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const rule = PROMO_RULES[cleanCode];

    if (!rule) {
      return NextResponse.json(
        { success: false, message: "Kode voucher tidak ditemukan. Coba FUTSALIN10 atau MAINMALAM." },
        { status: 404 }
      );
    }

    const subtotal = Number(grossTotal) || 0;
    if (rule.minTotal && subtotal < rule.minTotal) {
      return NextResponse.json(
        {
          success: false,
          message: `Voucher "${cleanCode}" memerlukan minimal transaksi Rp ${rule.minTotal.toLocaleString("id-ID")}`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (rule.type === "percent") {
      discountAmount = Math.round((subtotal * rule.value) / 100);
    } else {
      discountAmount = Math.min(rule.value, subtotal);
    }

    return NextResponse.json({
      success: true,
      data: {
        code: cleanCode,
        label: rule.label,
        discountAmount,
      },
      message: `Voucher "${cleanCode}" berhasil digunakan!`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat memproses voucher" },
      { status: 500 }
    );
  }
}
