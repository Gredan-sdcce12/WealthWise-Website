from fastapi import APIRouter, Depends, Query

from auth import get_current_user_id
from database import get_db_connection
from services.prediction_service import (
    detect_anomaly,
    predict_next_month_expense,
    savings_projection,
)


router = APIRouter(prefix="/reports/insights", tags=["reports"])


def _format_month_label(year, month):
    return f"{int(year):04d}-{int(month):02d}"


@router.get("/summary")
def get_ai_insights_summary(
    year: int = Query(None),
    month: int = Query(None),
    user_id: str = Depends(get_current_user_id),
):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            where_clause = "user_id = %s AND txn_type = 'expense'"
            expense_params = [user_id]

            if year and month:
                where_clause += """
                    AND (
                        EXTRACT(YEAR FROM txn_date)::INTEGER < %s
                        OR (
                            EXTRACT(YEAR FROM txn_date)::INTEGER = %s
                            AND EXTRACT(MONTH FROM txn_date)::INTEGER <= %s
                        )
                    )
                """
                expense_params.extend([year, year, month])

            cur.execute(
                f"""
                SELECT
                    EXTRACT(YEAR FROM txn_date)::INTEGER as year,
                    EXTRACT(MONTH FROM txn_date)::INTEGER as month,
                    COALESCE(SUM(amount), 0) as total
                FROM transactions
                WHERE {where_clause}
                GROUP BY EXTRACT(YEAR FROM txn_date), EXTRACT(MONTH FROM txn_date)
                ORDER BY EXTRACT(YEAR FROM txn_date), EXTRACT(MONTH FROM txn_date);
                """,
                tuple(expense_params),
            )
            expense_rows = cur.fetchall()

            monthly_expenses = []
            expenses = []
            for row in expense_rows:
                month_label = _format_month_label(row[0], row[1])
                amount = float(row[2])
                monthly_expenses.append({"month": month_label, "expense": round(amount, 2)})
                expenses.append(amount)

            months = list(range(1, len(expenses) + 1))
            average_expense = sum(expenses) / len(expenses) if expenses else 0.0
            latest_expense = expenses[-1] if expenses else 0.0
            past_expenses = expenses[:-1] if len(expenses) > 1 else expenses

            next_month_prediction = predict_next_month_expense(months, expenses)
            anomaly_flag = detect_anomaly(past_expenses, latest_expense)
            anomaly_threshold = average_expense * 1.8 if average_expense > 0 else 0.0

            income_where_clause = "user_id = %s"
            income_params = [user_id]

            if year and month:
                income_where_clause += " AND (year < %s OR (year = %s AND month <= %s))"
                income_params.extend([year, year, month])

            cur.execute(
                f"""
                SELECT year, month, COALESCE(SUM(amount), 0) as total
                FROM incomes
                WHERE {income_where_clause}
                GROUP BY year, month
                ORDER BY year, month;
                """,
                tuple(income_params),
            )
            income_rows = cur.fetchall()
            income_values = [float(row[2]) for row in income_rows]
            average_income = sum(income_values) / len(income_values) if income_values else 0.0

            projected_monthly_savings = average_income - average_expense
            projected_savings_6_months = savings_projection(average_income, expenses, months=6)

            return {
                "monthly_expenses": monthly_expenses,
                "spending_forecast": {
                    "predicted_next_month": round(next_month_prediction, 2),
                    "average_monthly_expense": round(average_expense, 2),
                },
                "anomaly_detection": {
                    "latest_month_expense": round(latest_expense, 2),
                    "average_expense": round(average_expense, 2),
                    "threshold": round(anomaly_threshold, 2),
                    "is_anomaly": anomaly_flag,
                },
                "savings_projection": {
                    "average_income": round(average_income, 2),
                    "average_expense": round(average_expense, 2),
                    "projected_monthly_savings": round(projected_monthly_savings, 2),
                    "projected_savings_6_months": round(projected_savings_6_months, 2),
                },
            }
    finally:
        conn.close()
