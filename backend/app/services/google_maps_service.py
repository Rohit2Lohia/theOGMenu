"""
Google Maps service — extract info from a pasted Google Maps URL.
Placeholder for Phase 2 implementation.
"""

import re
from typing import Optional

import httpx


async def extract_place_info_from_url(google_maps_url: str) -> Optional[dict]:
    """
    Extract restaurant information from a Google Maps URL.
    
    Strategy:
    1. Parse the URL to find the Place ID or coordinates
    2. Follow redirects to get the full URL
    3. Scrape available public information
    
    Returns dict with keys: name, address, phone, rating, 
    operating_hours, latitude, longitude, or None if extraction fails.
    """
    if not google_maps_url:
        return None

    try:
        # Follow short-link redirects (e.g., goo.gl/maps/xxx)
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(google_maps_url, timeout=10.0)
            final_url = str(response.url)

        # Try to extract coordinates from URL
        # Pattern: @lat,lng,zoom
        coord_match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', final_url)
        
        result = {
            "source_url": google_maps_url,
            "resolved_url": final_url,
        }

        if coord_match:
            result["latitude"] = float(coord_match.group(1))
            result["longitude"] = float(coord_match.group(2))

        # Try to extract place name from URL
        # Pattern: /place/Place+Name/
        name_match = re.search(r'/place/([^/]+)/', final_url)
        if name_match:
            name = name_match.group(1).replace('+', ' ')
            result["name"] = name

        return result

    except Exception as e:
        print(f"Error extracting place info: {e}")
        return None
