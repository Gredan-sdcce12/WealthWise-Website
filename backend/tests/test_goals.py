def test_goal_amount_within_balance():
    available_balance = 10000
    goal_amount = 5000

    assert goal_amount <= available_balance
