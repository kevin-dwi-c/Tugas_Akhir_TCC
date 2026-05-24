import { Activity, Droplets } from "lucide-react";
import type { BloodStock, BloodType } from "../../models/types";
import { stockLabel, stockLevel } from "../../models/status";
import StatusBadge from "./StatusBadge";

interface Props {
  bloodType: BloodType;
  items: BloodStock[];
}

export default function BloodTypeCard({ bloodType, items }: Props) {
  const total = items.reduce((sum, item) => sum + item.quantity, 0);
  const worst = items.some((item) => stockLevel(item) === "critical")
    ? "critical"
    : items.some((item) => stockLevel(item) === "low")
      ? "low"
      : "safe";

  return (
    <article className={`blood-card ${worst}`}>
      <div className="blood-card__header">
        <div className="blood-card__type">
          <Droplets size={22} />
          <strong>{bloodType}</strong>
        </div>
        <StatusBadge variant={worst}>{worst === "critical" ? "Kritis" : worst === "low" ? "Menipis" : "Aman"}</StatusBadge>
      </div>
      <div className="blood-card__total">
        <span>{total}</span>
        <small>kantong total</small>
      </div>
      <div className="product-grid">
        {items.map((item) => (
          <div className="product-pill" key={item.id}>
            <span>{item.productType}</span>
            <strong>{item.quantity}</strong>
            <small>{stockLabel(item)}</small>
          </div>
        ))}
      </div>
      {worst === "critical" && (
        <div className="critical-strip">
          <Activity size={14} />
          <span>Butuh prioritas stok</span>
        </div>
      )}
    </article>
  );
}
