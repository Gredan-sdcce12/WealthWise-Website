"""Budget feature routes for WealthWise backend."""

from datetime import date, datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator

from auth import get_current_user_id
from database import get_db_connection


router = APIRouter(prefix="/budgets", tags=["budgets"])


class BudgetCreate(BaseModel):
	category: str
	budget_type: str
	amount: float
	start_date: date
	alert_threshold: int = 80
	custom_category_name: Optional[str] = None

	@field_validator("amount")
	@classmethod
	def validate_amount(cls, value: float) -> float:
		if value <= 0:
			raise ValueError("Amount must be greater than zero")
		return value

	@field_validator("budget_type")
	@classmethod
	def validate_type(cls, value: str) -> str:
		allowed = {"Monthly", "Weekly"}
		if value not in allowed:
			raise ValueError(f"budget_type must be one of {', '.join(sorted(allowed))}")
		return value

	@field_validator("alert_threshold")
	@classmethod
	def validate_threshold(cls, value: int) -> int:
		if not (1 <= value <= 100):
			raise ValueError("alert_threshold must be between 1 and 100")
		return value

	@field_validator("custom_category_name")
	@classmethod
	def validate_custom_category(cls, value: Optional[str], info) -> Optional[str]:
		# If category is "others", custom_category_name must be provided
		data = info.data if hasattr(info, 'data') else {}
		category = data.get("category", "")
		if category == "others" and not value:
			raise ValueError("custom_category_name is required when category is 'others'")
		return value


class BudgetUpdate(BaseModel):
	amount: Optional[float] = None
	budget_type: Optional[str] = None
	alert_threshold: Optional[int] = None
	start_date: Optional[date] = None
	custom_category_name: Optional[str] = None

	@field_validator("amount")
	@classmethod
	def validate_amount(cls, value: Optional[float]) -> Optional[float]:
		if value is not None and value <= 0:
			raise ValueError("Amount must be greater than zero")
		return value

	@field_validator("budget_type")
	@classmethod
	def validate_type(cls, value: Optional[str]) -> Optional[str]:
		if value is not None:
			allowed = {"Monthly", "Weekly"}
			if value not in allowed:
				raise ValueError(f"budget_type must be one of {', '.join(sorted(allowed))}")
		return value

	@field_validator("alert_threshold")
	@classmethod
	def validate_threshold(cls, value: Optional[int]) -> Optional[int]:
		if value is not None and not (1 <= value <= 100):
			raise ValueError("alert_threshold must be between 1 and 100")
		return value


# --- Helpers -----------------------------------------------------------------


def _row_to_budget(row: tuple) -> Dict[str, Any]:
	(
		budget_id,
		user_id,
		category,
		budget_type,
		amount,
		start_date,
		alert_threshold,
		custom_category_name,
		created_at,
		updated_at,
	) = row
	return {
		"id": budget_id,
		"user_id": user_id,
		"category": category,
		"budget_type": budget_type,
		"amount": float(amount),
		"start_date": start_date.isoformat() if start_date else None,
		"alert_threshold": alert_threshold,
		"custom_category_name": custom_category_name,
		"created_at": created_at.isoformat() if created_at else None,
		"updated_at": updated_at.isoformat() if updated_at else None,
	}


def _calculate_spent_for_budget(user_id: str, category: str, budget_type: str, start_date: date) -> float:
	"""Calculate total spent for a budget by querying transactions."""
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			if budget_type == "Monthly":
				# Get transactions for the same month/year
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
					(user_id, category, start_date.month, start_date.year),
				)
			else:  # Weekly
				# Get transactions within 7 days from start_date
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
			
			result = cur.fetchone()
			return float(result[0]) if result else 0.0
	finally:
		conn.close()


# --- Routes ------------------------------------------------------------------


@router.post("/")
def create_budget(payload: BudgetCreate, user_id: str = Depends(get_current_user_id)):
	"""Create a new budget."""
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				INSERT INTO budgets (
					user_id, category, budget_type, amount, start_date, alert_threshold, custom_category_name, created_at, updated_at
				)
				VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
				RETURNING id, user_id, category, budget_type, amount, start_date, alert_threshold, custom_category_name, created_at, updated_at;
				""",
				(
					user_id,
					payload.category,
					payload.budget_type,
					payload.amount,
					payload.start_date,
					payload.alert_threshold,
					payload.custom_category_name,
				),
			)
			row = cur.fetchone()
		conn.commit()
		budget = _row_to_budget(row)
		
		# Add spent amount
		spent = _calculate_spent_for_budget(
			user_id, 
			payload.custom_category_name if payload.category == "others" else payload.category,
			payload.budget_type, 
			payload.start_date
		)
		budget["spent"] = spent
		
		return budget
	except Exception as exc:
		conn.rollback()
		# Check for unique constraint violation
		if "unique_user_category_period" in str(exc):
			raise HTTPException(
				status_code=409, 
				detail="Budget already exists for this category and period"
			) from exc
		raise HTTPException(status_code=500, detail=f"Failed to create budget: {exc}") from exc
	finally:
		conn.close()


@router.get("/")
def list_budgets(
	category: Optional[str] = None,
	budget_type: Optional[str] = None,
	month: Optional[int] = None,
	year: Optional[int] = None,
	user_id: str = Depends(get_current_user_id),
):
	"""List all budgets for a user with optional filters."""
	where_clauses: List[str] = ["user_id = %s"]
	params: List[Any] = [user_id]

	if category:
		where_clauses.append("category = %s")
		params.append(category)
	
	if budget_type:
		where_clauses.append("budget_type = %s")
		params.append(budget_type)
	
	if month and year:
		where_clauses.append("EXTRACT(MONTH FROM start_date) = %s")
		where_clauses.append("EXTRACT(YEAR FROM start_date) = %s")
		params.extend([month, year])

	where_sql = " AND ".join(where_clauses)

	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				f"""
				SELECT id, user_id, category, budget_type, amount, start_date, alert_threshold, custom_category_name, created_at, updated_at
				FROM budgets
				WHERE {where_sql}
				ORDER BY created_at DESC;
				""",
				tuple(params),
			)
			rows = cur.fetchall()
		
		budgets = []
		for row in rows:
			budget = _row_to_budget(row)
			
			# Calculate spent amount for each budget
			category_for_txn = budget["custom_category_name"] if budget["category"] == "others" else budget["category"]
			spent = _calculate_spent_for_budget(
				budget["user_id"],
				category_for_txn,
				budget["budget_type"],
				datetime.fromisoformat(budget["start_date"]).date()
			)
			budget["spent"] = spent
			budgets.append(budget)
		
		return budgets
	except Exception as exc:
		raise HTTPException(status_code=500, detail=f"Failed to list budgets: {exc}") from exc
	finally:
		conn.close()


@router.get("/categories")
def get_all_categories(user_id: str = Depends(get_current_user_id)):
	"""Get all available categories including predefined and custom ones from budgets."""
	
	# Predefined categories (excluding 'others' - it will be added with subcategories)
	predefined = [
		{"value": "food", "label": "Food & Groceries", "icon": "🍽️"},
		{"value": "transport", "label": "Transport", "icon": "🚗"},
		{"value": "bills", "label": "Bills & Utilities", "icon": "💡"},
		{"value": "rent", "label": "Rent", "icon": "🏠"},
		{"value": "shopping", "label": "Shopping", "icon": "🛍️"},
		{"value": "entertainment", "label": "Entertainment", "icon": "🎮"},
		{"value": "healthcare", "label": "Healthcare", "icon": "🏥"},
		{"value": "education", "label": "Education", "icon": "📚"},
		{"value": "emi", "label": "EMI / Loans", "icon": "💳"},
		{"value": "savings", "label": "Savings & Investments", "icon": "💰"},
	]
	
	# Get custom categories from budgets where category = 'others'
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			# Query all budgets with category='others' to get custom categories
			cur.execute(
				"""
				SELECT DISTINCT TRIM(custom_category_name) AS custom_name
				FROM budgets
				WHERE user_id = %s 
					AND LOWER(category) = 'others' 
					AND custom_category_name IS NOT NULL
					AND TRIM(custom_category_name) != ''
				ORDER BY custom_name;
				""",
				(user_id,),
			)
			rows = cur.fetchall()
		
		custom_categories = [
			{"value": row[0], "label": row[0], "icon": "📦"}
			for row in rows
		]
		
		# Debug: Print to console to verify categories are being fetched
		print(f"DEBUG: Fetched {len(custom_categories)} custom categories for user {user_id}: {custom_categories}")
		
		# Create 'Others' with subcategories
		others_group = {
			"value": "others",
			"label": "Others",
			"icon": "📦",
			"subcategories": custom_categories
		}
		
		return {
			"predefined": predefined,
			"custom": custom_categories,
			"others": others_group,
			"all": predefined + [others_group] if custom_categories else predefined + [{"value": "others", "label": "Others", "icon": "📦"}]
		}
	except Exception as exc:
		raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {exc}") from exc
	finally:
		conn.close()


@router.get("/{budget_id}")
def get_budget(budget_id: int, user_id: str = Depends(get_current_user_id)):
	"""Get a specific budget by ID."""
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				SELECT id, user_id, category, budget_type, amount, start_date, alert_threshold, custom_category_name, created_at, updated_at
				FROM budgets
				WHERE id = %s AND user_id = %s;
				""",
				(budget_id, user_id),
			)
			row = cur.fetchone()
			if not row:
				raise HTTPException(status_code=404, detail="Budget not found")
			
			budget = _row_to_budget(row)
			
			# Add spent amount
			category_for_txn = budget["custom_category_name"] if budget["category"] == "others" else budget["category"]
			spent = _calculate_spent_for_budget(
				budget["user_id"],
				category_for_txn,
				budget["budget_type"],
				datetime.fromisoformat(budget["start_date"]).date()
			)
			budget["spent"] = spent
			
			return budget
	finally:
		conn.close()


@router.put("/{budget_id}")
def update_budget(budget_id: int, payload: BudgetUpdate, user_id: str = Depends(get_current_user_id)):
	"""Update an existing budget."""
	set_clauses: List[str] = []
	params: List[Any] = []

	if payload.amount is not None:
		set_clauses.append("amount = %s")
		params.append(payload.amount)
	if payload.budget_type is not None:
		set_clauses.append("budget_type = %s")
		params.append(payload.budget_type)
	if payload.alert_threshold is not None:
		set_clauses.append("alert_threshold = %s")
		params.append(payload.alert_threshold)
	if payload.start_date is not None:
		set_clauses.append("start_date = %s")
		params.append(payload.start_date)
	if payload.custom_category_name is not None:
		set_clauses.append("custom_category_name = %s")
		params.append(payload.custom_category_name)

	if not set_clauses:
		raise HTTPException(status_code=400, detail="No fields to update")

	set_clauses.append("updated_at = NOW()")
	set_sql = ", ".join(set_clauses)
	params.extend([budget_id, user_id])

	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				f"""
				UPDATE budgets
				SET {set_sql}
				WHERE id = %s AND user_id = %s
				RETURNING id, user_id, category, budget_type, amount, start_date, alert_threshold, custom_category_name, created_at, updated_at;
				""",
				tuple(params),
			)
			row = cur.fetchone()
			if not row:
				raise HTTPException(status_code=404, detail="Budget not found")
			conn.commit()
			
			budget = _row_to_budget(row)
			
			# Add spent amount
			category_for_txn = budget["custom_category_name"] if budget["category"] == "others" else budget["category"]
			spent = _calculate_spent_for_budget(
				budget["user_id"],
				category_for_txn,
				budget["budget_type"],
				datetime.fromisoformat(budget["start_date"]).date()
			)
			budget["spent"] = spent
			
			return budget
	except Exception as exc:
		conn.rollback()
		raise HTTPException(status_code=500, detail=f"Failed to update budget: {exc}") from exc
	finally:
		conn.close()


@router.delete("/{budget_id}")
def delete_budget(budget_id: int, user_id: str = Depends(get_current_user_id)):
	"""Delete a budget."""
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				DELETE FROM budgets
				WHERE id = %s AND user_id = %s
				RETURNING id;
				""",
				(budget_id, user_id),
			)
			row = cur.fetchone()
			if not row:
				raise HTTPException(status_code=404, detail="Budget not found")
			conn.commit()
			return {"status": "deleted", "id": row[0]}
	except Exception as exc:
		conn.rollback()
		raise HTTPException(status_code=500, detail=f"Failed to delete budget: {exc}") from exc
	finally:
		conn.close()
