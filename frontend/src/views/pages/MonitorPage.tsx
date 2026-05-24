import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { bankDarahController } from "../../controllers/bankDarahController";
import type { EmergencyRequest, LiveResponse } from "../../models/types";
import { formatDateTime } from "../../models/status";
import Metric from "../components/Metric";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../layout/PageHeader";

export default function MonitorPage() {
  const { id = "" } = useParams();
  const [responses, setResponses] = useState<LiveResponse[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);

  useEffect(() => {
    bankDarahController.requests().then(setRequests);
    const load = () => bankDarahController.liveResponses(id).then(setResponses);
    load();
    const timer = window.setInterval(load, 2500);
    return () => window.clearInterval(timer);
  }, [id]);

  const request = requests.find((item) => item.id === id);
  const counts = {
    accepted: responses.filter((item) => item.status === "ACCEPTED").length,
    way: responses.filter((item) => item.status === "ON_THE_WAY").length,
    checked: responses.filter((item) => item.status === "CHECKED_IN").length,
    declined: responses.filter((item) => item.status === "DECLINED").length,
  };

  return (
    <>
      <PageHeader eyebrow="Live response dashboard" title={request ? `Monitor ${request.hospitalName}` : "Monitor Broadcast"} />
      <section className="metric-grid">
        <Metric label="Siap Donor" value={counts.accepted} tone="success" />
        <Metric label="Menuju PMI" value={counts.way} tone="info" />
        <Metric label="Check-in" value={counts.checked} tone="success" />
        <Metric label="Tidak Bisa" value={counts.declined} tone="warning" />
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>Respons Pendonor</h2>
          <span className="live-dot">Auto-update</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Golongan</th>
                <th>Jarak</th>
                <th>Status</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((response) => (
                <tr key={response.id}>
                  <td>{response.donorName}</td>
                  <td>{response.bloodType}</td>
                  <td>{response.distanceKm.toFixed(1)} km</td>
                  <td>
                    <StatusBadge response={response.status} />
                  </td>
                  <td>{formatDateTime(response.respondedAt)}</td>
                </tr>
              ))}
              {responses.length === 0 && (
                <tr>
                  <td colSpan={5}>Belum ada respons masuk.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
