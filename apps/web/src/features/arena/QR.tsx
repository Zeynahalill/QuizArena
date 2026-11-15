import { useMemo } from "react";
import qrcode from "./vendor/qrcode.mjs";
export default function QR({ value }: { value: string }) {
  const data = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    let path = "";
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++)
        if (qr.isDark(r, c)) path += `M${c + 4} ${r + 4}h1v1h-1z`;
    return { n: n + 8, path };
  }, [value]);
  return (
    <svg
      className="ar-qr"
      viewBox={`0 0 ${data.n} ${data.n}`}
      role="img"
      aria-label="QR code for the displayed link"
      shapeRendering="crispEdges"
    >
      <rect width={data.n} height={data.n} fill="white" />
      <path d={data.path} fill="#071034" />
    </svg>
  );
}
