"""Generate and validate unique transaction codes."""

import random
import string

VALID_CHARS = string.ascii_letters + string.digits
EXCLUDED = set("OoIi01")
ALLOWED_CHARS = "".join(c for c in VALID_CHARS if c not in EXCLUDED)


def generate_code() -> str:
    """Generate a random 4-character alphanumeric code excluding O, I, 0, 1."""
    return "".join(random.choice(ALLOWED_CHARS) for _ in range(4))
