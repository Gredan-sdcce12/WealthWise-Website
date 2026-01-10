# Auth Implementation Summary

## Changes Made

### Backend (FastAPI)

1. **[auth.py](backend/auth.py)** (new file)

   - Added `get_current_user_id()` dependency to validate Supabase JWTs (HS256)
   - Extracts `user_id` from token's `sub` claim
   - Returns 401 on missing/invalid token

2. **[main.py](backend/main.py)**

   - No changes needed (routes are auto-protected via dependency injection)

3. **[income.py](backend/income.py)**

   - Removed `user_id` from `IncomeCreate` model
   - All routes now use `user_id: str = Depends(get_current_user_id)`
   - Routes changed:
     - `GET /income/latest` → `GET /income/latest` (removed `/{user_id}`)
     - `GET /income/total` → `GET /income/total` (removed `/{user_id}`)
     - `POST /income` → derives user_id from token
     - `POST /income/same-as-previous` → `POST /income/same-as-previous` (removed `/{user_id}`)

4. **[budgets.py](backend/budgets.py)**

   - Removed `user_id` from `BudgetCreate` model
   - All routes now use `user_id: str = Depends(get_current_user_id)`
   - Routes changed:
     - `GET /budgets/` → requires auth, auto-filters by user_id
     - `GET /budgets/{budget_id}` → removed user_id query param
     - `POST /budgets/` → derives user_id from token
     - `PUT /budgets/{budget_id}` → removed user_id query param
     - `DELETE /budgets/{budget_id}` → removed user_id query param
     - `GET /budgets/categories` → derives user_id from token

5. **[transactions.py](backend/transactions.py)**

   - Removed `user_id` from `TransactionCreate` model
   - All routes now use `user_id: str = Depends(get_current_user_id)`
   - Routes changed:
     - `GET /transactions/` → removed user_id query param
     - `GET /transactions/{txn_id}` → removed user_id query param
     - `POST /transactions/` → derives user_id from token
     - `PUT /transactions/{txn_id}` → removed user_id query param
     - `DELETE /transactions/{txn_id}` → removed user_id query param
     - `GET /transactions/summary` → removed user_id query param

6. **[requirements.txt](backend/requirements.txt)**
   - Added `PyJWT` for JWT verification

### Frontend (React/JavaScript)

1. **[api.js](frontend/src/lib/api.js)**

   - Added `withAuthHeaders()` helper to get Supabase access token and attach `Authorization: Bearer {token}` header
   - Removed `user_id` parameter from all API methods:
     - `getTransactions(filters)` instead of `getTransactions(userId, filters)`
     - `getBudgets(filters)` instead of `getBudgets(userId, filters)`
     - `getCategories()` instead of `getCategories(userId)`
     - etc.

2. **[Transactions.jsx](frontend/src/pages/dashboard/Transactions.jsx)**

   - Removed `userId` from API calls
   - Updated `api.getTransactions(filters)`
   - Updated `api.updateTransaction(txnId, data)`
   - Updated `api.deleteTransaction(txnId)`
   - Updated `api.getTransactionSummary(month, year)`
   - Updated `api.getCategories()`

3. **[Budgets.jsx](frontend/src/pages/dashboard/Budgets.jsx)**

   - Removed `userId` from API calls
   - Updated `api.getBudgets(filters)`
   - Updated `api.createBudget(data)`
   - Updated `api.updateBudget(budgetId, data)`
   - Updated `api.deleteBudget(budgetId)`
   - Updated `api.getCategories()`

4. **[DashboardLayout.jsx](frontend/src/components/dashboard/DashboardLayout.jsx)**
   - Updated fetch calls to use auth headers with Supabase token
   - Removed `userId` from income fetch URLs
   - Routes changed:
     - `/income/latest/{uid}` → `/income/latest`
     - `/income/total/{uid}` → `/income/total`
     - `/income/same-as-previous/{uid}` → `/income/same-as-previous`

## Security Improvements

✅ **Backend now verifies** every request using Supabase JWT  
✅ **User ID derived from token** (cannot be spoofed from client)  
✅ **Database queries filtered** by authenticated user  
✅ **401 responses** on missing/invalid auth  
✅ **No user_id in request bodies** (can't be manipulated)

## Setup Required

### Environment Variables

Backend `.env` needs:

```
SUPABASE_JWT_SECRET=<your-supabase-jwt-secret>
```

Get this from Supabase Project Settings → JWT Settings → JWT Secret

### Testing

After starting the backend, Supabase auth will automatically attach the token. All API calls now require a valid session.
