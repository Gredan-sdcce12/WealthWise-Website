import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Camera, FileText, Zap, CheckCircle2, ArrowLeft, Lightbulb, Sun, Focus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const tips = [
  {
    title: "Good Lighting is Key",
    description: "Take photos in well-lit areas. Natural daylight works best for clear, readable receipts.",
    icon: Sun
  },
  {
    title: "Keep it Flat",
    description: "Place receipts on a flat surface. Wrinkled or folded receipts reduce OCR accuracy.",
    icon: FileText
  },
  {
    title: "Capture the Full Receipt",
    description: "Ensure the entire receipt is visible, including the date, total, and vendor name.",
    icon: Focus
  },
  {
    title: "Scan Immediately",
    description: "Thermal receipts fade quickly. Scan them the same day to preserve the information.",
    icon: Zap
  },
  {
    title: "Review Extracted Data",
    description: "Always verify the extracted information before saving. AI is good but not perfect.",
    icon: CheckCircle2
  },
  {
    title: "Organize by Category",
    description: "Add category tags when scanning to automatically categorize transactions.",
    icon: Lightbulb
  }
];

const supportedFormats = [
  { format: "Images", types: "JPG, PNG, HEIC", icon: "📷" },
  { format: "Documents", types: "PDF", icon: "📄" },
  { format: "Screenshots", types: "Any image format", icon: "📱" }
];

export default function OCRScanningTips() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl gradient-emerald flex items-center justify-center mx-auto mb-6">
              <Camera className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-4">OCR Bill Scanning</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload receipts and let AI extract transaction details automatically—no more manual data entry.
            </p>
          </div>

          <Card variant="emerald" className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">How It Works</h2>
              <p className="text-muted-foreground">
                Our OCR (Optical Character Recognition) technology uses AI to read your receipts, 
                extracting the vendor name, date, amount, and even individual line items. 
                What used to take minutes now takes seconds.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6">Scanning Tips</h2>
          <div className="grid gap-4 md:grid-cols-2 mb-12">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <Card key={index} variant="elevated">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card variant="elevated" className="mb-12">
            <CardHeader>
              <CardTitle>Supported Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {supportedFormats.map((item, index) => (
                  <div key={index} className="text-center p-4 rounded-lg border">
                    <span className="text-3xl mb-2 block">{item.icon}</span>
                    <h4 className="font-medium">{item.format}</h4>
                    <p className="text-sm text-muted-foreground">{item.types}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="outline" className="mb-12">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Pro Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Avoid shadows and glare on the receipt
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Hold camera steady or use a flat surface
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Make sure text is in focus before capturing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Clean your camera lens for clearer images
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/dashboard">
              <Button variant="hero" size="lg">
                Try Scanning a Receipt
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
