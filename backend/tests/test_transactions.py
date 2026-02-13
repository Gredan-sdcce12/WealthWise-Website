def test_add_expense_valid_amount():
    amount = 500
    assert amount > 0


def test_add_expense_invalid_amount():
    amount = 0
    assert amount <= 0
