"""Income feature routes for WealthWise backend."""

from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

from database import get_db_connection


router = APIRouter(prefix="/income", tags=["income"])


class IncomeCreate(BaseModel):
	user_id: str
	amount: float
	income_type: str
	source: Optional[str] = None
	note: Optional[str] = None
	received_date: Optional[date] = None

	@field_validator("amount")
	@classmethod
	def validate_amount(cls, value: float) -> float:
		if value < 0:
			raise ValueError("Income cannot be negative")
		return value


def _fetch_latest_income(user_id: str) -> Optional[dict]:
	"""Return latest income record for user or None."""
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				SELECT amount, income_type, source, note, received_date
				FROM incomes
				WHERE user_id = %s
				ORDER BY created_at DESC
				LIMIT 1;
				""",
				(user_id,),
			)
			row = cur.fetchone()
			if not row:
				return None
			amount, income_type, source, note, received_date = row
			return {
				"amount": float(amount),
				"income_type": income_type,
				"source": source,
				"note": note,
				"received_date": received_date.isoformat() if received_date else None,
			}
	finally:
		conn.close()


def _fetch_monthly_total(user_id: str, month: int, year: int) -> float:
	"""Return the total income for a given user/month/year."""
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				SELECT COALESCE(SUM(amount), 0)
				FROM incomes
				WHERE user_id = %s AND month = %s AND year = %s;
				""",
				(user_id, month, year),
			)
			row = cur.fetchone()
			return float(row[0]) if row else 0.0
	finally:
		conn.close()


@router.get("/latest/{user_id}")
def get_latest_income(user_id: str):
	income = _fetch_latest_income(user_id)
	if not income:
		return {"amount": None, "income_type": None}
	return income


@router.get("/total/{user_id}")
def get_income_total(user_id: str, month: int | None = None, year: int | None = None):
	"""Return summed income for the specified month/year (defaults to current)."""
	current = datetime.utcnow()
	month = month or current.month
	year = year or current.year
	try:
		total = _fetch_monthly_total(user_id, month, year)
		return {"user_id": user_id, "total": total, "month": month, "year": year}
	except Exception as exc:  # pragma: no cover - runtime guard
		raise HTTPException(status_code=500, detail=f"Failed to fetch income total: {exc}") from exc


@router.post("/")
def create_income(payload: IncomeCreate):
	current_date = payload.received_date or datetime.utcnow().date()
	month = current_date.month
	year = current_date.year
	current = datetime.combine(current_date, datetime.min.time())
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				INSERT INTO incomes (user_id, amount, income_type, source, note, received_date, month, year, created_at)
				VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
				RETURNING id, amount, income_type, source, note, received_date, month, year;
				""",
				(
					payload.user_id,
					payload.amount,
					payload.income_type,
					payload.source,
					payload.note,
					current_date,
					month,
					year,
				),
			)
			new_id, amount, income_type, source, note, received_date, month, year = cur.fetchone()
		conn.commit()
		return {
			"id": new_id,
			"user_id": payload.user_id,
			"amount": float(amount),
			"income_type": income_type,
			"source": source,
			"note": note,
			"received_date": received_date.isoformat() if received_date else None,
			"month": month,
			"year": year,
		}
	except Exception as exc:  # pragma: no cover - runtime guard
		conn.rollback()
		raise HTTPException(status_code=500, detail=f"Failed to create income: {exc}") from exc
	finally:
		conn.close()


@router.post("/same-as-previous/{user_id}")
def copy_previous_income(user_id: str):
	"""Return the most recent income without inserting a new record.

	Used when the user taps "Same as previous" and only wants to reuse the data
	for prefill without affecting monthly totals.
	"""
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				SELECT id, amount, income_type, source, note, received_date, month, year
				FROM incomes
				WHERE user_id = %s
				ORDER BY created_at DESC
				LIMIT 1;
				""",
				(user_id,),
			)
			row = cur.fetchone()
			if not row:
				raise HTTPException(status_code=404, detail="No previous income to copy")
			income_id, amount, income_type, source, note, received_date, month, year = row
			return {
				"id": income_id,
				"user_id": user_id,
				"amount": float(amount),
				"income_type": income_type,
				"source": source,
				"note": note,
				"received_date": received_date.isoformat() if received_date else None,
				"month": month,
				"year": year,
			}
	finally:
		conn.close()
