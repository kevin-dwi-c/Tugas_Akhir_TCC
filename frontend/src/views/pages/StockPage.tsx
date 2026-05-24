import { type FormEvent, useEffect, useState } from "react";
import { bankDarahController } from "../../controllers/bankDarahController";
import type { BloodStock, BloodType, ProductType } from "../../models/types";
import { bloodTypes, productTypes } from "../../models/status";
import { StockTable } from "../components/DataTables";
import PageHeader from "../layout/PageHeader";

export default function StockPage() {
  const [stock, setStock] = useState<BloodStock[]>([]);
  const [form, setForm] = useState({ bloodType: "O-" as BloodType, productType: "PRC" as ProductType, mode: "add", quantity: 1, reference: "" });

  const load = () => bankDarahController.stock().then(setStock);
  useEffect(() => {
    load();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await bankDarahController.updateStock(form.bloodType, form.productType, {
      mode: form.mode,
      quantity: form.quantity,
      reference: form.reference,
    });
    load();
  }

  return (
    <>
      <PageHeader eyebrow="Transaksi stok" title="Input & Update Stok Darah" />
      <form className="panel compact-form" onSubmit={submit}>
        <select value={form.bloodType} onChange={(event) => setForm({ ...form, bloodType: event.target.value as BloodType })}>
          {bloodTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        <select value={form.productType} onChange={(event) => setForm({ ...form, productType: event.target.value as ProductType })}>
          {productTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        <select value={form.mode} onChange={(event) => setForm({ ...form, mode: event.target.value })}>
          <option value="add">Tambah</option>
          <option value="subtract">Kurangi</option>
          <option value="set">Set jumlah</option>
        </select>
        <input min={0} type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} />
        <input value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} placeholder="Referensi" />
        <button className="btn primary" type="submit">
          Simpan
        </button>
      </form>
      <section className="panel">
        <StockTable stock={stock} />
      </section>
    </>
  );
}
