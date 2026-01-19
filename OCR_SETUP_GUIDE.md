# 🧾 Tesseract OCR Setup & Implementation Guide

## 📋 Overview

The OCR receipt scanning feature has been fully implemented in the WealthWise application. Users can now add expenses in two ways:

1. **Manual Entry** - Fill in the form manually
2. **Scan Receipt** - Upload a receipt image for OCR text extraction

---

## ⚙️ STEP 1: Install Tesseract (Windows)

Tesseract is the OCR engine that extracts text from receipt images.

### Download & Install:

1. Visit: https://github.com/UB-Mannheim/tesseract/wiki
2. Download the latest Windows installer (e.g., `tesseract-ocr-w64-setup-v5.x.x.exe`)
3. Run the installer
4. **Important**: During installation, note the installation path (default: `C:\Program Files\Tesseract-OCR`)
5. Complete the installation

### Verify Installation:

```powershell
# Run this in PowerShell to verify Tesseract is installed
& 'C:\Program Files\Tesseract-OCR\tesseract.exe' --version
```

If you see version info, installation is successful! ✅

---

## ⚙️ STEP 2: Install Python Dependencies

The backend needs `pytesseract` and `Pillow` for OCR functionality.

### Install packages:

```powershell
# Navigate to backend folder
cd c:\Users\greda\Downloads\WealthWise-Website\backend

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies from requirements.txt
pip install -r requirements.txt
```

**Packages installed:**

- `pytesseract` - Python wrapper for Tesseract
- `Pillow` - Image processing library
- Other existing dependencies

Verify installation:

```powershell
pip list | findstr tesseract
pip list | findstr Pillow
```

---

## 🚀 STEP 3: Start the Backend Server

```powershell
# Navigate to backend
cd c:\Users\greda\Downloads\WealthWise-Website\backend

# Activate environment (if not already)
.\.venv\Scripts\Activate.ps1

# Start the server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Expected output:**

```
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete
INFO:     Uvicorn running on http://127.0.0.1:8000
```

✅ Backend is ready! Keep this terminal open.

---

## 🚀 STEP 4: Start the Frontend Server

Open a **NEW terminal** and run:

```powershell
# Navigate to frontend
cd c:\Users\greda\Downloads\WealthWise-Website\frontend

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

**Expected output:**

```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ Frontend is ready! Open http://localhost:5173 in your browser.

---

## 🧪 STEP 5: Test the OCR Feature

### Access the Application:

1. Open browser: `http://localhost:5173`
2. Log in to your account
3. Navigate to **Dashboard** → **Transactions**

### Test Manual Entry:

1. Click **"Add Expense"** button
2. Select **"Manual Entry"** tab
3. Fill in the form with sample data
4. Click **"Add Expense"**
5. Verify the transaction appears in the list ✅

### Test OCR Scanning:

1. Click **"Add Expense"** button
2. Select **"Scan Receipt"** tab
3. Click **"Upload Receipt"** button
4. Select a receipt image from your computer
5. Wait for OCR processing (may take a few seconds)
6. Review the extracted data:
   - Vendor name
   - Amount
   - Date
   - Category (auto-guessed)
7. Edit any fields if needed
8. Click **"Use This Data"** to populate the manual form
9. Click **"Add Expense"** to save

✅ Transaction should appear in the list!

---

## 📁 What Was Changed

### Backend (`backend/`)

- **`requirements.txt`** - Added `pytesseract` and `Pillow`
- **`transactions.py`** - Added:
  - `_extract_receipt_data()` - Extracts vendor, amount, date, category
  - `_guess_category()` - Identifies spending category from receipt text
  - `/transactions/scan-receipt` endpoint - Handles image upload and OCR processing

### Frontend (`frontend/src/`)

- **`components/dialogs/AddExpenseDialog.jsx`** - Updated with:

  - Two tabs: "Manual Entry" and "Scan Receipt"
  - Integration with ScanReceiptDialog
  - Form submission to backend API

- **`components/dialogs/ScanReceiptDialog.jsx`** - Updated with:

  - Real API calls to backend OCR endpoint
  - File upload handling
  - Data extraction display
  - Manual edit capability for extracted data

- **`lib/api.js`** - Added:
  - `scanReceipt()` method to call backend endpoint

### Sidebar

- **Removed** "Upload Bill" menu item (OCR now integrated in Transactions)

---

## 🔧 Troubleshooting

### ❌ Error: "Tesseract is not installed"

**Solution:**

```powershell
# Check if Tesseract is in PATH
$env:PATH -split ";" | findstr -i tesseract

# If not found, add it manually in your environment:
$env:PYTESSERACT_PATH = "C:\Program Files\Tesseract-OCR\tesseract.exe"
```

### ❌ Error: "No text extracted from image"

**Causes:**

- Image is too small or blurry
- Receipt is folded or creased
- Poor lighting

**Solution:**

- Use clear, well-lit images
- Ensure entire receipt is visible
- Try a different angle

### ❌ Error: "Cannot connect to backend"

**Solution:**

```powershell
# Verify backend is running on port 8000
netstat -ano | findstr :8000

# Restart backend server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### ❌ Error: "Module pytesseract not found"

**Solution:**

```powershell
# Reinstall dependencies
cd c:\Users\greda\Downloads\WealthWise-Website\backend
.\.venv\Scripts\Activate.ps1
pip install pytesseract Pillow --upgrade
```

---

## 📊 How It Works

### User Flow:

```
1. User clicks "Add Expense"
   ↓
2. User chooses "Scan Receipt" tab
   ↓
3. User uploads receipt image
   ↓
4. Frontend sends image to backend
   ↓
5. Backend (Tesseract) extracts text
   ↓
6. Backend parses text (regex patterns)
   ↓
7. Backend returns structured data:
   - Vendor name
   - Amount ($)
   - Date
   - Category guess
   ↓
8. Frontend displays extracted data
   ↓
9. User reviews/edits if needed
   ↓
10. User confirms data
    ↓
11. Form fields auto-populate   ↓
12. User submits form
    ↓
13. Transaction saved to database ✅
```

### OCR Text Parsing Logic:

- **Amount**: Looks for "total", "amount", "paid" + currency ($, ₹, Rs.)
- **Date**: Extracts DD/MM/YYYY or MM/DD/YYYY patterns
- **Vendor**: Uses first meaningful line from receipt
- **Category**: Matches keywords (grocery, restaurant, fuel, etc.)

---

## ✅ Checklist

- [ ] Tesseract installed on system
- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5173
- [ ] Login to WealthWise app
- [ ] Tested manual expense entry
- [ ] Tested receipt scanning with a real or sample receipt
- [ ] Verified transaction appears in list

---

## 💡 Tips for Best OCR Results

1. **Good lighting** - Use natural daylight or bright lighting
2. **Clear image** - Avoid blurry photos
3. **Straight angle** - Take photo directly above receipt, not at an angle
4. **Complete receipt** - Ensure date, vendor, and total are visible
5. **Dark text** - Receipts with clear, dark text extract better
6. **Not folded** - Flatten the receipt before scanning

---

## 🎯 Next Steps

After testing the OCR feature:

1. **Review extracted data accuracy** - Note any improvements needed
2. **Test with various receipts** - Different stores, formats
3. **Commit changes** to git:
   ```powershell
   git add .
   git commit -m "Implement Tesseract OCR for receipt scanning"
   ```

---

## 📞 Support

If you face any issues:

1. Check the browser console (F12) for frontend errors
2. Check backend terminal for server errors
3. Verify Tesseract installation
4. Ensure all dependencies are installed
5. Restart both backend and frontend servers

---

**Created:** January 17, 2026
**Feature:** Tesseract OCR Receipt Scanning
**Status:** Ready for Testing ✅
