interface MetricProps {
  label: string;
  value: number;
  tone: "danger" | "warning" | "success" | "info";
}

export default function Metric({ label, value, tone }: MetricProps) {
  return (
    <article className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
