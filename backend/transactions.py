"""Transaction feature routes for WealthWise backend."""

from datetime import date, datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator

from auth import get_current_user_id
from database import get_db_connection


router = APIRouter(prefix="/transactions", tags=["transactions"])


class TransactionCreate(BaseModel):
	amount: float
	txn_type: str
	category: Optional[str] = None
	description: Optional[str] = None
	payment_mode: Optional[str] = None
	txn_date: Optional[date] = None

	@field_validator("amount")
	@classmethod
	def validate_amount(cls, value: float) -> float:
		if value <= 0:
			raise ValueError("Amount must be greater than zero")
		return value

	@field_validator("txn_type")
	@classmethod
	def validate_type(cls, value: str) -> str:
		allowed = {"income", "expense"}
		if value not in allowed:
			raise ValueError(f"txn_type must be one of {', '.join(sorted(allowed))}")
		return value


class TransactionUpdate(BaseModel):
	amount: Optional[float] = None
	category: Optional[str] = None
	description: Optional[str] = None
	payment_mode: Optional[str] = None
	txn_date: Optional[date] = None

	@field_validator("amount")
	@classmethod
	def validate_amount(cls, value: Optional[float]) -> Optional[float]:
		if value is not None and value <= 0:
			raise ValueError("Amount must be greater than zero")
		return value


# --- Helpers -----------------------------------------------------------------


def _row_to_transaction(row: tuple) -> Dict[str, Any]:
	(
		txn_id,
		user_id,
		amount,
		txn_type,
		category,
		description,
		payment_mode,
		txn_date,
		month,
		year,
		created_at,
		updated_at,
	) = row
	return {
		"id": txn_id,
		"user_id": user_id,
		"amount": float(amount),
		"txn_type": txn_type,
		"category": category,
		"description": description,
		"payment_mode": payment_mode,
		"txn_date": txn_date.isoformat() if txn_date else None,
		"month": month,
		"year": year,
		"created_at": created_at.isoformat() if created_at else None,
		"updated_at": updated_at.isoformat() if updated_at else None,
	}


def _check_budget_warning(user_id: str, category: str, new_amount: float, txn_date: date) -> Dict[str, Any]:
	"""Check if adding this transaction would exceed budget threshold or limit."""
	if not category:
		return {}
	
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			# Find active budget for this category and date
			cur.execute(
				"""
				SELECT id, budget_type, amount, alert_threshold, start_date
				FROM budgets
				WHERE user_id = %s AND category = %s
				ORDER BY created_at DESC
				LIMIT 1;
				""",
				(user_id, category),
			)
			budget_row = cur.fetchone()
			
			if not budget_row:
				return {}  # No budget for this category
			
			budget_id, budget_type, budget_amount, alert_threshold, start_date = budget_row
			
			# Calculate current spent for this budget period
			if budget_type == "Monthly":
				cur.execute(
					"""
					SELECT COALESCE(SUM(amount), 0)
					FROM transactions
					WHERE user_id = %s 
						AND category = %s 
						AND txn_type = 'expense'
						AND month = %s 
						AND year = %s;
					""",
					(user_id, category, txn_date.month, txn_date.year),
				)
			else:  # Weekly
				from datetime import timedelta
				end_date = start_date + timedelta(days=7)
				cur.execute(
					"""
					SELECT COALESCE(SUM(amount), 0)
					FROM transactions
					WHERE user_id = %s 
						AND category = %s 
						AND txn_type = 'expense'
						AND txn_date >= %s 
						AND txn_date < %s;
					""",
					(user_id, category, start_date, end_date),
				)
			
			current_spent = float(cur.fetchone()[0])
			new_total = current_spent + new_amount
			percentage = (new_total / float(budget_amount)) * 100
			
			warning_data = {
				"budget_id": budget_id,
				"budget_amount": float(budget_amount),
				"current_spent": current_spent,
				"new_total": new_total,
				"percentage": round(percentage, 1),
				"alert_threshold": alert_threshold,
			}
			
			if percentage >= 100:
				warning_data["warning"] = "budget_exceeded"
				warning_data["message"] = f"⚠️ Budget exceeded! You've spent ₹{new_total:.2f} of ₹{budget_amount:.2f} ({percentage:.1f}%)"
			elif percentage >= alert_threshold:
				warning_data["warning"] = "threshold_exceeded"
				warning_data["message"] = f"⚠️ Alert: You've reached {percentage:.1f}% of your {category} budget (₹{new_total:.2f}/₹{budget_amount:.2f})"
			
			return warning_data
	finally:
		conn.close()


# --- Routes ------------------------------------------------------------------


@router.post("/")
def create_transaction(payload: TransactionCreate, user_id: str = Depends(get_current_user_id)):
	txn_dt = payload.txn_date or datetime.utcnow().date()
	month = txn_dt.month
	year = txn_dt.year

	# Check budget warning for expenses
	budget_warning = {}
	if payload.txn_type == "expense" and payload.category:
		budget_warning = _check_budget_warning(payload.user_id, payload.category, payload.amount, txn_dt)

	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				INSERT INTO transactions (
					user_id, amount, txn_type, category, description, payment_mode, txn_date, month, year, created_at, updated_at
				)
				VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
				RETURNING id, user_id, amount, txn_type, category, description, payment_mode, txn_date, month, year, created_at, updated_at;
				""",
				(
					user_id,
					payload.amount,
					payload.txn_type,
					payload.category,
					payload.description,
					payload.payment_mode,
					txn_dt,
					month,
					year,
				),
			)
			row = cur.fetchone()
		conn.commit()
		
		result = _row_to_transaction(row)
		
		# Add budget warning to response if present
		if budget_warning:
			result["budget_warning"] = budget_warning
		
		return result
	except Exception as exc:  # pragma: no cover - runtime guard
		conn.rollback()
		raise HTTPException(status_code=500, detail=f"Failed to create transaction: {exc}") from exc
	finally:
		conn.close()


@router.get("/")
def list_transactions(
	start_date: Optional[date] = None,
	end_date: Optional[date] = None,
	category: Optional[str] = None,
	payment_mode: Optional[str] = None,
	search: Optional[str] = None,
	limit: int = Query(50, ge=1, le=200),
	offset: int = Query(0, ge=0),
	user_id: str = Depends(get_current_user_id),
):
	where_clauses: List[str] = ["user_id = %s"]
	params: List[Any] = [user_id]

	if start_date:
		where_clauses.append("txn_date >= %s")
		params.append(start_date)
	if end_date:
		where_clauses.append("txn_date <= %s")
		params.append(end_date)
	if category:
		where_clauses.append("category = %s")
		params.append(category)
	if payment_mode:
		where_clauses.append("payment_mode = %s")
		params.append(payment_mode)
	if search:
		where_clauses.append("LOWER(description) LIKE %s")
		params.append(f"%{search.lower()}%")

	where_sql = " AND ".join(where_clauses)

	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				f"""
				SELECT id, user_id, amount, txn_type, category, description, payment_mode, txn_date, month, year, created_at, updated_at
				FROM transactions
				WHERE {where_sql}
				ORDER BY txn_date DESC, created_at DESC
				LIMIT %s OFFSET %s;
				""",
				(*params, limit, offset),
			)
			rows = cur.fetchall()
		return [_row_to_transaction(row) for row in rows]
	except Exception as exc:  # pragma: no cover - runtime guard
		raise HTTPException(status_code=500, detail=f"Failed to list transactions: {exc}") from exc
	finally:
		conn.close()


@router.get("/summary")
def transaction_summary(
	month: int | None = None,
	year: int | None = None,
	user_id: str = Depends(get_current_user_id),
):
	current = datetime.utcnow()
	month = month or current.month
	year = year or current.year

	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				SELECT
					COALESCE(SUM(CASE WHEN txn_type = 'expense' THEN amount END), 0) AS total_expense,
					COALESCE(SUM(CASE WHEN txn_type = 'income' THEN amount END), 0) AS total_income
				FROM transactions
				WHERE user_id = %s AND month = %s AND year = %s;
				""",
				(user_id, month, year),
			)
			totals_row = cur.fetchone()

			cur.execute(
				"""
				SELECT category, COALESCE(SUM(amount), 0) AS total
				FROM transactions
				WHERE user_id = %s AND txn_type = 'expense' AND month = %s AND year = %s
				GROUP BY category
				ORDER BY total DESC;
				""",
				(user_id, month, year),
			)
			category_rows = cur.fetchall()

		return {
			"user_id": user_id,
			"month": month,
			"year": year,
			"total_expense": float(totals_row[0]) if totals_row else 0.0,
			"total_income": float(totals_row[1]) if totals_row else 0.0,
			"expenses_by_category": {
				row[0] or "uncategorized": float(row[1]) for row in category_rows
			},
		}
	except Exception as exc:  # pragma: no cover - runtime guard
		raise HTTPException(status_code=500, detail=f"Failed to fetch summary: {exc}") from exc
	finally:
		conn.close()


@router.get("/{txn_id}")
def get_transaction(txn_id: int, user_id: str = Depends(get_current_user_id)):
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				SELECT id, user_id, amount, txn_type, category, description, payment_mode, txn_date, month, year, created_at, updated_at
				FROM transactions
				WHERE id = %s AND user_id = %s;
				""",
				(txn_id, user_id),
			)
			row = cur.fetchone()
			if not row:
				raise HTTPException(status_code=404, detail="Transaction not found")
			return _row_to_transaction(row)
	finally:
		conn.close()


@router.put("/{txn_id}")
def update_transaction(txn_id: int, payload: TransactionUpdate, user_id: str = Depends(get_current_user_id)):
	set_clauses: List[str] = []
	params: List[Any] = []

	if payload.amount is not None:
		set_clauses.append("amount = %s")
		params.append(payload.amount)
	if payload.category is not None:
		set_clauses.append("category = %s")
		params.append(payload.category)
	if payload.description is not None:
		set_clauses.append("description = %s")
		params.append(payload.description)
	if payload.payment_mode is not None:
		set_clauses.append("payment_mode = %s")
		params.append(payload.payment_mode)
	if payload.txn_date is not None:
		set_clauses.append("txn_date = %s")
		params.append(payload.txn_date)
		set_clauses.append("month = %s")
		params.append(payload.txn_date.month)
		set_clauses.append("year = %s")
		params.append(payload.txn_date.year)

	if not set_clauses:
		raise HTTPException(status_code=400, detail="No fields to update")

	set_clauses.append("updated_at = NOW()")
	set_sql = ", ".join(set_clauses)
	params.extend([txn_id, user_id])

	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				f"""
				UPDATE transactions
				SET {set_sql}
				WHERE id = %s AND user_id = %s
				RETURNING id, user_id, amount, txn_type, category, description, payment_mode, txn_date, month, year, created_at, updated_at;
				""",
				tuple(params),
			)
			row = cur.fetchone()
			if not row:
				raise HTTPException(status_code=404, detail="Transaction not found")
			conn.commit()
			return _row_to_transaction(row)
	except Exception as exc:  # pragma: no cover - runtime guard
		conn.rollback()
		raise HTTPException(status_code=500, detail=f"Failed to update transaction: {exc}") from exc
	finally:
		conn.close()


@router.delete("/{txn_id}")
def delete_transaction(txn_id: int, user_id: str = Depends(get_current_user_id)):
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				DELETE FROM transactions
				WHERE id = %s AND user_id = %s
				RETURNING id;
				""",
				(txn_id, user_id),
			)
			row = cur.fetchone()
			if not row:
				raise HTTPException(status_code=404, detail="Transaction not found")
			conn.commit()
			return {"status": "deleted", "id": row[0]}
	except Exception as exc:  # pragma: no cover - runtime guard
		conn.rollback()
		raise HTTPException(status_code=500, detail=f"Failed to delete transaction: {exc}") from exc
	finally:
		conn.close()
