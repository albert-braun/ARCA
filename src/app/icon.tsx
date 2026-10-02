import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e3f33",
          color: "#f3efe6",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        A
      </div>
    ),
    size,
  );
}
