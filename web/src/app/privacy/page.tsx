import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Privacy Policy - AXIO QR",
  description: "Learn how AXIO QR protects your privacy and handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="prose prose-gray max-w-none">
        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-muted-foreground mb-4">
            AXIO QR ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our QR code generation and analytics platform.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          
          <h3 className="text-xl font-medium mb-3">Personal Information</h3>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li><strong>Account Information:</strong> Email address, name, and password when you create an account</li>
            <li><strong>QR Code Data:</strong> Labels, destination URLs, and custom styling preferences you provide</li>
            <li><strong>Communication:</strong> Messages you send us through contact forms or support channels</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">Automatically Collected Information</h3>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li><strong>Usage Analytics:</strong> QR code scan events, including IP addresses, geographic location, device information, and referrer URLs</li>
            <li><strong>Technical Data:</strong> Browser type, operating system, and device identifiers</li>
            <li><strong>Cookies:</strong> Session cookies for authentication and preference storage</li>
          </ul>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Provide and maintain our QR code generation and analytics services</li>
            <li>Process your account registration and authentication</li>
            <li>Generate analytics and insights about QR code performance</li>
            <li>Improve our platform and develop new features</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Send important service updates and security notifications</li>
            <li>Comply with legal obligations and protect against fraud</li>
          </ul>
        </section>

        {/* Data Sharing */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
          <p className="text-muted-foreground mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li><strong>Service Providers:</strong> Trusted third-party services that help us operate our platform (hosting, analytics, email services)</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
            <li><strong>Safety and Security:</strong> To protect the rights, property, or safety of AXIO QR, our users, or others</li>
            <li><strong>Business Transfers:</strong> In connection with any merger, sale of assets, or acquisition</li>
          </ul>
        </section>

        {/* Data Security */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="text-muted-foreground mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure password hashing using industry-standard algorithms</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Access controls and employee training on data protection</li>
            <li>Secure hosting infrastructure with monitoring and backup systems</li>
          </ul>
        </section>

        {/* Data Retention */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
          <p className="text-muted-foreground mb-4">
            We retain your information for as long as necessary to provide our services and comply with legal obligations:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li><strong>Account Data:</strong> Until you delete your account or request data deletion</li>
            <li><strong>QR Code Data:</strong> Until you delete individual QR codes or your account</li>
            <li><strong>Analytics Data:</strong> Aggregated and anonymized data may be retained longer for service improvement</li>
          </ul>
        </section>

        {/* Your Rights */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights and Choices</h2>
          <p className="text-muted-foreground mb-4">
            You have the following rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Update or correct inaccurate personal information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information and account</li>
            <li><strong>Portability:</strong> Request a machine-readable copy of your data</li>
            <li><strong>Objection:</strong> Object to certain processing of your personal information</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            To exercise these rights, please contact us at <a href="mailto:privacy@axioqr.com" className="text-primary hover:underline">privacy@axioqr.com</a>
          </p>
        </section>

        {/* Cookies */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
          <p className="text-muted-foreground mb-4">
            We use cookies and similar technologies to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Keep you signed in to your account</li>
            <li>Remember your preferences and settings</li>
            <li>Analyze how our platform is used</li>
            <li>Improve platform performance and user experience</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            You can control cookies through your browser settings, but disabling cookies may affect platform functionality.
          </p>
        </section>

        {/* International Transfers */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
          <p className="text-muted-foreground mb-4">
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your personal information in accordance with applicable data protection laws.
          </p>
        </section>

        {/* Children's Privacy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p className="text-muted-foreground mb-4">
            Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us, and we will take steps to remove such information.
          </p>
        </section>

        {/* Updates */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
          <p className="text-muted-foreground mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
          </p>
        </section>

        {/* Contact */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul className="list-none mb-4 text-muted-foreground">
            <li><strong>Email:</strong> <a href="mailto:privacy@axioqr.com" className="text-primary hover:underline">privacy@axioqr.com</a></li>
            <li><strong>Support:</strong> <Link href="/support" className="text-primary hover:underline">Contact Support</Link></li>
          </ul>
        </section>
      </div>

      {/* Back to top */}
      <div className="text-center mt-12">
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}