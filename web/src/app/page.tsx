import QrGenerator from "@/components/QrGenerator";
import AuthLandingPage from "@/components/AuthLandingPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // If user is authenticated, show the QR Generator
  if (session?.user) {
    return (
      <div className="flex flex-col">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Create Your QR Code
              </h2>
              <p className="text-lg text-muted-foreground">
                Start creating professional QR codes in seconds
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <QrGenerator />
            </div>
          </div>
        </section>
      </div>
    );
  }

  // If user is not authenticated, show the landing page
  return <AuthLandingPage />;
}