import asyncio
import traceback
from sqlalchemy.orm import configure_mappers
import app.models
from app.database import AsyncSessionLocal
from app.services.auth_service import authenticate_with_firebase

async def main():
    try:
        configure_mappers()
        print("MAPPERS OK")
        async with AsyncSessionLocal() as db:
            user, is_new = await authenticate_with_firebase(db, 'dev_1234567890')
            print("USER OK:", user.id)
    except Exception as e:
        with open("error.txt", "w", encoding="utf-8") as f:
            traceback.print_exc(file=f)

asyncio.run(main())
