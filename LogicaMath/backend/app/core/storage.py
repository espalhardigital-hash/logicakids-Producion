import boto3
from botocore.exceptions import ClientError, EndpointConnectionError
import uuid
import os
import aiofiles
import asyncio
from ..config import settings
import logging

logger = logging.getLogger(__name__)

class StorageService:
    def __init__(self):
        self.s3_client = None
        self.bucket_name = settings.S3_BUCKET_NAME
        
        if settings.S3_ACCESS_KEY and settings.S3_SECRET_KEY and settings.S3_ENDPOINT_URL and settings.S3_BUCKET_NAME:
            try:
                from botocore.config import Config
                self.s3_client = boto3.client(
                    's3',
                    endpoint_url=settings.S3_ENDPOINT_URL,
                    aws_access_key_id=settings.S3_ACCESS_KEY,
                    aws_secret_access_key=settings.S3_SECRET_KEY,
                    region_name=settings.S3_REGION or 'us-east-1',
                    config=Config(s3={'addressing_style': 'path'}, signature_version='s3v4')
                )
            except Exception as e:
                logger.error(f"Failed to initialize S3 client: {e}")
                self.s3_client = None

    async def upload_avatar(self, file_contents: bytes, filename: str) -> str:
        """
        Subida tolerante a fallos. Intenta S3, si falla o no está configurado,
        guarda localmente en app/static/avatars.
        """
        ext = filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        
        # Intentar S3
        if self.s3_client:
            try:
                # La subida boto3 síncrona puede bloquear el event loop pero se puede mejorar con asyncio.to_thread si fuera pesado.
                await asyncio.to_thread(
                    self.s3_client.put_object,
                    Bucket=self.bucket_name,
                    Key=unique_filename,
                    Body=file_contents,
                    ContentType=f"image/{ext}"
                )
                base_url = getattr(settings, 'S3_PUBLIC_URL', settings.S3_ENDPOINT_URL) or settings.S3_ENDPOINT_URL
                avatar_url = f"{base_url}/{self.bucket_name}/{unique_filename}"
                return avatar_url
            except (ClientError, EndpointConnectionError) as e:
                logger.warning(f"S3 Upload failed, falling back to local storage. Error: {e}")
            except Exception as e:
                logger.error(f"Unexpected S3 Upload error: {e}")
                
        # Fallback Local
        local_dir = "app/static/avatars"
        os.makedirs(local_dir, exist_ok=True)
        local_path = os.path.join(local_dir, unique_filename)
        
        async with aiofiles.open(local_path, "wb") as f:
            await f.write(file_contents)
            
        avatar_url = f"/static/avatars/{unique_filename}"
        return avatar_url

    async def upload_question_graphic(self, file_contents: bytes, filename: str) -> str:
        """
        Sube una imagen de enunciado a S3 (MinIO) o localmente en el filesystem como fallback.
        """
        ext = filename.split(".")[-1] if "." in filename else "png"
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        unique_filename = f"graphics/{unique_name}"
        
        # Intentar S3
        if self.s3_client:
            try:
                await asyncio.to_thread(
                    self.s3_client.put_object,
                    Bucket=self.bucket_name,
                    Key=unique_filename,
                    Body=file_contents,
                    ContentType=f"image/{ext}"
                )
                base_url = getattr(settings, 'S3_PUBLIC_URL', settings.S3_ENDPOINT_URL) or settings.S3_ENDPOINT_URL
                url = f"{base_url}/{self.bucket_name}/{unique_filename}"
                return url
            except (ClientError, EndpointConnectionError) as e:
                logger.warning(f"S3 Upload failed for graphic, falling back to local storage. Error: {e}")
            except Exception as e:
                logger.error(f"Unexpected S3 Upload error for graphic: {e}")
                
        # Fallback Local
        local_dir = "app/static/graphics"
        os.makedirs(local_dir, exist_ok=True)
        local_path = os.path.join(local_dir, unique_name)
        
        async with aiofiles.open(local_path, "wb") as f:
            await f.write(file_contents)
            
        url = f"/static/graphics/{unique_name}"
        return url

    async def delete_file(self, file_url: str):
        """
        Elimina un archivo del storage. Detecta si es local o de S3.
        No arroja excepciones para que no interrumpa el flujo del llamador (tolerante a fallos).
        """
        if not file_url:
            return

        # 1. Caso archivo local
        if "/static/avatars/" in file_url:
            try:
                filename = file_url.split("/static/avatars/")[-1]
                local_path = os.path.join("app/static/avatars", filename)
                if os.path.exists(local_path):
                    os.remove(local_path)
                    logger.info(f"Local file deleted: {local_path}")
            except Exception as e:
                logger.error(f"Failed to delete local avatar file: {e}")
            return

        if "/static/graphics/" in file_url:
            try:
                filename = file_url.split("/static/graphics/")[-1]
                local_path = os.path.join("app/static/graphics", filename)
                if os.path.exists(local_path):
                    os.remove(local_path)
                    logger.info(f"Local graphic deleted: {local_path}")
            except Exception as e:
                logger.error(f"Failed to delete local graphic file: {e}")
            return

        # 2. Caso S3 / MinIO
        if self.s3_client:
            try:
                # Extraer la key de la URL
                if self.bucket_name in file_url:
                    parts = file_url.split(f"{self.bucket_name}/")
                    key = parts[1] if len(parts) > 1 else file_url
                else:
                    key = file_url.split("/")[-1]

                await asyncio.to_thread(
                    self.s3_client.delete_object,
                    Bucket=self.bucket_name,
                    Key=key
                )
                logger.info(f"S3 file deleted from bucket '{self.bucket_name}': {key}")
            except Exception as e:
                logger.warning(f"S3 Delete failed for file '{file_url}'. Error: {e}")

storage_service = StorageService()
