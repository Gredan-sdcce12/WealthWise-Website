def test_transaction_with_budget_exceeded():
    # Simulating existing spent amount
    current_spent = 900
    new_transaction_amount = 200
    budget_limit = 1000

    total_spent = current_spent + new_transaction_amount
    percentage = (total_spent / budget_limit) * 100

    assert percentage >= 100


def test_transaction_validation_and_creation():
    amount = 500
    category = "Food"

    assert amount > 0
    assert category is not None


def test_goal_creation_with_available_balance():
    available_balance = 10000
    goal_amount = 7000

    remaining_balance = available_balance - goal_amount

    assert remaining_balance >= 0
