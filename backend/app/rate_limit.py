"""
Rate limiting configuration using slowapi.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize the limiter with the client's IP address
limiter = Limiter(key_func=get_remote_address)
