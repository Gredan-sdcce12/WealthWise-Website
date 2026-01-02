"""Database connection helper for Supabase PostgreSQL."""

import os

import psycopg2
from dotenv import load_dotenv
from psycopg2.extensions import connection as PGConnection


# Load environment variables from a .env file if present.
load_dotenv()


def get_db_connection() -> PGConnection:
	"""Create and return a new psycopg2 connection using env variables."""
	conn_params = {
		"host": os.getenv("DB_HOST"),
		"database": os.getenv("DB_NAME"),
		"user": os.getenv("DB_USER"),
		"password": os.getenv("DB_PASSWORD"),
		"port": os.getenv("DB_PORT", "5432"),
	}

	missing = [key for key, value in conn_params.items() if not value]
	if missing:
		raise RuntimeError(f"Missing database environment variables: {', '.join(missing)}")

	return psycopg2.connect(**conn_params)
