from pydantic import BaseModel

class OnboardingRequest(BaseModel):
    interests: list[str]


class OnboardingResponse(BaseModel):
    message: str