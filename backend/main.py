from fastapi import FastAPI, APIRouter
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from core.config import get_settings
from core.logging import setup_logging

setting = get_settings()

app = FastAPI(
    title = "Knova",
    debug = setting.DEBUG,
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc"
)
setup_logging()

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

base_router = APIRouter(prefix="/api/v1")

@app.get("/", response_class=HTMLResponse)
def home():
    return """
    <html>
        <head>
            <title>Knova</title>
        </head>
        <body style="font-family:Arial;text-align:center;margin-top:100px;">
            <h1 style="color:#7393B3;">Knova</h1>
            <h3 style="color:#B2BEB5;">Telemetry Driven Educational Content Recommendation Engine</h3>
            <div>
                <a href="/api/v1/docs"><button style="border-radius:10px; box-shadow:2px 3px rgba(100,100,100,125); margin-right:20px;">API Docs</button></a>
                <a href="/api/v1/health"><button style="border-radius:10px; box-shadow: 2px 3px rgba(100,100,100,125)">Check health</button></a>
            </div>
            </div>
        </body>
    </html>
    """


@base_router.get("/health")
def health_check():
    return {
        "state": "Running..."
    }
        
    
from src.auth.router import router as auth_router
from src.onboarding.route import router as onboarding_router
from src.reference.router import router as ref_router
from src.users.router import router as users_router

base_router.include_router(auth_router, prefix="/auth")
base_router.include_router(onboarding_router)
base_router.include_router(ref_router, prefix="/reference")
base_router.include_router(users_router, prefix="/users")
app.include_router(base_router)