import QrGenerator from "@/components/QrGenerator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="flex flex-col">
      {/* QR Generator Section */}
      {session?.user && (
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
      )}

      {/* CTA Section */}
      {!session?.user && (
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses and individuals who trust AXIO QR for their QR code needs.
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-6"
            >
              Sign Up Free - No Credit Card Required
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
