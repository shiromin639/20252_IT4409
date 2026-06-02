from pydantic import PostgresDsn, computed_field, HttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="./.env", env_ignore_empty=True, extra="ignore"
    )

    PROJECT_NAME: str
    SENTRY_DSN: HttpUrl | None = None
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""
    
    REDIS_URL: str | None = None
    
    # VNPay Sandbox Configuration
    VNPAY_TMN_CODE: str
    VNPAY_HASH_SECRET: str
    VNPAY_RETURN_URL: str
    VNPAY_PAYMENT_URL: str

    # SMTP Configuration
    SMTP_HOST: str = "sandbox.smtp.mailtrap.io"
    SMTP_PORT: int = 2525
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@techlap.local"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )


settings = Settings()  # type: ignore

if not settings.VNPAY_TMN_CODE:
    raise ValueError("VNPAY_TMN_CODE environment variable is empty or not set!")
if not settings.VNPAY_HASH_SECRET:
    raise ValueError("VNPAY_HASH_SECRET environment variable is empty or not set!")

print(f"Loaded VNPay configuration:")
print(f" - TMN_CODE: {settings.VNPAY_TMN_CODE}")
print(f" - RETURN_URL: {settings.VNPAY_RETURN_URL}")
print(f" - HASH_SECRET: {'*' * len(settings.VNPAY_HASH_SECRET)}")
