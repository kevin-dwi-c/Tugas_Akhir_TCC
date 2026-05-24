import type { ReactNode } from "react";
import type { ResponseStatus, UrgencyLevel } from "../../models/types";
import { responseLabel, urgencyLabel } from "../../models/status";

type Variant = "safe" | "low" | "critical" | "neutral" | "info";

interface Props {
  variant?: Variant;
  children?: ReactNode;
  urgency?: UrgencyLevel;
  response?: ResponseStatus;
}

export default function StatusBadge({ variant = "neutral", children, urgency, response }: Props) {
  const computed = urgency === "CRITICAL" ? "critical" : urgency === "URGENT" ? "low" : response === "CHECKED_IN" ? "safe" : variant;
  return <span className={`status-badge ${computed}`}>{children ?? (urgency ? urgencyLabel(urgency) : response ? responseLabel(response) : "")}</span>;
}
