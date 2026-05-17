from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    DATABASE_URL: Optional[str] = Field(None, description="Database connection URL")
    GOOGLE_API_KEY: Optional[str] = Field(None, description="Google Gemini API Key")
    SECRET_KEY: Optional[str] = Field(None, description="JWT Secret Key")
    JWT_ALGORITHM: str = Field("HS256", description="JWT Algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(10080, description="Access Token Expire Minutes")
    
    # S3 / MinIO Configuration
    S3_ACCESS_KEY: Optional[str] = Field(None, description="S3 Access Key")
    S3_SECRET_KEY: Optional[str] = Field(None, description="S3 Secret Key")
    S3_ENDPOINT_URL: Optional[str] = Field(None, description="S3 Endpoint URL")
    S3_BUCKET_NAME: Optional[str] = Field(None, description="S3 Bucket Name")
    S3_REGION: str = Field("us-east-1", description="S3 Region")
    
    # Security/CORS
    ENABLE_SECURITY_HEADERS: bool = Field(True, description="Enable Security Headers")
    ALLOWED_ORIGINS: str = Field("*", description="Allowed CORS Origins")

settings = Settings()
