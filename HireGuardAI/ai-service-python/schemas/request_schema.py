"""
Pydantic Request Schema for POST /predict endpoint.
"""
from typing import Optional
from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    """
    Input schema for analyzing job descriptions and recruiter metadata for fraud signals.
    """
    jobDescription: str = Field(
        ...,
        min_length=10,
        description="The full text of the job description or recruiting email."
    )
    companyName: Optional[str] = Field(
        default="",
        description="Optional name of the hiring employer or company."
    )
    recruiterEmail: Optional[str] = Field(
        default="",
        description="Optional contact email address provided by the recruiter."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "jobDescription": "Immediate hiring! Earn $85/hour for basic data entry from home. Must wire $150 upfront for laptop processing fee via Western Union.",
                "companyName": "Global Career Solutions LLC",
                "recruiterEmail": "hiring-desk-urgent@gmail.com"
            }
        }
