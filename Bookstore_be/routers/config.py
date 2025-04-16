# config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    secret_key: str

    class Config:
        env_file = ".env"

settings = Settings()
print(f"Loaded secret_key: {settings.secret_key}")