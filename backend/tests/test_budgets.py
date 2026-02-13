# def test_budget_warning_triggered():
#     spent = 900
#     new_amount = 200
#     budget = 1000

#     percentage = ((spent + new_amount) / budget) * 100
#     assert percentage >= 100

def get_budget_status(spent, budget):
    percentage = (spent / budget) * 100

    if percentage >= 100:
        return "Exceeded"
    elif percentage >= 80:
        return "Near Limit"
    else:
        return "Safe"


def test_budget_status_safe():
    assert get_budget_status(500, 1000) == "Safe"


def test_budget_status_near_limit():
    assert get_budget_status(850, 1000) == "Near Limit"


def test_budget_status_exceeded():
    assert get_budget_status(1000, 1000) == "Exceeded"

