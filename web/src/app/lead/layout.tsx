import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Required",
  description: "Please provide your information to continue",
};

export default function LeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {children}
    </div>
  );
}