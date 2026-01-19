"""
Migration script to add source column to transactions table
Run this once to add OCR source tracking to the database
"""

import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_migration():
    """Add source column to transactions table"""
    conn_params = {
        "host": os.getenv("DB_HOST"),
        "database": os.getenv("DB_NAME"),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
        "port": os.getenv("DB_PORT", "5432"),
    }
    
    try:
        conn = psycopg2.connect(**conn_params)
        cur = conn.cursor()
        
        print("Running migration: Adding source column to transactions table...")
        
        # Add source column with default value
        cur.execute("""
            ALTER TABLE transactions 
            ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';
        """)
        print("✅ Added source column")
        
        # Add constraint
        try:
            cur.execute("""
                ALTER TABLE transactions 
                ADD CONSTRAINT valid_source CHECK (source IN ('manual', 'ocr'));
            """)
            print("✅ Added constraint for valid source values")
        except psycopg2.Error as e:
            if "already exists" in str(e):
                print("⚠️ Constraint already exists (OK)")
            else:
                raise
        
        # Create index
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);
        """)
        print("✅ Created index on source column")
        
        # Verify
        cur.execute("""
            SELECT COUNT(*) FROM transactions;
        """)
        count = cur.fetchone()[0]
        print(f"✅ Table has {count} transactions")
        
        # Check column definition
        cur.execute("""
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'transactions' AND column_name = 'source';
        """)
        result = cur.fetchone()
        if result:
            print(f"✅ Column definition: {result}")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    run_migration()
