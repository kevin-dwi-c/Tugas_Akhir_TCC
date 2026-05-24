import { ArrowLeft, Power } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { bankDarahController } from "../../controllers/bankDarahController";
import type { Donor } from "../../models/types";
import { formatDate } from "../../models/status";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../layout/PageHeader";

export default function DonorDetailPage() {
  const { id = "" } = useParams();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    bankDarahController.donor(id).then(setDonor);
  }, [id]);

  async function toggleStatus() {
    if (!donor) return;

    setSaving(true);
    const updated = await bankDarahController.updateDonorStatus(donor.id, !donor.isActive);
    setDonor(updated);
    setSaving(false);
  }

  if (!donor) return <Loading title="Memuat profil donor" />;

  return (
    <>
      <PageHeader
        eyebrow="Profil pendonor"
        title={donor.fullName}
        action={
          <div className="header-actions">
            <Link className="btn secondary" to="/donors">
              <ArrowLeft size={18} />
              Kembali
            </Link>
            <button className="btn danger" disabled={saving} onClick={toggleStatus} type="button">
              <Power size={18} />
              {donor.isActive ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>
        }
      />
      <section className="panel profile-detail">
        <div className="avatar large">{donor.bloodType}</div>
        <div>
          <dl>
            <div>
              <dt>Status Donor</dt>
              <dd>
                <StatusBadge variant={donor.isEligible ? "safe" : "low"}>{donor.isEligible ? "Eligible" : "Jeda donor"}</StatusBadge>
              </dd>
            </div>
            <div>
              <dt>Status Akun</dt>
              <dd>
                <StatusBadge variant={donor.isActive ? "safe" : "critical"}>{donor.isActive ? "Aktif" : "Nonaktif"}</StatusBadge>
              </dd>
            </div>
            <div>
              <dt>Telepon</dt>
              <dd>{donor.phone}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{donor.email ?? "-"}</dd>
            </div>
            <div>
              <dt>Alamat</dt>
              <dd>{donor.address}</dd>
            </div>
            <div>
              <dt>Token QR</dt>
              <dd>{donor.uuid}</dd>
            </div>
            <div>
              <dt>Donor Terakhir</dt>
              <dd>{formatDate(donor.lastDonation)}</dd>
            </div>
            <div>
              <dt>Eligible Berikutnya</dt>
              <dd>{formatDate(donor.nextEligible)}</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>Riwayat Donasi</h2>
          <span className="subtle">{donor.donationHistory?.length ?? 0} catatan</span>
        </div>
        <div className="history-list">
          {donor.donationHistory?.map((record) => (
            <div key={record.id}>
              <strong>{formatDate(record.date)}</strong>
              <span>
                {record.location} - {record.status}
              </span>
              <small>
                TD {record.bloodPressure}, Hb {record.hemoglobin}, BB {record.weight} kg
              </small>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
