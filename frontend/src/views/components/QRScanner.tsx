import { Camera, Keyboard, ScanLine, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onScan: (value: string) => void;
}

export default function QRScanner({ onScan }: Props) {
  const [manual, setManual] = useState("QR-DEMO-001");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void | Promise<void> } | null>(null);
  const regionId = "qr-reader";

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => undefined);
      }
    };
  }, []);

  async function startCamera() {
    setError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          onScan(decodedText);
          stopCamera();
        },
        () => undefined
      );
      setRunning(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kamera tidak tersedia");
      setRunning(false);
    }
  }

  async function stopCamera() {
    if (!scannerRef.current) return;
    try {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
    } catch {
      // Camera tracks may already be closed by the browser.
    } finally {
      scannerRef.current = null;
      setRunning(false);
    }
  }

  return (
    <section className="scanner-panel">
      <div className="scanner-frame">
        <div id={regionId} />
        {!running && (
          <div className="scanner-placeholder">
            <ScanLine size={44} />
            <span>QR scanner</span>
          </div>
        )}
      </div>
      <div className="button-row">
        <button className="btn primary" type="button" onClick={running ? stopCamera : startCamera}>
          {running ? <Square size={18} /> : <Camera size={18} />}
          {running ? "Stop Kamera" : "Aktifkan Kamera"}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="manual-scan">
        <Keyboard size={18} />
        <input value={manual} onChange={(event) => setManual(event.target.value)} />
        <button className="btn secondary" type="button" onClick={() => onScan(manual)}>
          Pakai Token
        </button>
      </div>
    </section>
  );
}
