import { Building2, Plus } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { bankDarahController } from "../../controllers/bankDarahController";
import type { Hospital } from "../../models/types";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../layout/PageHeader";

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    picName: "",
    picPhone: "",
    email: "",
    latitude: -7.7839,
    longitude: 110.3798,
  });

  const load = () => bankDarahController.hospitals().then(setHospitals);

  useEffect(() => {
    load();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await bankDarahController.createHospital(form);
    setForm({ name: "", address: "", picName: "", picPhone: "", email: "", latitude: -7.7839, longitude: 110.3798 });
    setShowForm(false);
    load();
  }

  return (
    <>
      <PageHeader
        eyebrow="Master data"
        title="Rumah Sakit Mitra"
        action={
          <button className="btn primary" type="button" onClick={() => setShowForm((value) => !value)}>
            <Plus size={18} />
            Tambah RS
          </button>
        }
      />
      {showForm && (
        <form className="panel form-grid" onSubmit={submit}>
          <label>
            Nama Rumah Sakit
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label>
            PIC
            <input value={form.picName} onChange={(event) => setForm({ ...form, picName: event.target.value })} required />
          </label>
          <label>
            Telepon PIC
            <input value={form.picPhone} onChange={(event) => setForm({ ...form, picPhone: event.target.value })} required />
          </label>
          <label>
            Email
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label className="span-2">
            Alamat
            <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          </label>
          <label>
            Latitude
            <input type="number" step="0.0001" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: Number(event.target.value) })} />
          </label>
          <label>
            Longitude
            <input type="number" step="0.0001" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: Number(event.target.value) })} />
          </label>
          <div className="form-actions span-2">
            <button className="btn primary" type="submit">
              Simpan Rumah Sakit
            </button>
          </div>
        </form>
      )}
      <section className="hospital-grid">
        {hospitals.map((hospital) => (
          <article className="hospital-card" key={hospital.id}>
            <Building2 size={24} />
            <h2>{hospital.name}</h2>
            <p>{hospital.address}</p>
            <span>{hospital.picName}</span>
            <span>{hospital.picPhone}</span>
            <StatusBadge variant={hospital.isActive ? "safe" : "critical"}>{hospital.isActive ? "Aktif" : "Nonaktif"}</StatusBadge>
          </article>
        ))}
      </section>
    </>
  );
}
