"""Run the user profiles table setup migration."""

import psycopg2
from database import get_db_connection


def run_migration():
    """Execute the SETUP_PROFILES.sql script."""
    conn = get_db_connection()
    try:
        with open("SETUP_PROFILES.sql", "r", encoding="utf-8") as f:
            sql = f.read()

        with conn.cursor() as cur:
            cur.execute(sql)
            conn.commit()
            print("✓ User profiles table created successfully!")

    except FileNotFoundError:
        print("ERROR: SETUP_PROFILES.sql file not found.")
    except psycopg2.Error as e:
        print(f"ERROR: Database error occurred: {e}")
        conn.rollback()
    except Exception as e:
        print(f"ERROR: {e}")
        conn.rollback()
    finally:
        conn.close()


if __name__ == "__main__":
    print("Running user profiles migration...")
    run_migration()
