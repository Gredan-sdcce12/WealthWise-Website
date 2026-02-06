import psycopg2
from database import get_db_connection

def run_migration():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        with open('MIGRATION_REMOVE_TIMEZONE.sql', 'r') as f:
            migration_sql = f.read()
        
        cursor.execute(migration_sql)
        conn.commit()
        print("✓ Migration successful: timezone column removed from user_profiles")
        
    except Exception as e:
        conn.rollback()
        print(f"✗ Migration failed: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
