# WealthWise Budget Backend - Setup & Execution Guide

## 📋 Overview

The budget module creates a dynamic link between budgets and transactions:

- When users create a budget with category "Others" + custom name (e.g., "Gym")
- That custom category becomes available in the transaction expense dropdown
- Spent amounts are automatically calculated from matching transactions

---

## 🗃️ Step 1: Create Database Table in Supabase

1. **Log into Supabase Dashboard**

   - Go to your WealthWise project
   - Navigate to **SQL Editor** (left sidebar)

2. **Run the Setup SQL**

   - Copy the entire content from `backend/SETUP_BUDGETS.sql`
   - Paste into SQL Editor
   - Click **Run** button
   - You should see: "Success. No rows returned"

3. **Verify Table Creation**
   - Go to **Table Editor** (left sidebar)
   - You should see `budgets` table with columns:
     - id, user_id, category, budget_type, amount, start_date
     - alert_threshold, custom_category_name, created_at, updated_at

---

## 🔧 Step 2: Set Up Backend Environment

### A. Activate Virtual Environment (if not already active)

```powershell
# Navigate to backend folder
cd c:\Users\greda\Downloads\WealthWise-Website\backend

# Activate virtual environment
.\.venv\Scripts\Activate.ps1
```

If you see an error about execution policy:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### B. Verify Dependencies

Your `requirements.txt` should have:

```
fastapi
uvicorn
psycopg2-binary
python-dotenv
```

If packages aren't installed:

```powershell
pip install -r requirements.txt
```

### C. Check Environment Variables

Make sure your `.env` file has:

```env
DB_HOST=your-supabase-host.supabase.co
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password
DB_PORT=5432
```

---

## 🚀 Step 3: Start the Backend Server

```powershell
# From backend directory with activated venv
python main.py
```

Or using uvicorn directly:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

---

## 🧪 Step 4: Test Budget APIs

### Open API Documentation

Visit: `http://127.0.0.1:8000/docs`

### Test Endpoints:

#### 1. **Create a Budget with Custom Category**

**POST** `/budgets/`

```json
{
  "user_id": "user123",
  "category": "others",
  "budget_type": "Monthly",
  "amount": 5000,
  "start_date": "2026-01-01",
  "alert_threshold": 80,
  "custom_category_name": "Gym"
}
```

Response should include `"spent": 0` (initially)

#### 2. **Get All Categories (Including Custom)**

**GET** `/budgets/categories?user_id=user123`

Response:

```json
{
  "predefined": [
    {"value": "food", "label": "Food & Groceries", "icon": "🍽️"},
    ...
  ],
  "custom": [
    {"value": "gym", "label": "Gym", "icon": "📦"}
  ],
  "all": [...]
}
```

#### 3. **List All Budgets**

**GET** `/budgets/?user_id=user123`

Returns all budgets with calculated `spent` amounts

#### 4. **Update a Budget**

**PUT** `/budgets/1?user_id=user123`

```json
{
  "amount": 6000,
  "alert_threshold": 90
}
```

#### 5. **Delete a Budget**

**DELETE** `/budgets/1?user_id=user123`

---

## 🔗 Budget-Transaction Link Explanation

### How It Works:

1. **User creates budget:**

   ```
   Category: "others"
   Custom Name: "Gym"
   Amount: 5000
   Type: Monthly
   ```

2. **Frontend fetches categories:**

   ```
   GET /budgets/categories?user_id=user123
   ```

   Returns both predefined + custom categories

3. **Transaction form uses categories:**

   - Dropdown shows: Food, Transport, ... **Gym** (custom)
   - User selects "Gym" as category

4. **Transaction is created:**

   ```json
   {
     "user_id": "user123",
     "category": "Gym",
     "amount": 500,
     "txn_type": "expense"
   }
   ```

5. **Budget automatically tracks spending:**
   - GET `/budgets/?user_id=user123`
   - Returns: `"spent": 500` for Gym budget
   - Frontend shows: 500/5000 (10% used)

---

## 📊 Testing the Complete Flow

### 1. Create a Gym Budget

```bash
curl -X POST "http://127.0.0.1:8000/budgets/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "category": "others",
    "budget_type": "Monthly",
    "amount": 5000,
    "start_date": "2026-01-01",
    "alert_threshold": 80,
    "custom_category_name": "Gym"
  }'
```

### 2. Create a Gym Transaction

```bash
curl -X POST "http://127.0.0.1:8000/transactions/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "amount": 1500,
    "txn_type": "expense",
    "category": "Gym",
    "description": "Monthly gym membership",
    "payment_mode": "card",
    "txn_date": "2026-01-07"
  }'
```

### 3. Check Budget Spent

```bash
curl "http://127.0.0.1:8000/budgets/?user_id=user123"
```

Should show:

```json
{
  "id": 1,
  "category": "others",
  "custom_category_name": "Gym",
  "amount": 5000,
  "spent": 1500,
  ...
}
```

---

## 🎯 API Endpoints Summary

| Method | Endpoint              | Description                              |
| ------ | --------------------- | ---------------------------------------- |
| POST   | `/budgets/`           | Create new budget                        |
| GET    | `/budgets/`           | List all budgets with spent              |
| GET    | `/budgets/{id}`       | Get single budget                        |
| PUT    | `/budgets/{id}`       | Update budget                            |
| DELETE | `/budgets/{id}`       | Delete budget                            |
| GET    | `/budgets/categories` | Get all categories (predefined + custom) |

---

## ⚠️ Common Issues & Solutions

### Issue: Import Error

```
ModuleNotFoundError: No module named 'budgets'
```

**Solution:** Make sure you're in the backend directory and venv is activated

### Issue: Database Connection Failed

```
Missing database environment variables
```

**Solution:** Check your `.env` file has all DB\_\* variables

### Issue: Table doesn't exist

```
relation "budgets" does not exist
```

**Solution:** Run the `SETUP_BUDGETS.sql` in Supabase SQL Editor

### Issue: CORS Error in Frontend

**Solution:** Update `main.py` to include your frontend URL:

```python
allow_origins=["http://localhost:5173", "http://localhost:8080", ...],
```

---

## 🔄 Next Steps

1. ✅ Run SQL setup in Supabase
2. ✅ Start backend server
3. ✅ Test APIs using `/docs`
4. 🔜 Update frontend API client (`lib/api.js`)
5. 🔜 Connect budget page to backend
6. 🔜 Update transaction form to use dynamic categories

---

## 📝 Notes

- **Category Matching:** When category is "others", the system uses `custom_category_name` for transaction matching
- **Spent Calculation:** Happens in real-time when fetching budgets
- **Period Types:**
  - Monthly: Matches transactions in same month/year
  - Weekly: Matches transactions within 7 days from start_date
