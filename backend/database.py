
import os

import psycopg
from dotenv import load_dotenv


load_dotenv()


def get_connection():
    """Create a connection to the PostgreSQL database."""

    password = os.getenv("POSTGRES_PASSWORD")

    if not password:
        raise RuntimeError(
            "POSTGRES_PASSWORD is not configured"
        )

    return psycopg.connect(
        host="127.0.0.1",
        port=5434,
        dbname="ai_knowledge",
        user="ai_user",
        password=password,
    )


def check_database_connection():
    """Test the database connection."""

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT current_database(), current_user"
            )

            return cursor.fetchone()
