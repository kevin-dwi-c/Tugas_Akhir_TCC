import { BarChart3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { bankDarahController } from "../../controllers/bankDarahController";
import type { BloodStock, Donor, EmergencyRequest } from "../../models/types";
import { stockLevel } from "../../models/status";
import { RequestTable, StockTable } from "../components/DataTables";
import Metric from "../components/Metric";
import PageHeader from "../layout/PageHeader";

export default function ReportsPage() {
  const [stock, setStock] = useState<BloodStock[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);

  useEffect(() => {
    bankDarahController.stock().then(setStock);
    bankDarahController.requests().then(setRequests);
    bankDarahController.donors().then(setDonors);
  }, []);

  const summary = useMemo(
    () => ({
      totalStock: stock.reduce((sum, item) => sum + item.quantity, 0),
      criticalStock: stock.filter((item) => stockLevel(item) === "critical").length,
      activeRequests: requests.filter((request) => request.status === "ACTIVE" || request.status === "PENDING").length,
      eligibleDonors: donors.filter((donor) => donor.isEligible && donor.isActive).length,
    }),
    [donors, requests, stock],
  );

  return (
    <>
      <PageHeader eyebrow="Rekap operasional" title="Laporan Bank Darah" action={<BarChart3 size={28} />} />
      <section className="metric-grid">
        <Metric label="Total Kantong" value={summary.totalStock} tone="info" />
        <Metric label="Stok Kritis" value={summary.criticalStock} tone="danger" />
        <Metric label="Request Aktif" value={summary.activeRequests} tone="warning" />
        <Metric label="Donor Eligible" value={summary.eligibleDonors} tone="success" />
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>Permintaan Darurat</h2>
          <span className="subtle">{requests.length} permintaan</span>
        </div>
        <RequestTable requests={requests} />
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>Ringkasan Stok</h2>
          <span className="subtle">{stock.length} kombinasi darah dan produk</span>
        </div>
        <StockTable stock={stock} />
      </section>
    </>
  );
}
