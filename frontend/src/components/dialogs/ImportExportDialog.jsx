import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, FileSpreadsheet, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function ImportExportDialog({ trigger, mode = "both" }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(mode === "export" ? "export" : "import");
  const [exportType, setExportType] = useState("all");
  const [importFile, setImportFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const csvContent = "Date,Title,Amount,Category,Type\n2024-01-15,Groceries,-85.50,Food,expense\n2024-01-14,Salary,5000.00,Income,income";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wealthwise_${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export Complete", description: `${exportType} data exported successfully` });
    setOpen(false);
  };

  const handleImport = () => {
    if (importFile) {
      toast({ title: "Import Complete", description: `${importFile.name} imported successfully` });
      setOpen(false);
      setImportFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline"><FileSpreadsheet className="w-4 h-4 mr-2" />Import/Export</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Data Import & Export</DialogTitle>
        </DialogHeader>
        
        {mode === "both" && (
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === "import" ? "hero" : "outline"}
              onClick={() => setActiveTab("import")}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />Import
            </Button>
            <Button
              variant={activeTab === "export" ? "hero" : "outline"}
              onClick={() => setActiveTab("export")}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />Export
            </Button>
          </div>
        )}

        {(activeTab === "import" || mode === "import") && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              {importFile ? (
                <div className="flex items-center justify-center gap-2 text-emerald-600">
                  <Check className="w-6 h-6" />
                  <span className="font-medium">{importFile.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Click to upload CSV file</p>
                  <p className="text-xs text-muted-foreground mt-1">Supported format: .csv</p>
                </>
              )}
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">CSV Format Requirements:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• First row should contain headers</li>
                <li>• Required columns: Date, Title, Amount</li>
                <li>• Optional columns: Category, Type, Notes</li>
              </ul>
            </div>
            <Button variant="hero" onClick={handleImport} disabled={!importFile} className="w-full">
              <Upload className="w-4 h-4 mr-2" />Import Data
            </Button>
          </div>
        )}

        {(activeTab === "export" || mode === "export") && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Export Data Type</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expenses">Expenses Only</SelectItem>
                  <SelectItem value="budgets">Budgets</SelectItem>
                  <SelectItem value="goals">Goals</SelectItem>
                  <SelectItem value="accounts">Accounts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Your data will be exported as a CSV file that can be opened in Excel, Google Sheets, or any spreadsheet application.
              </p>
            </div>
            <Button variant="hero" onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />Export to CSV
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}