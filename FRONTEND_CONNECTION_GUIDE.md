# Budget Module - Frontend Connection Guide

## 🎯 What We've Connected

### 1. **API Client** ([lib/api.js](../frontend/src/lib/api.js))

Added budget endpoints:

- `createBudget()` - Create new budget
- `getBudgets()` - List budgets with filters
- `getBudget()` - Get single budget
- `updateBudget()` - Update budget
- `deleteBudget()` - Delete budget
- `getCategories()` - Get all categories (predefined + custom from budgets)

### 2. **Budget Page** ([pages/dashboard/Budgets.jsx](../frontend/src/pages/dashboard/Budgets.jsx))

- ✅ Fetches budgets from API on mount and month change
- ✅ Fetches dynamic categories including custom ones
- ✅ Creates budgets via API
- ✅ Updates budgets via API
- ✅ Deletes budgets via API
- ✅ Loading and error states
- ✅ Real-time spent calculation from backend

### 3. **Transaction Dialogs**

Updated to fetch dynamic categories:

- **[AddExpenseDialog.jsx](../frontend/src/components/dialogs/AddExpenseDialog.jsx)**
- **[AddTransactionDialog.jsx](../frontend/src/components/dialogs/AddTransactionDialog.jsx)**

When users open these dialogs, they automatically fetch the latest categories including any custom ones created in budgets!

---

## 🚀 Testing the Complete Flow

### Prerequisites

1. ✅ Backend server running on `http://127.0.0.1:8000`
2. ✅ Budgets table created in Supabase
3. ✅ Frontend dev server running

### Start Backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python main.py
```

### Start Frontend

```powershell
cd frontend
npm run dev
# or
bun dev
```

---

## 📝 Test Scenario: Complete Budget-Transaction Link

### **Step 1: Create a Custom Budget Category**

1. Navigate to Budget page in your app
2. Fill the "Add Budget" form:

   - **Time period:** Monthly
   - **Category:** Others
   - **Describe this category:** Gym
   - **Budget amount:** 5000
   - **Start Date:** 2026-01 (current month)
   - **Alert Threshold:** 80%

3. Click "Save budget"
4. ✅ You should see: "Budget saved" toast

### **Step 2: Verify Custom Category Appears**

1. Open the transaction expense dialog (from Transactions page or any add expense button)
2. Click the **Category** dropdown
3. ✅ You should now see "Gym" in the list with 📦 icon

### **Step 3: Create a Transaction with Custom Category**

1. In the expense dialog:

   - **Title:** Monthly gym membership
   - **Amount:** 1500
   - **Category:** Gym ← Select this
   - **Date:** 2026-01-07

2. Submit the transaction
3. Navigate back to Budgets page

### **Step 4: Verify Spent Calculation**

1. On Budgets page, find the "Gym" budget
2. ✅ You should see:
   - **Budget:** ₹5,000
   - **Spent:** ₹1,500
   - **Remaining:** ₹3,500
   - **Progress bar:** 30% filled (green)

---

## 🧪 API Testing via Browser DevTools

### Test 1: Fetch Budgets

```javascript
// Open browser console on Budget page
const response = await fetch(
  "http://127.0.0.1:8000/budgets/?user_id=user123&month=1&year=2026"
);
const data = await response.json();
console.log("Budgets:", data);
```

Expected: Array of budgets with `spent` field calculated

### Test 2: Get Categories

```javascript
const response = await fetch(
  "http://127.0.0.1:8000/budgets/categories?user_id=user123"
);
const data = await response.json();
console.log("Categories:", data);
```

Expected:

```json
{
  "predefined": [...],
  "custom": [
    {"value": "gym", "label": "Gym", "icon": "📦"}
  ],
  "all": [...]
}
```

### Test 3: Create Budget

```javascript
const response = await fetch("http://127.0.0.1:8000/budgets/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: "user123",
    category: "others",
    budget_type: "Monthly",
    amount: 3000,
    start_date: "2026-01-01",
    alert_threshold: 80,
    custom_category_name: "Pet Care",
  }),
});
const data = await response.json();
console.log("Created budget:", data);
```

---

## 🔍 Debugging Tips

### Frontend Not Loading Budgets?

**Check Console:**

```javascript
// Look for errors like:
Failed to fetch budgets: [error message]
```

**Common Causes:**

1. Backend not running → Start backend server
2. CORS error → Check `main.py` CORS origins include frontend URL
3. Network error → Verify API_BASE_URL in `.env` or defaults to `http://127.0.0.1:8000`

**Check Network Tab:**

- Open DevTools → Network tab
- Filter by "budgets"
- Check if requests are being made
- Look at response status (should be 200)

### Categories Not Showing in Dropdowns?

**Check API Response:**

```javascript
// In browser console
const resp = await fetch(
  "http://127.0.0.1:8000/budgets/categories?user_id=user123"
);
const data = await resp.json();
console.log(data.all);
```

**Verify:**

- Response has `all` array
- Custom categories appear when you have "others" budgets
- Dialog opens before checking (useEffect runs on `open` state)

### Spent Amount Not Updating?

**Verify Transaction Categories Match:**

1. Budget category = `others` with `custom_category_name` = `Gym`
2. Transaction category = `Gym` (exact match)

**Check Backend Calculation:**

```bash
# Check if transactions exist for the category
curl "http://127.0.0.1:8000/transactions/?user_id=user123&category=Gym"
```

### Loading State Stuck?

**Check for Errors:**

- Open console: Any red error messages?
- Check Network tab: Is request pending forever?
- Verify backend is responding: `http://127.0.0.1:8000/health/db`

---

## 🌐 Frontend Environment Variables

Create/update `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If backend runs on different port, update this value.

---

## 📊 Expected User Flow

```
User Journey:
┌─────────────────────────────────┐
│ 1. Create Budget with "Others" │
│    Custom Name: "Gym"           │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 2. Backend stores budget        │
│    category: "others"           │
│    custom_category_name: "Gym"  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 3. Transaction dialog opens     │
│    Fetches GET /budgets/        │
│    categories?user_id=user123   │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 4. Dropdown shows:              │
│    - Food 🍽️                    │
│    - Transport 🚗               │
│    - ...                        │
│    - Gym 📦 (Custom!)           │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 5. User selects "Gym"           │
│    Creates transaction with     │
│    category: "Gym"              │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 6. Budget page refreshes        │
│    Backend calculates spent     │
│    from matching transactions   │
│    Shows: 1500/5000 (30%)      │
└─────────────────────────────────┘
```

---

## ✅ Success Criteria

### Budget Page:

- [ ] No hardcoded budgets on initial load (unless you have data)
- [ ] Loading skeleton appears while fetching
- [ ] Budgets display with correct spent amounts
- [ ] Custom categories show with their custom names
- [ ] Create/Update/Delete operations work
- [ ] Error messages appear if API fails

### Transaction Dialogs:

- [ ] Categories dropdown loads dynamically
- [ ] Custom categories appear with 📦 icon
- [ ] Fallback to hardcoded categories if API fails
- [ ] No console errors when opening dialogs

### Backend:

- [ ] `/budgets/categories` returns custom categories
- [ ] Budget `spent` calculation matches transactions
- [ ] Monthly budgets filter by month/year correctly
- [ ] Weekly budgets filter by 7-day range correctly

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to fetch"

**Solution:**

1. Check backend is running: `http://127.0.0.1:8000/`
2. Check CORS: Add frontend URL to `main.py` origins
3. Verify `.env` has correct `VITE_API_BASE_URL`

### Issue: Categories empty in dropdown

**Solution:**

1. Open dialog (useEffect triggers on open)
2. Check Network tab for `/budgets/categories` call
3. Verify backend returns `{ all: [...] }`
4. Create at least one "others" budget first

### Issue: Spent always 0

**Solution:**

1. Verify transaction `category` exactly matches budget custom name
2. Check transaction date is within budget period
3. Verify transaction `txn_type` = `expense`
4. Check backend logs for calculation errors

### Issue: Budget not created

**Solution:**

1. Check console for validation errors
2. Verify all required fields filled
3. Check "others" category has description
4. Look for duplicate budget error (409 status)

---

## 📞 Support

If you encounter issues:

1. **Check Browser Console** - Most errors appear here
2. **Check Network Tab** - See actual API requests/responses
3. **Check Backend Logs** - Terminal running `python main.py`
4. **Verify Database** - Check Supabase table editor for data
5. **Test APIs directly** - Use `http://127.0.0.1:8000/docs`

---

## 🎉 You're All Set!

Your budget module is now fully connected:

- Frontend ↔️ Backend ✅
- Budgets ↔️ Transactions ✅
- Dynamic Categories ✅
- Real-time Spent Tracking ✅

Start creating budgets and watch the magic happen! 🚀
