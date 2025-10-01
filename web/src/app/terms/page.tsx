import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Terms of Service - AXIO QR",
  description: "Read the terms and conditions for using AXIO QR platform.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="prose prose-gray max-w-none">
        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
          <p className="text-muted-foreground mb-4">
            By accessing and using AXIO QR ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
          </p>
          <p className="text-muted-foreground mb-4">
            These Terms constitute a legally binding agreement between you and AXIO QR regarding your use of our QR code generation and analytics platform.
          </p>
        </section>

        {/* Description of Service */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
          <p className="text-muted-foreground mb-4">
            AXIO QR provides a platform for creating, customizing, and tracking QR codes. Our services include:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>QR code generation with custom styling and logos</li>
            <li>Analytics and tracking of QR code scans</li>
            <li>URL metadata extraction and display</li>
            <li>Export functionality for analytics reports</li>
            <li>Account management and QR code organization</li>
          </ul>
        </section>

        {/* User Accounts */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
          <h3 className="text-xl font-medium mb-3">Account Creation</h3>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must be at least 13 years old to create an account</li>
            <li>One person may not maintain more than one account without our permission</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">Account Security</h3>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
            <li>We reserve the right to suspend or terminate accounts for security reasons</li>
          </ul>
        </section>

        {/* Acceptable Use */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Acceptable Use Policy</h2>
          <p className="text-muted-foreground mb-4">
            You agree to use AXIO QR only for lawful purposes and in accordance with these Terms. You agree NOT to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Create QR codes that link to illegal, harmful, or malicious content</li>
            <li>Use the Service for phishing, spam, or fraud</li>
            <li>Create QR codes containing malware, viruses, or harmful code</li>
            <li>Violate any applicable laws, regulations, or third-party rights</li>
            <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
            <li>Use the Service to harass, abuse, or harm others</li>
            <li>Create content that infringes on intellectual property rights</li>
            <li>Use automated tools to access the Service without permission</li>
          </ul>
        </section>

        {/* Content and Intellectual Property */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Content and Intellectual Property</h2>
          
          <h3 className="text-xl font-medium mb-3">Your Content</h3>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>You retain ownership of the content you upload or create using our Service</li>
            <li>You grant us a license to use, store, and display your content as necessary to provide the Service</li>
            <li>You are responsible for ensuring you have the right to use any logos, images, or content you upload</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">Our Intellectual Property</h3>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>AXIO QR and its features are protected by intellectual property laws</li>
            <li>You may not copy, modify, or create derivative works of our platform</li>
            <li>Our trademarks and logos may not be used without permission</li>
          </ul>
        </section>

        {/* Privacy and Data */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Privacy and Data</h2>
          <p className="text-muted-foreground mb-4">
            Your privacy is important to us. Our collection and use of your information is governed by our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>We collect analytics data when your QR codes are scanned</li>
            <li>You can delete your QR codes and associated data at any time</li>
            <li>We implement security measures to protect your data</li>
          </ul>
        </section>

        {/* Service Availability */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>We strive to maintain high service availability but cannot guarantee 100% uptime</li>
            <li>We may perform maintenance that temporarily affects service availability</li>
            <li>We reserve the right to modify or discontinue features with notice</li>
            <li>You are responsible for maintaining backups of your important QR codes</li>
          </ul>
        </section>

        {/* Limitations and Disclaimers */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Limitations and Disclaimers</h2>
          
          <h3 className="text-xl font-medium mb-3">Service Limitations</h3>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>We may impose limits on QR code creation, storage, or analytics data retention</li>
            <li>Large files or excessive usage may be subject to restrictions</li>
            <li>We reserve the right to remove content that violates these Terms</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">Disclaimers</h3>
          <p className="text-muted-foreground mb-4">
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
        </section>

        {/* Liability */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, AXIO QR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Loss of profits, data, or business opportunities</li>
            <li>Service interruptions or data loss</li>
            <li>Third-party actions or content accessed through QR codes</li>
            <li>Unauthorized access to your account or data</li>
          </ul>
        </section>

        {/* Termination */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Termination</h2>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>You may terminate your account at any time by contacting us</li>
            <li>We may suspend or terminate your account for violations of these Terms</li>
            <li>Upon termination, your access to the Service will cease</li>
            <li>We may retain certain information as required by law or for legitimate business purposes</li>
          </ul>
        </section>

        {/* Governing Law */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Governing Law and Disputes</h2>
          <p className="text-muted-foreground mb-4">
            These Terms are governed by the laws of the jurisdiction where AXIO QR operates. Any disputes arising from these Terms or your use of the Service will be resolved through:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Good faith negotiations between the parties</li>
            <li>Binding arbitration if negotiations fail</li>
            <li>Courts of competent jurisdiction as a last resort</li>
          </ul>
        </section>

        {/* Changes to Terms */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to These Terms</h2>
          <p className="text-muted-foreground mb-4">
            We reserve the right to modify these Terms at any time. When we make changes:
          </p>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>We will update the "Last updated" date at the top of this page</li>
            <li>Significant changes will be communicated via email or platform notification</li>
            <li>Your continued use of the Service constitutes acceptance of the updated Terms</li>
            <li>If you disagree with changes, you should discontinue use of the Service</li>
          </ul>
        </section>

        {/* Contact Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="text-muted-foreground mb-4">
            If you have questions about these Terms, please contact us:
          </p>
          <ul className="list-none mb-4 text-muted-foreground">
            <li><strong>Email:</strong> <a href="mailto:legal@axioqr.com" className="text-primary hover:underline">legal@axioqr.com</a></li>
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