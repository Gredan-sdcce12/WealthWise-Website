# Export Features Explained - WealthWise Reports

## Overview

The Reports module has **two export features**: CSV export and PDF export. Both allow users to download their financial data for analysis and sharing.

---

## 1️⃣ CSV Export (Excel-compatible)

### What It Does

Exports your financial data to a `.csv` file that can be opened in **Excel, Google Sheets, or any spreadsheet application**.

### How It Works

**Backend (`/export/csv` endpoint):**

```python
# Returns CSV-formatted data with 3 options:

1. TRANSACTIONS
   Columns: Date | Category | Amount | Type | Description | Payment Mode
   Example:
   2026-02-01,Food,500.00,expense,Lunch at restaurant,upi
   2026-02-02,Transport,50.00,expense,Uber,card

2. BUDGETS
   Columns: Category | Budget Type | Amount | Start Date | Alert Threshold %
   Example:
   Food,Monthly,5000.00,2026-01-01,80
   Transport,Monthly,3000.00,2026-01-01,75

3. GOALS
   Columns: Goal Name | Category | Target Amount | Current Amount | Progress % | Deadline
   Example:
   Emergency Fund,Savings,50000.00,25000.00,50.00%,2026-12-31
   Buy Laptop,Electronics,100000.00,75000.00,75.00%,2026-06-30
```

**Frontend (React):**

```javascript
const exportToCSV = async (type) => {
  // 1. Call backend to get CSV data
  const data = await api.exportToCSV(selectedYear, selectedMonth, type);

  // 2. Create a Blob (binary file object)
  const blob = new Blob([data.csv], { type: "text/csv" });

  // 3. Create download link
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `wealthwise-${type}-2026-02-04.csv`;

  // 4. Trigger browser download
  link.click();
};
```

### File Generated

- **Name**: `wealthwise-transactions-2026-02-04.csv`
- **Size**: Small (typically < 1MB)
- **Can Open In**: Excel, Google Sheets, Numbers, any spreadsheet app
- **Use Case**: Data analysis, importing to accounting software, sharing with accountant

---

## 2️⃣ PDF Export (Printable Report)

### What It Does

Exports a **beautiful, formatted PDF report** with all your financial data, charts, and summaries. Perfect for printing or sending to others.

### How It Works

**Backend (`/export/summary-data` endpoint):**

```python
# Returns structured data needed for PDF:
{
  "summary": {
    "total_income": 50000.00,
    "total_expense": 12369.55,
    "net_savings": 37630.45
  },
  "categories": [
    {"name": "Food", "amount": 5000.00},
    {"name": "Transport", "amount": 2000.00}
  ],
  "transactions": [
    {
      "date": "2026-02-04",
      "category": "Food",
      "amount": 500.00,
      "type": "expense",
      "description": "Restaurant"
    }
  ],
  "budgets": [
    {"category": "Food", "amount": 5000.00}
  ],
  "report_date": "2026-02-04",
  "report_period": "February 2026"
}
```

**Frontend (React):**

```javascript
const exportToPDF = async () => {
  // 1. Get summary data from backend
  const summaryData = await api.getExportSummaryData(
    selectedYear,
    selectedMonth,
  );

  // 2. Generate HTML content with styling
  const html = generatePDFContent(summaryData);

  // 3. Use html2canvas to convert HTML → image
  const canvas = await html2canvas(htmlElement);

  // 4. Use jsPDF to create PDF from image
  const pdf = new jsPDF("p", "mm", "a4");
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297);

  // 5. Download PDF
  pdf.save("wealthwise-report-2026-02-04.pdf");
};
```

### PDF Content (What's Included)

```
┌─────────────────────────────────────┐
│    WEALTHWISE FINANCIAL REPORT      │
│    February 2026                    │
│    Generated: 2026-02-04            │
├─────────────────────────────────────┤
│  SUMMARY METRICS                    │
│  ├─ Total Income: $50,000           │
│  ├─ Total Expense: $12,369.55       │
│  └─ Net Savings: $37,630.45         │
├─────────────────────────────────────┤
│  TOP SPENDING CATEGORIES            │
│  ├─ Food: $5,000 (40%)              │
│  ├─ Transport: $2,000 (16%)         │
│  └─ [Pie Chart Visualization]       │
├─────────────────────────────────────┤
│  RECENT TRANSACTIONS (20 items)     │
│  Date  | Category | Amount | Mode   │
│  Feb4  | Food     | $500   | UPI    │
│  ...                                │
├─────────────────────────────────────┤
│  BUDGET OVERVIEW                    │
│  Category  | Budget  | Status       │
│  Food      | $5,000  | On Track     │
│  Transport | $3,000  | Exceeded     │
└─────────────────────────────────────┘
```

### File Generated

- **Name**: `wealthwise-report-2026-02-04.pdf`
- **Size**: Medium (typically 1-5MB)
- **Format**: Professional, printable
- **Use Case**: Share with spouse/partner, present to financial advisor, print for records

---

## 🔄 Data Flow Diagram

### CSV Export Flow

```
User clicks "Export CSV"
        ↓
Frontend calls api.exportToCSV()
        ↓
Backend Query Database → Build CSV string → Return CSV text
        ↓
Frontend creates Blob from CSV text
        ↓
Trigger browser download → File saved
```

### PDF Export Flow

```
User clicks "Export PDF"
        ↓
Frontend calls api.getExportSummaryData()
        ↓
Backend Query Database → Return structured data
        ↓
Frontend generates HTML from data
        ↓
html2canvas converts HTML → PNG image
        ↓
jsPDF wraps PNG in PDF format
        ↓
Trigger browser download → File saved
```

---

## 📊 Key Differences

| Aspect          | CSV               | PDF                 |
| --------------- | ----------------- | ------------------- |
| **File Size**   | Small (~50KB)     | Medium (~2MB)       |
| **Open With**   | Excel, Sheets     | PDF Reader, Browser |
| **Printable**   | With formatting   | Professional        |
| **Data Detail** | Raw data only     | Summary + details   |
| **Visual**      | Text only         | Charts included     |
| **Use Case**    | Analysis          | Sharing/Reports     |
| **Editable**    | Yes (spreadsheet) | No (read-only)      |

---

## 🎯 When to Use Each

### Use CSV When:

✅ You want to analyze data in Excel/Sheets  
✅ You need to import to accounting software  
✅ You want raw, editable data  
✅ You're sharing with a technical person  
✅ You need maximum flexibility

### Use PDF When:

✅ You want a professional report  
✅ You're sharing with non-technical users  
✅ You want to print the report  
✅ You need a read-only, tamper-proof format  
✅ You want visual charts included

---

## 🛠️ Technology Stack

### CSV Export

- **Backend**: Python `csv` module
- **Frontend**: Browser `Blob` API + `URL.createObjectURL()`
- **Libraries**: Native (no extra packages needed)

### PDF Export

- **Frontend**: `html2canvas` + `jsPDF`
- **Process**:
  1. `html2canvas` renders HTML to canvas/image
  2. `jsPDF` wraps image in PDF container
  3. Handles multi-page PDFs automatically

---

## ⚙️ Configuration

### Filter Options

Both exports respect these filters:

- **Month**: Select specific month
- **Year**: Select specific year
- **Leave blank**: Export all-time data

### CSV Report Types

- Transactions
- Budgets
- Goals

### PDF Report

- Always includes summary + all data for selected period

---

## 📝 Example Downloads

### CSV Example

```
Date,Category,Amount,Type,Description,Payment Mode
2026-02-04,Food,500.00,expense,Restaurant lunch,upi
2026-02-04,Transport,50.00,expense,Uber ride,card
2026-02-03,Salary,50000.00,income,Monthly salary,transfer
```

### PDF Content

Professional formatted report with:

- Company header
- Report period
- Key metrics cards
- Charts and visualizations
- Transaction tables
- Budget summary

---

## ✅ Success Indicators

**CSV Export Works When:**

- File downloads successfully
- Filename includes current date
- Data opens correctly in Excel/Sheets
- All transactions/budgets/goals visible

**PDF Export Works When:**

- PDF downloads successfully
- File is readable in PDF viewer
- All text and data visible
- Charts/visualizations display correctly
- Multiple pages work for large datasets

---

## 🐛 Troubleshooting

### CSV Export Fails

→ Check network connection  
→ Ensure valid date range  
→ Check browser download settings

### PDF Export Fails

→ Verify `jspdf` and `html2canvas` installed (`npm list jspdf html2canvas`)  
→ Check browser console for errors  
→ Try exporting smaller date ranges first  
→ Ensure adequate disk space

---

## 📱 Summary

Both exports serve different purposes:

- **CSV** = Raw data for analysis
- **PDF** = Beautiful report for sharing

They work together to give you complete flexibility in how you use and share your financial data! 💰
