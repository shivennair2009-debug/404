"use client";

export default function GridBackground() {
  return (
    <div
      className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none"
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf808_1px,transparent_1px),linear-gradient(to_bottom,#38bdf808_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
      
      {/* Fading grid edges for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-30 pointer-events-none" />
    </div>
  );
}
