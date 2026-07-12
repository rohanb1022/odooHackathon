from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.services.agent_service import chat_agent
from app.services.audit_agent_service import audit_chat_agent
from app.services.ml_service import analyze_maintenance_request, calculate_asset_health, predict_next_maintenance

router = APIRouter()

class Message(BaseModel):
    role: str # 'user' or 'model' / 'assistant'
    content: str

class UserContext(BaseModel):
    id: str
    name: str
    role: str
    departmentId: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []
    user: UserContext

class AnalyzeMaintenanceRequest(BaseModel):
    description: str
    asset: Dict[str, Any]

class AssetHistory(BaseModel):
    allocations: List[Dict[str, Any]] = []
    maintenance: List[Dict[str, Any]] = []
    bookings: List[Dict[str, Any]] = []

class AssetHealthRequest(BaseModel):
    asset: Dict[str, Any]
    history: AssetHistory

# Endpoints
@router.post("/chat")
async def chat(payload: ChatRequest, authorization: Optional[str] = Header(None)):
    """
    Exposes interactive chat with Gemini AI Agent, enabling function-calling (tools)
    to query/update the Node.js backend.
    """
    try:
        # Extract JWT token if present
        token = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            
        reply, actions = await chat_agent(
            message=payload.message,
            history=[{"role": m.role, "content": m.content} for m in payload.history],
            user_context=payload.user.model_dump(),
            user_token=token
        )
        return {"success": True, "reply": reply, "actions": actions}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI Chat Agent Error: {str(e)}")

@router.post("/analyze-maintenance")
async def analyze_maintenance(payload: AnalyzeMaintenanceRequest):
    """
    Analyzes asset issue descriptions, predicting priority, root causes,
    suggested fix actions, and spare parts.
    """
    try:
        result = await analyze_maintenance_request(payload.description, payload.asset)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Maintenance Analysis Error: {str(e)}")

@router.post("/asset-health")
async def asset_health(payload: AssetHealthRequest):
    """
    Estimates health index score (0-100), summarizes condition status,
    and proposes a maintenance routine schedule.
    """
    try:
        result = await calculate_asset_health(payload.asset, payload.history.model_dump())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Asset Health Evaluation Error: {str(e)}")

@router.post("/predict-maintenance")
async def predict_maintenance(payload: AssetHealthRequest):
    """
    Predicts next expected service schedule and failure probability.
    """
    try:
        result = await predict_next_maintenance(payload.asset, payload.history.model_dump())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failure Prediction Error: {str(e)}")

@router.post("/audit-chat")
async def audit_chat(payload: ChatRequest, authorization: Optional[str] = Header(None)):
    """
    Exposes interactive chat with the Audit & Compliance AI Agent, enabling function-calling
    to manage audit cycles, verify asset audits, log transfers, and check reports.
    """
    try:
        token = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            
        reply, actions = await audit_chat_agent(
            message=payload.message,
            history=[{"role": m.role, "content": m.content} for m in payload.history],
            user_context=payload.user.model_dump(),
            user_token=token
        )
        return {"success": True, "reply": reply, "actions": actions}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI Audit Agent Error: {str(e)}")
