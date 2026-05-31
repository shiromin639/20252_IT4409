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
    
    # VNPay Sandbox Configuration
    VNPAY_TMN_CODE: str = "TMM_CODE"
    VNPAY_HASH_SECRET: str = "SECRET"
    VNPAY_RETURN_URL: str = "http://localhost:5173/payment/vnpay/return"
    VNPAY_PAYMENT_URL: str = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"

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
