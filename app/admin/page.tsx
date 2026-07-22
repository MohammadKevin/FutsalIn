import AdminClient from "@/app/components/AdminClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - FutsalIn",
  description: "Dashboard Manajemen Booking & Ketersediaan Lapangan FutsalIn",
};

export default function AdminPage() {
  return <AdminClient />;
}
