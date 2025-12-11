import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function ScanReceiptDialog({ trigger }) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanning(true);
      // Simulate OCR processing
      setTimeout(() => {
        setScannedData({
          vendor: "Sample Store",
          amount: "45.99",
          date: new Date().toISOString().split('T')[0],
          category: "groceries"
        });
        setScanning(false);
      }, 2000);
    }
  };

  const handleSave = () => {
    if (scannedData) {
      toast({ title: "Receipt Saved", description: `$${scannedData.amount} from ${scannedData.vendor} added as transaction` });
      setOpen(false);
      setScannedData(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="hero"><Camera className="w-4 h-4 mr-2" />Scan Receipt</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scan Receipt (OCR)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input type="file" ref={fileInputRef} accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
          
          {!scannedData && !scanning && (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Upload a receipt image or PDF</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />Upload File
                </Button>
                <Button variant="hero" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="w-4 h-4 mr-2" />Take Photo
                </Button>
              </div>
            </div>
          )}

          {scanning && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto text-emerald-500 animate-spin mb-4" />
              <p className="text-muted-foreground">Processing receipt...</p>
            </div>
          )}

          {scannedData && !scanning && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <p className="text-sm text-emerald-600 font-medium mb-2">Extracted Data:</p>
              </div>
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Input variant="emerald" value={scannedData.vendor} onChange={(e) => setScannedData({...scannedData, vendor: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input variant="emerald" value={scannedData.amount} onChange={(e) => setScannedData({...scannedData, amount: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input variant="emerald" type="date" value={scannedData.date} onChange={(e) => setScannedData({...scannedData, date: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setScannedData(null)} className="flex-1">Rescan</Button>
                <Button variant="hero" onClick={handleSave} className="flex-1">Save Transaction</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}