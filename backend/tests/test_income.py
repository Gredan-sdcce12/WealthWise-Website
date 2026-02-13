def validate_income(amount):
    return amount > 0

def test_income_validation():
    assert validate_income(500) == True
