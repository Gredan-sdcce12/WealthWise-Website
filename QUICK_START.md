# ⚡ Quick Start Guide - Tesseract OCR

## 🚀 Get Started in 5 Minutes

### Step 1: Install Tesseract (One-time setup)

Download & install from: https://github.com/UB-Mannheim/tesseract/wiki

### Step 2: Install Dependencies

```powershell
cd c:\Users\greda\Downloads\WealthWise-Website\backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Step 3: Start Backend

```powershell
# In backend folder
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Step 4: Start Frontend (New Terminal)

```powershell
cd c:\Users\greda\Downloads\WealthWise-Website\frontend
npm run dev
```

### Step 5: Test in Browser

1. Open: http://localhost:5173
2. Go to: Dashboard → Transactions
3. Click: "Add Expense"
4. Try:
   - Manual Entry → Fill form → Save
   - Scan Receipt → Upload image → Review → Save

---

## 📋 Two Ways to Add Expenses

### Manual Entry

```
Add Expense → Manual Entry tab
↓
Fill form (Title, Amount, Category, Date)
↓
Click "Add Expense"
```

### Scan Receipt

```
Add Expense → Scan Receipt tab
↓
Click "Upload Receipt"
↓
Choose image from device
↓
Wait for OCR (2-5 seconds)
↓
Review/edit extracted data
↓
Click "Use This Data"
↓
Click "Add Expense"
```

---

## ✅ What Works

- ✅ Upload receipt images (JPG, PNG)
- ✅ Extract vendor name
- ✅ Extract amount
- ✅ Extract date
- ✅ Auto-detect category
- ✅ Edit extracted data
- ✅ Save to database
- ✅ Manual entry (traditional form)

---

## 🆘 Common Issues

**"Tesseract not found"**

- Install from: https://github.com/UB-Mannheim/tesseract/wiki

**"pytesseract not found"**

- Run: `pip install pytesseract`

**"Backend not connecting"**

- Verify backend running on http://127.0.0.1:8000

**"No text extracted"**

- Use clear, well-lit receipt images
- Ensure entire receipt is visible

---

## 📖 Full Guides

- **Setup Guide:** `OCR_SETUP_GUIDE.md`
- **Implementation:** `OCR_IMPLEMENTATION_SUMMARY.md`

---

**Ready? Let's go!** 🚀
