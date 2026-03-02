import pandas as pd
from sklearn.linear_model import LinearRegression


def predict_next_month_expense(months, expenses):
    if not months or not expenses or len(months) != len(expenses):
        return 0.0

    if len(months) < 2:
        return round(float(expenses[-1]), 2)

    df = pd.DataFrame({
        "month": months,
        "expense": expenses,
    })

    x_values = df[["month"]]
    y_values = df["expense"]

    model = LinearRegression()
    model.fit(x_values, y_values)

    next_month = [[max(months) + 1]]
    prediction = model.predict(next_month)[0]

    return round(float(prediction), 2)


def detect_anomaly(expenses, new_expense, threshold=1.8):
    if not expenses:
        return False

    avg_expense = sum(expenses) / len(expenses)
    if avg_expense <= 0:
        return False

    return new_expense > avg_expense * threshold


def savings_projection(income, expenses, months=6):
    if not expenses:
        return 0.0

    avg_expense = sum(expenses) / len(expenses)
    monthly_saving = income - avg_expense
    return round(float(monthly_saving * months), 2)
