"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { toast } from "sonner";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !subject || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    // Simulate form submission
    try {
      // In a real application, you would send this to your support system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Support request submitted successfully! We'll get back to you soon.");
      
      // Reset form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      toast.error("Failed to submit support request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Support Center</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get help with AXIO QR. Find answers to common questions or contact our support team.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">How do I create a QR code?</h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Simply enter your destination URL, customize the appearance with colors and logos, 
                  add a label for easy identification, and click "Create QR Code". Your QR code will 
                  be generated instantly with analytics tracking enabled.
                </p>
              </CardContent>
            </Card>

            {/* FAQ Item 2 */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Can I track QR code scans?</h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! Every QR code includes comprehensive analytics showing scan counts, 
                  geographic data, device information, time patterns, and more. Visit the 
                  Analytics page to see detailed performance metrics.
                </p>
              </CardContent>
            </Card>

            {/* FAQ Item 3 */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">How do I add a logo to my QR code?</h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  When creating a QR code, use the logo upload section to drag and drop your 
                  image file or click to browse. You can adjust the logo size and aspect ratio 
                  to fit your design needs while maintaining QR code scannability.
                </p>
              </CardContent>
            </Card>

            {/* FAQ Item 4 */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Can I export analytics reports?</h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely! You can export both individual QR analytics and overall 
                  performance reports. These executive summaries include all key metrics 
                  and can be downloaded as HTML files for presentations or record keeping.
                </p>
              </CardContent>
            </Card>

            {/* FAQ Item 5 */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Is my data secure?</h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, we take security seriously. All data is encrypted in transit and at rest, 
                  passwords are securely hashed, and we follow industry best practices for data 
                  protection. See our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details.
                </p>
              </CardContent>
            </Card>

            {/* FAQ Item 6 */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">What file formats can I download?</h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  QR codes can be downloaded as high-quality PNG images. Analytics reports 
                  are available as HTML files that can be viewed in any browser or converted 
                  to PDF if needed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Support</h2>
            <p className="text-muted-foreground">
              Can't find what you're looking for? Send us a message and we'll help you out.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a topic</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="account">Account Help</option>
                    <option value="analytics">Analytics Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your question or issue in detail..."
                    required
                    disabled={loading}
                    rows={6}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Support Request"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Alternative Contact Methods */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Other Ways to Reach Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">📧</span>
                </div>
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">
                    <a href="mailto:support@axioqr.com" className="text-primary hover:underline">
                      support@axioqr.com
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">⏱️</span>
                </div>
                <div>
                  <p className="font-medium">Response Time</p>
                  <p className="text-sm text-muted-foreground">
                    We typically respond within 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-8">Additional Resources</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-xl">📖</span>
              </div>
              <h3 className="font-semibold mb-2">Documentation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive guides and tutorials
              </p>
              <Button variant="outline" size="sm">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-xl">🔒</span>
              </div>
              <h3 className="font-semibold mb-2">Privacy Policy</h3>
              <p className="text-sm text-muted-foreground mb-4">
                How we protect your data
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/privacy">Read Policy</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-xl">📋</span>
              </div>
              <h3 className="font-semibold mb-2">Terms of Service</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Platform usage terms
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/terms">Read Terms</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Back to Home */}
      <div className="text-center mt-12">
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}