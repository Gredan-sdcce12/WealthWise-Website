import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Image as ImageIcon, FileText, CheckCircle2 } from "lucide-react";

export default function UploadBill() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const dummyExtraction = {
    merchant: "FreshMart Superstore",
    billDate: "2024-12-12",
    amount: 189.75,
    category: "Groceries",
    description: "Weekly grocery run with household items",
  };

  const handleFileChange = (event) => {
    const uploaded = event.target.files?.[0];
    if (!uploaded) return;

    if (!uploaded.type.startsWith("image/")) {
      setError("Please upload an image file (JPG or PNG)");
      setFile(null);
      setPreview(null);
      setExtractedData(null);
      return;
    }

    setError("");
    setFile(uploaded);
    setExtractedData(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(uploaded);
  };

  const handleUpload = () => {
    if (!file) {
      setError("Please select a bill or receipt image first");
      return;
    }
    // Simulate OCR by setting dummy data
    setExtractedData(dummyExtraction);
  };

  const handleAddToTransactions = () => {
    if (!extractedData) return;
    console.log("Add to Transactions:", extractedData);
    // Future: integrate with transactions state/backend
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Upload Bill / Receipt</h1>
        <p className="text-muted-foreground mt-1">
          Upload an image and preview the extracted details before adding to transactions.
        </p>
      </div>

      {/* Upload Card */}
      <Card variant="elevated">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bill-upload">Bill Image (JPG or PNG)</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                id="bill-upload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud className="w-4 h-4 mr-2" /> Choose File
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            {/* Preview */}
            <div className="flex-1">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Preview
              </p>
              <div className="border border-dashed rounded-lg min-h-[200px] flex items-center justify-center bg-muted/30">
                {preview ? (
                  <img src={preview} alt="Bill preview" className="max-h-64 object-contain rounded-md" />
                ) : (
                  <p className="text-sm text-muted-foreground">No image selected</p>
                )}
              </div>
            </div>

            {/* Extracted Data */}
            <div className="flex-1">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Extracted Details (simulated)
              </p>
              <div className="border rounded-lg p-4 bg-muted/30 min-h-[200px]">
                {extractedData ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Merchant:</span> {extractedData.merchant}
                    </div>
                    <div>
                      <span className="font-semibold">Bill Date:</span> {extractedData.billDate}
                    </div>
                    <div>
                      <span className="font-semibold">Total Amount:</span> ₹{extractedData.amount.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-semibold">Category:</span> {extractedData.category}
                    </div>
                    <div>
                      <span className="font-semibold">Description:</span> {extractedData.description}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Upload an image and click "Extract Details" to see simulated OCR output.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleUpload}>
              <UploadCloud className="w-4 h-4 mr-2" /> Extract Details
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!extractedData}
              onClick={handleAddToTransactions}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Add to Transactions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
