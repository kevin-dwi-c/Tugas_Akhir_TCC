import { Activity } from "lucide-react";

export default function Loading({ title }: { title: string }) {
  return (
    <section className="panel loading">
      <Activity className="spin" size={24} />
      <span>{title}</span>
    </section>
  );
}
