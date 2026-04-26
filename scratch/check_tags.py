import asyncio
from app.database import engine
from app.models.item import Item
from sqlalchemy import select

async def check_tags():
    async with engine.connect() as conn:
        result = await conn.execute(select(Item))
        items = result.fetchall()
        for item in items:
            print(f"Item: {item.name}, Tags: {item.tags}, Type: {type(item.tags)}")

if __name__ == "__main__":
    asyncio.run(check_tags())
