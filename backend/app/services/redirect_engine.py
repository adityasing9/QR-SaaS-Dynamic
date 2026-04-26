import random
from datetime import datetime
from ..models.models import Link, Rule, ABTest

def process_redirect(link: Link, request_data: dict) -> str:
    """
    Core logic for determining the target URL based on rules and A/B testing.
    """
    
    # 1. Check Rules (Highest priority first)
    rules = sorted(link.rules, key=lambda x: x.priority, reverse=True)
    for rule in rules:
        if rule.rule_type == "country":
            if request_data.get("country") == rule.rule_value:
                return rule.target_url
        elif rule.rule_type == "device":
            if request_data.get("device") == rule.rule_value:
                return rule.target_url
        elif rule.rule_type == "time":
            # Example: rule_value "09:00-17:00"
            try:
                now = datetime.now().time()
                start, end = rule.rule_value.split("-")
                start_time = datetime.strptime(start, "%H:%M").time()
                end_time = datetime.strptime(end, "%H:%M").time()
                if start_time <= now <= end_time:
                    return rule.target_url
            except:
                continue

    # 2. Check A/B Testing
    if link.ab_tests:
        test = link.ab_tests[0] # Assuming one A/B test per link
        if random.random() < test.ratio_a:
            return test.url_a
        else:
            return test.url_b

    # 3. Default Redirect
    return link.original_url
