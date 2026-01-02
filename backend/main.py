"""FastAPI entrypoint for WealthWise backend."""

from fastapi import FastAPI, HTTPException

from database import get_db_connection


app = FastAPI(title="WealthWise Backend")


@app.get("/")
def read_root():
	"""Lightweight root endpoint to verify server is running."""
	return {"status": "ok"}


@app.get("/health/db")
def health_check_db():
	"""Health check that validates database connectivity."""
	try:
		conn = get_db_connection()
		with conn.cursor() as cur:
			cur.execute("SELECT 1;")
			cur.fetchone()
		conn.close()
		return {"status": "ok", "db": "ok"}
	except Exception as exc:  # pragma: no cover - simple runtime check
		raise HTTPException(status_code=500, detail=f"DB check failed: {exc}") from exc


if __name__ == "__main__":
	# For local runs without using `uvicorn main:app --reload`
	import uvicorn

	uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
