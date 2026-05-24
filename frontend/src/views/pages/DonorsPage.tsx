import { Plus, Search } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { bankDarahController } from "../../controllers/bankDarahController";
import type { BloodType, Donor } from "../../models/types";
import { bloodTypes } from "../../models/status";
import { DonorTable } from "../components/DataTables";
import PageHeader from "../layout/PageHeader";

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    bloodType: "O-" as BloodType,
    gender: "M" as Donor["gender"],
    phone: "",
    email: "",
    address: "",
  });

  const load = () => bankDarahController.donors(search).then(setDonors);

  useEffect(() => {
    load();
  }, [search]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await bankDarahController.createDonor(form);
    setForm({ fullName: "", bloodType: "O-", gender: "M", phone: "", email: "", address: "" });
    setShowForm(false);
    load();
  }

  return (
    <>
      <PageHeader
        eyebrow="Master data"
        title="Data Pendonor"
        action={
          <button className="btn primary" type="button" onClick={() => setShowForm((value) => !value)}>
            <Plus size={18} />
            Tambah Donor
          </button>
        }
      />
      <div className="toolbar">
        <Search size={18} />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, telepon, atau golongan darah" />
      </div>
      {showForm && (
        <form className="panel form-grid" onSubmit={submit}>
          <label>
            Nama Lengkap
            <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
          </label>
          <label>
            Golongan Darah
            <select value={form.bloodType} onChange={(event) => setForm({ ...form, bloodType: event.target.value as BloodType })}>
              {bloodTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            Gender
            <select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as Donor["gender"] })}>
              <option value="M">Laki-laki</option>
              <option value="F">Perempuan</option>
            </select>
          </label>
          <label>
            Telepon
            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
          </label>
          <label>
            Email
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label>
            Alamat
            <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required />
          </label>
          <div className="form-actions span-2">
            <button className="btn primary" type="submit">
              Simpan Donor
            </button>
          </div>
        </form>
      )}
      <section className="panel">
        <DonorTable donors={donors} />
      </section>
    </>
  );
}
