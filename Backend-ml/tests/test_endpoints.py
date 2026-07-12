from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_analyze_maintenance():
    payload = {
        "description": "The laptop screen is flickering and showing green vertical lines.",
        "asset": {
            "name": "MacBook Pro 16",
            "categoryId": {"name": "Laptops"},
            "condition": "Good",
            "manufacturer": "Apple",
            "modelNumber": "M1 Max"
        }
    }
    res = client.post("/api/v1/analyze-maintenance", json=payload)
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    data = json_data["data"]
    assert "recommendedPriority" in data
    assert "probableCauses" in data
    assert "suggestedActions" in data
    assert "suggestedSpareParts" in data

def test_asset_health():
    payload = {
        "asset": {
            "name": "Dell UltraSharp 27",
            "condition": "Fair",
            "acquisitionDate": "2024-01-15T00:00:00.000Z",
            "status": "Allocated"
        },
        "history": {
            "allocations": [{}, {}],
            "maintenance": [{"description": "Loose HDMI socket"}],
            "bookings": []
        }
    }
    res = client.post("/api/v1/asset-health", json=payload)
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    data = json_data["data"]
    assert "healthScore" in data
    assert "conditionSummary" in data
    assert "lifeExpectancy" in data
    assert "maintenancePlan" in data

def test_predict_maintenance():
    payload = {
        "asset": {
            "name": "Dell UltraSharp 27",
            "condition": "Fair",
            "acquisitionDate": "2024-01-15T00:00:00.000Z",
            "status": "Allocated"
        },
        "history": {
            "allocations": [{}, {}],
            "maintenance": [{"description": "Loose HDMI socket"}],
            "bookings": []
        }
    }
    res = client.post("/api/v1/predict-maintenance", json=payload)
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    data = json_data["data"]
    assert "nextMaintenanceDate" in data
    assert "failureProbability" in data
    assert "reasoning" in data

def test_audit_chat():
    payload = {
        "message": "List active audit cycles",
        "history": [],
        "user": {
            "id": "user_id_123",
            "name": "Sarah Auditor",
            "role": "asset_manager"
        }
    }
    res = client.post("/api/v1/audit-chat", json=payload)
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    assert "reply" in json_data
    assert "actions" in json_data
