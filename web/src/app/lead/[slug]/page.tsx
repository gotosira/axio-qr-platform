import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const qr = await prisma.qRCode.findUnique({
    where: { slug },
  });
  
  return {
    title: qr ? `Access Required - ${qr.label}` : 'Access Required',
  };
}

export default async function LeadCollectionPage({ params }: PageProps) {
  const { slug } = await params;
  
  const qr = await prisma.qRCode.findUnique({
    where: { slug },
    include: {
      leadTemplate: true,
    },
  });

  if (!qr || !qr.collectLeads) {
    notFound();
  }

  return (
    <LeadForm
      qrId={qr.id}
      destination={qr.destination}
      qrLabel={qr.label}
      template={qr.leadTemplate}
    />
  );
}