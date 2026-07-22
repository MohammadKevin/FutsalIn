import { NextResponse, NextRequest } from "next/server";
import { getAllCourts, createCourt, updateCourtActive } from "@/app/lib/bookingStore";

export async function GET() {
  const courts = await getAllCourts();
  return NextResponse.json({
    success: true,
    data: courts,
    message: "Berhasil mengambil data lapangan",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      floor,
      size,
      price,
      image,
      tagline = "",
      description = "",
      features = [],
      recommendedFor = "",
      lighting = "LED Standard 400 Lux",
    } = body;

    if (!name || !floor || !price) {
      return NextResponse.json(
        { success: false, message: "Nama lapangan, tipe lantai, dan harga wajib diisi." },
        { status: 400 }
      );
    }

    const newCourt = await createCourt({
      name,
      floor,
      size: size || "25m x 15m",
      price: Number(price),
      image: image || "/img/13c3423cd3d2e12a6087d33e14093615.jpg",
      tagline,
      description,
      features: Array.isArray(features) ? features : [features],
      recommendedFor,
      lighting,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      data: newCourt,
      message: "Lapangan baru berhasil ditambahkan!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan lapangan baru." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive } = body;

    if (id === undefined || isActive === undefined) {
      return NextResponse.json(
        { success: false, message: "ID lapangan dan status aktif wajib diisi." },
        { status: 400 }
      );
    }

    const updated = await updateCourtActive(Number(id), Boolean(isActive));
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Lapangan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Status lapangan ${updated.name} berhasil diperbarui.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status lapangan." },
      { status: 500 }
    );
  }
}
