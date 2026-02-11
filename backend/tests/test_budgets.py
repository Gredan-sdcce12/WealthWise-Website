def test_budget_warning_triggered():
    spent = 900
    new_amount = 200
    budget = 1000

    percentage = ((spent + new_amount) / budget) * 100
    assert percentage >= 100
