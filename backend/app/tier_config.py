"""
Centralized tier configuration — single source of truth for all tier limits and features.
"""

TIER_DEFINITIONS = {
    "free": {
        "name": "Free",
        "slug": "free",
        "price_monthly": 0,
        "price_currency": "INR",
        "max_restaurants": 1,
        "max_menus_per_restaurant": 1,
        "features": [
            "Basic QR code digital menu",
            "Single language support",
            "Static menu items (no images)",
            "1 restaurant, 1 menu",
        ],
        "limitations": [
            "No ordering/payment integration",
            "No menu item images",
            "No analytics",
        ],
    },
    "standard": {
        "name": "Standard",
        "slug": "standard",
        "price_monthly": 999,
        "price_currency": "INR",
        "max_restaurants": 3,
        "max_menus_per_restaurant": 3,
        "features": [
            "All Free features",
            "QR code with ordering",
            "Menu with images",
            "Order management system",
            "Employee role management",
            "Basic analytics",
            "Multi-language support (5 languages)",
            "Up to 3 restaurants, 3 menus each",
        ],
        "limitations": [
            "No KDS",
            "No inventory tracking",
            "No marketing automation",
        ],
    },
    "premium": {
        "name": "Premium",
        "slug": "premium",
        "price_monthly": 2499,
        "price_currency": "INR",
        "max_restaurants": -1,
        "max_menus_per_restaurant": -1,
        "features": [
            "All Standard features",
            "Kitchen Display System (KDS)",
            "Basic inventory tracking",
            "Table reservations",
            "Advanced analytics & reporting",
            "Marketing automation (email/SMS)",
            "Customer feedback & ratings",
            "Unlimited restaurants & menus",
            "Priority support",
        ],
        "limitations": [],
    },
}

TIER_ORDER = ["free", "standard", "premium"]


def get_tier_limits(tier_slug: str) -> dict:
    """Get the limits for a specific tier. Defaults to free if unknown."""
    return TIER_DEFINITIONS.get(tier_slug, TIER_DEFINITIONS["free"])
