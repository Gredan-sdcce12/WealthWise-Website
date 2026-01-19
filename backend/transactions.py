"""Transaction feature routes for WealthWise backend."""

import os
import re
import io
from datetime import date, datetime
from typing import Any, Dict, List, Optional
import numpy

# Configure Tesseract path in environment BEFORE importing pytesseract
if os.name == 'nt':  # Windows
	os.environ['PATH'] = r'C:\Program Files\Tesseract-OCR;' + os.environ.get('PATH', '')

from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from pydantic import BaseModel, field_validator
import pytesseract
from PIL import Image

# Also set pytesseract command directly
if os.name == 'nt':
	pytesseract.pytesseract.pytesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

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
	source: str = "manual"  # "manual" or "ocr"

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


def _extract_receipt_data(text: str) -> Dict[str, Any]:
	"""Extract vendor, amount, and date from OCR text.
	
	IMPROVED APPROACH:
	- Amount: Look for TOTAL/GRAND TOTAL/NET AMOUNT lines
	- Look for currency symbols (₹, Rs, INR)
	- Category: User must select (not auto-filled)
	- Description: Merchant name from first few lines
	"""
	lines = [line.strip() for line in text.split('\n') if line.strip()]
	amount = None
	
	print(f">>> RAW OCR TEXT:\n{text}\n>>> END RAW TEXT")
	print(f">>> Total lines: {len(lines)}")
	
	# Priority 1: Look for 'GRAND TOTAL' line with currency symbol, ignore lines with 'Receipt', 'Phone', etc.
	keywords = ["GRAND TOTAL", "NET AMOUNT", "AMOUNT PAYABLE", "TOTAL AMOUNT", "NET TOTAL", "AMOUNT TO BE PAID"]
	for keyword in keywords:
		for line in lines:
			line_upper = line.upper()
			# Ignore lines with 'RECEIPT', 'PHONE', etc.
			if any(skip in line_upper for skip in ["RECEIPT", "PHONE", "DATE", "STATION", "BARCODE"]):
				continue
			if keyword in line_upper:
				# Extract the last number after the keyword (to avoid picking up receipt numbers)
				# Example: 'Grand Total           ₹379.00' or 'Grand Total 379.00'
				numbers = re.findall(r'(\d+(?:,\d+)*(?:\.\d{2})?)', line)
				if numbers:
					amount_str = numbers[-1].replace(',', '')
					try:
						amount = float(amount_str)
						if 1 <= amount <= 100000:
							print(f">>> GRAND TOTAL STRICT: ₹{amount} from line: {line}")
							break
					except ValueError:
						continue
			if amount:
				break
		if amount:
			break
	
	# Priority 2: Look for regular "TOTAL" line (not subtotal)
	if not amount:
		for line in lines:
			line_upper = line.upper()
			if line_upper.startswith("TOTAL") and "SUB" not in line_upper and "ITEM" not in line_upper:
				patterns = [
					r'₹\s*([\d,\.]+)',
					r'RS\.?\s*([\d,\.]+)',
					r'INR\s*([\d,\.]+)',
					r'([\d,\.]+)\s*$',
					r':\s*([\d,\.]+)',
				]
				
				for pattern in patterns:
					match = re.search(pattern, line)
					if match:
						amount_str = match.group(1).replace(',', '')
						try:
							amount = float(amount_str)
							if 1 <= amount <= 100000:
								print(f">>> TOTAL EXTRACTED: ₹{amount} from line: {line}")
								break
						except ValueError:
							continue
				if amount:
					break
	
	# Priority 3: Look for largest amount with currency symbol in last 10 lines (avoid receipt numbers)
	if not amount:
		amounts_found = []
		for line in lines[-10:]:
			# Skip lines that look like receipt numbers, phone numbers, or dates
			if re.search(r'\d{5,}', line) and not re.search(r'[₹Rs]', line, re.IGNORECASE):
				continue  # Skip lines with 5+ consecutive digits without currency symbol
			
			patterns = [
				r'₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)',  # ₹ with proper number format
				r'RS\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)',  # Rs with proper format
				r'INR\s*(\d+(?:,\d+)*(?:\.\d{2})?)',  # INR with proper format
			]
			for pattern in patterns:
				matches = re.findall(pattern, line, re.IGNORECASE)
				for match in matches:
					try:
						val = float(match.replace(',', ''))
						if 1 <= val <= 100000:
							amounts_found.append((val, line))
					except ValueError:
						continue
		
		if amounts_found:
			amount, source_line = max(amounts_found, key=lambda x: x[0])
			print(f">>> FALLBACK AMOUNT (with currency): ₹{amount} from line: {source_line}")
	
	# Last resort: Look for reasonable decimal amounts (XX.00 format) in last 5 lines
	if not amount:
		for line in lines[-5:]:
			# Only match amounts with decimal points to avoid receipt numbers
			match = re.search(r'\b(\d{2,5}\.\d{2})\b', line)
			if match:
				try:
					amount = float(match.group(1))
					if 10 <= amount <= 100000:
						print(f">>> LAST RESORT AMOUNT: ₹{amount} from line: {line}")
						break
				except ValueError:
					continue
	
	# Extract date (DD/MM/YYYY, MM/DD/YYYY, or DD-MM-YYYY formats)
	date_pattern = r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})'
	date_match = re.search(date_pattern, text)
	
	date_str = None
	if date_match:
		date_str = date_match.group(1)
		try:
			for fmt in ['%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y', '%m-%d-%Y', '%d/%m/%y', '%m-%d-%y']:
				try:
					parsed_date = datetime.strptime(date_str, fmt).date()
					# Sanity check: if date is more than 1 year in the past, use today's date
					days_diff = (datetime.utcnow().date() - parsed_date).days
					if days_diff > 365:
						print(f">>> Date too old ({parsed_date}), using today's date instead")
						date_str = None
						break
					date_str = parsed_date.isoformat()
					break
				except ValueError:
					continue
		except Exception:
			date_str = None
	
	if not date_str:
		date_str = datetime.utcnow().date().isoformat()
	
	# ✅ FIX 3: Extract merchant name only (first meaningful line)
	vendor = "Receipt"
	for line in lines:
		line_clean = line.strip()
		# Skip empty lines and common headers
		if (line_clean and len(line_clean) > 2 and 
			"date" not in line_clean.lower() and
			"item" not in line_clean.lower() and
			"qty" not in line_clean.lower() and
			"amount" not in line_clean.lower() and
			"thank" not in line_clean.lower() and
			"total" not in line_clean.lower()):
			vendor = line_clean
			break
	vendor = vendor[:50]
	
	# ✅ FIX 2: Category Handling - DON'T auto-fill, let user select
	# Category will be selected by user in the UI
	
	return {
		"vendor": vendor or "Receipt",
		"amount": amount or 0.0,
		"date": date_str,
		"category": None  # User must select category
	}


def _guess_category(text: str) -> str:
	"""Guess transaction category based on receipt content."""
	text_lower = text.lower()
	
	category_keywords = {
		"groceries": ["grocery", "supermarket", "whole foods", "kroger", "safeway", "produce", "dairy", "meat", "noodles", "sugar", "salt", "soap", "bazaar"],
		"shopping": ["mall", "retail", "shop", "store", "amazon", "ebay", "clothes", "apparel", "bazaar", "plaza"],
		"dining": ["restaurant", "cafe", "coffee", "pizza", "burger", "bistro", "bar"],
		"transportation": ["fuel", "gas", "petrol", "uber", "lyft", "taxi", "parking", "toll"],
		"entertainment": ["movie", "cinema", "theater", "concert", "game", "spotify", "netflix"],
		"utilities": ["electric", "water", "internet", "phone", "gas bill", "utility"],
		"health": ["pharmacy", "doctor", "hospital", "medical", "clinic", "health"],
	}
	
	# Check for "Noodles", "Maggi", etc - groceries has higher priority
	for category in ["groceries", "shopping", "dining", "transportation", "entertainment", "utilities", "health"]:
		keywords = category_keywords[category]
		for keyword in keywords:
			if keyword in text_lower:
				return category
	
	return "shopping"  # Default category


# --- Helpers -----------------------------------------------------------------

def _row_to_transaction(row):
	"""Convert database row to transaction dict."""
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
		source,
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
		"source": source,
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
	# Log received transaction data
	print(f">>> BACKEND: Received transaction - Description: {payload.description}, Amount: {payload.amount}, Source: {payload.source}")
	txn_dt = payload.txn_date or datetime.utcnow().date()
	month = txn_dt.month
	year = txn_dt.year

	# Check budget warning for expenses
	budget_warning = {}
	if payload.txn_type == "expense" and payload.category:
		# Use the authenticated user_id from the dependency, not the payload
		budget_warning = _check_budget_warning(user_id, payload.category, payload.amount, txn_dt)

	conn = get_db_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(
				"""
				INSERT INTO transactions (
					user_id, amount, txn_type, category, description, payment_mode, txn_date, month, year, source, created_at, updated_at
				)
				VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
				RETURNING id, user_id, amount, txn_type, category, description, payment_mode, txn_date, month, year, source, created_at, updated_at;
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
					payload.source,
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
				SELECT id, user_id, amount, txn_type, category, description, payment_mode, txn_date, month, year, source, created_at, updated_at
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
				SELECT id, user_id, amount, txn_type, category, description, payment_mode, txn_date, month, year, source, created_at, updated_at
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
				RETURNING id, user_id, amount, txn_type, category, description, payment_mode, txn_date, month, year, source, created_at, updated_at;
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

@router.post("/scan-and-create")
async def scan_receipt_and_create(file: UploadFile = File(...), user_id: str = Depends(get_current_user_id)):
	"""
	Scan a receipt AND create a transaction directly with source='ocr'.
	This is the new simplified flow - no need to fill in forms.
	"""
	print(f"\n>>> OCR: SCAN-AND-CREATE endpoint called - File: {file.filename}, User: {user_id}")
	try:
		# Validate file type
		allowed_types = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}
		if file.content_type not in allowed_types:
			raise HTTPException(
				status_code=400,
				detail=f"Invalid file type. Allowed: JPEG, PNG, PDF. Got: {file.content_type}"
			)
		
		# Read file
		contents = await file.read()
		image = Image.open(io.BytesIO(contents))
		
		# Preprocess image
		if image.mode != 'L':
			image = image.convert('L')
		
		from PIL import ImageFilter, ImageEnhance, ImageOps
		
		if image.width < 300 or image.height < 300:
			scale_factor = max(300 / image.width, 300 / image.height)
			new_size = (int(image.width * scale_factor), int(image.height * scale_factor))
			image = image.resize(new_size, Image.Resampling.LANCZOS)
		
		image = image.filter(ImageFilter.GaussianBlur(radius=0.3))
		enhancer = ImageEnhance.Contrast(image)
		image = enhancer.enhance(3.5)
		enhancer = ImageEnhance.Brightness(image)
		image = enhancer.enhance(1.2)
		enhancer = ImageEnhance.Sharpness(image)
		image = enhancer.enhance(2.5)
		
		# Run OCR
		try:
			extracted_text = pytesseract.image_to_string(image)
		except Exception as e:
			raise HTTPException(
				status_code=500,
				detail=f"OCR processing failed. Ensure Tesseract is installed: {str(e)}"
			)
		
		if not extracted_text or not extracted_text.strip():
			raise HTTPException(
				status_code=400,
				detail="Could not extract any text from image. Please ensure receipt is clear and readable."
			)
		
		# Parse extracted text
		receipt_data = _extract_receipt_data(extracted_text)
		print(f">>> OCR: Extracted - Vendor: {receipt_data['vendor']}, Amount: {receipt_data['amount']}, Date: {receipt_data['date']}")
		
		# Create transaction directly with source='ocr'
		conn = get_db_connection()
		try:
			with conn.cursor() as cur:
				# Convert ISO date string back to date object
				if isinstance(receipt_data["date"], str):
					txn_date = datetime.fromisoformat(receipt_data["date"]).date()
				else:
					txn_date = receipt_data["date"] or datetime.utcnow().date()
				month = txn_date.month
				year = txn_date.year
				
				cur.execute(
					"""
					INSERT INTO transactions (
						user_id, amount, txn_type, category, description, payment_mode, txn_date, month, year, source, created_at, updated_at
					)
					VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
					RETURNING id, user_id, amount, txn_type, category, description, payment_mode, txn_date, month, year, source, created_at, updated_at;
					""",
					(
						user_id,
						receipt_data["amount"],
						"expense",
						receipt_data["category"],
						receipt_data["vendor"],
						"card",
						txn_date,
						month,
						year,
						"ocr"  # CRITICAL: Set source to 'ocr'
					),
				)
				row = cur.fetchone()
			conn.commit()
			
			result = _row_to_transaction(row)
			print(f">>> OCR: Transaction created with ID={result['id']}, source='{result['source']}'")
			
			return {
				"success": True,
				"transaction": result,
				"message": f"Receipt scanned and transaction created: ₹{receipt_data['amount']} from {receipt_data['vendor']}"
			}
		finally:
			conn.close()
	
	except HTTPException:
		raise
	except Exception as exc:
		print(f">>> OCR: Error in scan-and-create: {str(exc)}")
		raise HTTPException(status_code=500, detail=f"Failed to process receipt: {str(exc)}") from exc


@router.post("/scan-receipt")
async def scan_receipt(file: UploadFile = File(...), user_id: str = Depends(get_current_user_id)):
	"""
	Scan a receipt image using Tesseract OCR.
	Extracts vendor name, amount, date, and guesses category.
	"""
	print(f"\n>>> SCAN RECEIPT CALLED - File: {file.filename}, User: {user_id}")
	try:
		# Validate file type
		allowed_types = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}
		if file.content_type not in allowed_types:
			raise HTTPException(
				status_code=400,
				detail=f"Invalid file type. Allowed: JPEG, PNG, PDF. Got: {file.content_type}"
			)
		
		print(f"File type OK: {file.content_type}")
		
		# Read file
		contents = await file.read()
		print(f"File size: {len(contents)} bytes")
		
		image = Image.open(io.BytesIO(contents))
		print(f"Image size: {image.size}, Format: {image.format}")
		
		# Preprocess image for better OCR accuracy
		# Convert to grayscale
		if image.mode != 'L':
			image = image.convert('L')
		
		# Apply additional preprocessing for better handwriting recognition
		from PIL import ImageFilter, ImageEnhance, ImageOps
		
		# Resize if image is very small (improves OCR accuracy)
		if image.width < 300 or image.height < 300:
			scale_factor = max(300 / image.width, 300 / image.height)
			new_size = (int(image.width * scale_factor), int(image.height * scale_factor))
			image = image.resize(new_size, Image.Resampling.LANCZOS)
			print(f"Image resized to {new_size}")
		
		# Apply slight blur to reduce noise FIRST (before contrast)
		image = image.filter(ImageFilter.GaussianBlur(radius=0.3))
		
		# Increase contrast - critical for handwritten text visibility
		enhancer = ImageEnhance.Contrast(image)
		image = enhancer.enhance(3.5)  # Increased to 3.5x for better handwriting clarity
		
		# Enhance brightness for faded/light ink
		enhancer = ImageEnhance.Brightness(image)
		image = enhancer.enhance(1.2)  # Increased to 1.2 for better visibility
		
		# Enhance sharpness for crisp text edges (after contrast/brightness)
		enhancer = ImageEnhance.Sharpness(image)
		image = enhancer.enhance(2.5)  # Slightly reduced to prevent over-sharpening
		
		# Apply a small median filter to clean up noise while preserving edges
		image = image.filter(ImageFilter.MedianFilter(size=3))
		
		# Optional: Apply adaptive histogram equalization-like effect
		# by normalizing the image distribution
		img_array = numpy.array(image)
		p2, p98 = numpy.percentile(img_array, (2, 98))
		img_array = numpy.clip((img_array - p2) / (p98 - p2) * 255, 0, 255).astype(numpy.uint8)
		image = Image.fromarray(img_array)
		print(f"Applied adaptive normalization for better contrast")
		
		# Extract text using Tesseract OCR with optimized settings
		try:
			# Use PSM (Page Segmentation Mode) 6 for mixed text blocks
			# Use OEM (OCR Engine Mode) 3 for legacy + LSTM (better for handwriting)
			extracted_text = pytesseract.image_to_string(
				image,
				config='--psm 6 --oem 3'
			)
			print(f"OCR completed")
			print(f">>> RAW OCR TEXT:\n{extracted_text}\n>>> END RAW TEXT")
		except Exception as e:
			print(f"OCR ERROR: {str(e)}")
			raise HTTPException(
				status_code=500,
				detail=f"OCR processing failed. Ensure Tesseract is installed: {str(e)}"
			)
		
		if not extracted_text or not extracted_text.strip():
			raise HTTPException(
				status_code=400,
				detail="Could not extract any text from image. Please ensure receipt is clear and readable."
			)
		
		# Parse extracted text to get structured data
		receipt_data = _extract_receipt_data(extracted_text)
		
		# DEBUG: Log what was extracted
		print(f"\n=== OCR DEBUG ===")
		print(f"Extracted Text:\n{extracted_text}")
		print(f"\nParsed Data: {receipt_data}")
		print(f"=== END DEBUG ===\n")
		
		return {
			"success": True,
			"extracted_text": extracted_text,
			"parsed_data": {
				"vendor": receipt_data["vendor"],
				"amount": receipt_data["amount"],
				"date": receipt_data["date"],
				"category": receipt_data["category"]
			}
		}
	
	except HTTPException:
		raise
	except Exception as exc:  # pragma: no cover - runtime guard
		raise HTTPException(status_code=500, detail=f"Failed to process receipt: {str(exc)}") from exc