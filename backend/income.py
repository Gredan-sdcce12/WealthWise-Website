"""Income feature routes for WealthWise backend."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

from database import get_db_connection


router = APIRouter(prefix="/income", tags=["income"])


class IncomeCreate(BaseModel):
	user_id: str
	amount: float
	income_type: str

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
				SELECT amount, income_type
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
			amount, income_type = row
			return {"amount": float(amount), "income_type": income_type}
	finally:
		conn.close()


@router.get("/latest/{user_id}")
def get_latest_income(user_id: str):
	income = _fetch_latest_income(user_id)
	if not income:
		return {"amount": None, "income_type": None}
	return income


@router.post("/")
def create_income(payload: IncomeCreate):
	current = datetime.utcnow()
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				INSERT INTO incomes (user_id, amount, income_type, month, year, created_at)
				VALUES (%s, %s, %s, %s, %s, NOW())
				RETURNING id, amount, income_type, month, year;
				""",
				(
					payload.user_id,
					payload.amount,
					payload.income_type,
					current.month,
					current.year,
				),
			)
			new_id, amount, income_type, month, year = cur.fetchone()
		conn.commit()
		return {
			"id": new_id,
			"user_id": payload.user_id,
			"amount": float(amount),
			"income_type": income_type,
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
	last_income = _fetch_latest_income(user_id)
	if not last_income:
		raise HTTPException(status_code=404, detail="No previous income to copy")

	current = datetime.utcnow()
	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				INSERT INTO incomes (user_id, amount, income_type, month, year, created_at)
				VALUES (%s, %s, %s, %s, %s, NOW())
				RETURNING id, amount, income_type, month, year;
				""",
				(
					user_id,
					last_income["amount"],
					last_income["income_type"],
					current.month,
					current.year,
				),
			)
			new_id, amount, income_type, month, year = cur.fetchone()
		conn.commit()
		return {
			"id": new_id,
			"user_id": user_id,
			"amount": float(amount),
			"income_type": income_type,
			"month": month,
			"year": year,
		}
	except Exception as exc:  # pragma: no cover - runtime guard
		conn.rollback()
		raise HTTPException(status_code=500, detail=f"Failed to copy income: {exc}") from exc
	finally:
		conn.close()
