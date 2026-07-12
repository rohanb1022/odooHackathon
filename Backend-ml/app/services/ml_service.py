import os
import json
import re
from typing import Dict, Any, List
import google.generativeai as genai

# Setup Gemini SDK
api_key = os.getenv("GEMINI_API_KEY")
gemini_enabled = False
if api_key and api_key.strip():
    try:
        genai.configure(api_key=api_key.strip())
        gemini_enabled = True
    except Exception as e:
        print(f"⚠️ Error configuring Gemini SDK: {e}")

def get_gemini_model():
    # Use gemini-3.5-flash as it is highly efficient and supports structured generation
    return genai.GenerativeModel("gemini-3.5-flash")

async def call_gemini_json(prompt: str, system_instruction: str = "") -> Dict[str, Any]:
    """Helper to query Gemini and parse JSON response"""
    if not gemini_enabled:
        raise ValueError("Gemini API not configured")
        
    model = genai.GenerativeModel(
        model_name="gemini-3.5-flash",
        system_instruction=system_instruction
    )
    
    # Configure generation to enforce JSON output
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    # Parse the response text
    text = response.text.strip()
    return json.loads(text)

async def analyze_maintenance_request(description: str, asset: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyzes asset issue descriptions, predicting priority, root causes,
    suggested fix actions, and spare parts.
    """
    if gemini_enabled:
        try:
            system_instruction = (
                "You are an expert enterprise hardware technician and operations analyst. "
                "Analyze the asset details and the issue description. Return a JSON object with: "
                "1. 'recommendedPriority': 'Low' | 'Medium' | 'High' | 'Critical'\n"
                "2. 'probableCauses': Array of strings listing likely causes.\n"
                "3. 'suggestedActions': Markdown formatted list of steps a technician should perform.\n"
                "4. 'suggestedSpareParts': Array of strings representing spare parts or tools needed."
            )
            prompt = (
                f"Asset Details:\n"
                f"- Name: {asset.get('name')}\n"
                f"- Category: {asset.get('categoryId', {}).get('name', 'Unknown')}\n"
                f"- Condition: {asset.get('condition')}\n"
                f"- Manufacturer/Model: {asset.get('manufacturer', 'Unknown')} / {asset.get('modelNumber', 'Unknown')}\n\n"
                f"Maintenance Issue Description:\n"
                f"\"{description}\"\n"
            )
            
            result = await call_gemini_json(prompt, system_instruction)
            return result
        except Exception as e:
            print(f"⚠️ Gemini analyze_maintenance failed, using fallback. Error: {e}")
            
    # Fallback / Mock logic (rule-based)
    desc_lower = description.lower()
    priority = "Medium"
    causes = ["General wear and tear"]
    actions = "1. Inspect the physical asset for damage.\n2. Run diagnostics test.\n3. Verify connection ports."
    parts = []

    if any(k in desc_lower for k in ["broken", "shattered", "crack", "damage", "dropped"]):
        priority = "High"
        causes = ["Physical impact / accidental damage", "Screen or casing compromise"]
        actions = "1. Disassemble screen bezel/case.\n2. Replace damaged screen/housing.\n3. Test display output and touch responsiveness."
        parts = ["Replacement LCD/Glass Panel", "Housing Adhesive", "Precision Tool Set"]
    elif any(k in desc_lower for k in ["battery", "charge", "power", "turn on", "shutdown"]):
        priority = "Critical" if "smoke" in desc_lower or "fire" in desc_lower else "High"
        causes = ["Battery degradation", "Faulty power delivery", "Charging port debris/failure"]
        actions = "1. Test voltage input/output.\n2. Calibrate battery levels.\n3. Clean charging socket.\n4. Swap battery module if health is below 80%."
        parts = ["Lithium-Ion Battery Cell", "USB-C Daughterboard", "Multimeter Tool"]
    elif any(k in desc_lower for k in ["slow", "lag", "freeze", "crash", "virus", "os", "software"]):
        priority = "Low"
        causes = ["High memory usage / cache accumulation", "Outdated firmware/OS version", "Background software collision"]
        actions = "1. Clean browser history and temporary directories.\n2. Run a full security scan.\n3. Perform system update.\n4. Reset to factory settings if issue persists."
        parts = ["External Diagnostic USB Boot Drive"]
    elif any(k in desc_lower for k in ["flicker", "display", "screen", "black", "line"]):
        priority = "High"
        causes = ["Loose display flex ribbon cable", "GPU driver discrepancy", "LED backlighting failure"]
        actions = "1. Re-seat display flex cable connector.\n2. Re-flash graphics driver.\n3. Perform hardware pixel diagnostic."
        parts = ["Display Ribbon Flex Cable", "Internal Adhesive"]
    elif any(k in desc_lower for k in ["keyboard", "key", "press", "trackpad", "mouse"]):
        priority = "Medium"
        causes = ["Debris underneath keycaps", "Connector cable decay", "Liquid spill/residue"]
        actions = "1. Clean keyboard using compressed air.\n2. Test key registry maps.\n3. Replace keyboard array if individual key mechanisms are broken."
        parts = ["Replacement Chiclet Keyboard Array", "Compressed Air Can"]

    return {
        "recommendedPriority": priority,
        "probableCauses": causes,
        "suggestedActions": actions,
        "suggestedSpareParts": parts
    }

async def calculate_asset_health(asset: Dict[str, Any], history: Dict[str, Any]) -> Dict[str, Any]:
    """
    Estimates health index score (0-100), summarizes condition status,
    and proposes a maintenance routine schedule.
    """
    if gemini_enabled:
        try:
            system_instruction = (
                "You are an AI reliability engineer. Analyze the asset details and history "
                "(allocations, maintenance requests, bookings). Compute a reliability score (0-100) "
                "where 100 is pristine and 0 is end-of-life. Return a JSON object with:\n"
                "1. 'healthScore': Integer (0-100).\n"
                "2. 'conditionSummary': String summary of why this score was assigned.\n"
                "3. 'lifeExpectancy': String estimation of remaining useful life (e.g. '18 months').\n"
                "4. 'maintenancePlan': Markdown bullet points of a preventative maintenance schedule."
            )
            prompt = (
                f"Asset Details:\n"
                f"- Name: {asset.get('name')}\n"
                f"- Condition: {asset.get('condition')}\n"
                f"- Acquisition Date: {asset.get('acquisitionDate')}\n"
                f"- Current Status: {asset.get('status')}\n\n"
                f"Historical Records:\n"
                f"- Maintenance Logs: {history.get('maintenance', [])}\n"
                f"- Allocation Frequency count: {len(history.get('allocations', []))}\n"
                f"- Booking Frequency count: {len(history.get('bookings', []))}\n"
            )
            result = await call_gemini_json(prompt, system_instruction)
            return result
        except Exception as e:
            print(f"⚠️ Gemini calculate_asset_health failed, using fallback. Error: {e}")

    # Fallback / Mock logic (rule-based)
    condition = asset.get("condition", "Good")
    maint_count = len(history.get("maintenance", []))
    
    # Calculate base health
    health_map = {"Excellent": 95, "Good": 85, "Fair": 65, "Poor": 40, "Damaged": 15}
    health = health_map.get(condition, 80)
    
    # Deduct health based on maintenance count
    health -= (maint_count * 5)
    health = max(5, min(100, health))
    
    # Life expectancy and plan fallbacks
    life_expectancy = "3 - 4 years"
    if health < 30:
        life_expectancy = "1 - 3 months (Critical)"
    elif health < 60:
        life_expectancy = "6 - 12 months"
    elif health < 80:
        life_expectancy = "1.5 - 2 years"
        
    plan = (
        "- **Monthly**: Run internal hardware diagnostic scans.\n"
        "- **Quarterly**: Clean dust ports and inspect battery charging speed.\n"
        "- **Annually**: Full operating system re-indexing and thermal paste replacement."
    )
    if health < 50:
        plan = (
            "- **Immediate**: Schedule hardware checkup with a technician.\n"
            "- **Weekly**: Back up critical data to network storage.\n"
            "- **Monthly**: Calibrate components and review replacement cost ROI."
        )

    return {
        "healthScore": int(health),
        "conditionSummary": f"Asset is currently in {condition} condition with {maint_count} maintenance request logs logged.",
        "lifeExpectancy": life_expectancy,
        "maintenancePlan": plan
    }

async def predict_next_maintenance(asset: Dict[str, Any], history: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predicts next expected service schedule and failure probability.
    """
    if gemini_enabled:
        try:
            system_instruction = (
                "You are an AI predictive maintenance model. Analyze the asset details and historical "
                "logs. Return a JSON object with:\n"
                "1. 'nextMaintenanceDate': YYYY-MM-DD estimation of next service date.\n"
                "2. 'failureProbability': Float (0.0 to 1.0) probability of component breakdown in the next 30 days.\n"
                "3. 'reasoning': String explaining the failure risk factor."
            )
            prompt = (
                f"Asset Details:\n"
                f"- Name: {asset.get('name')}\n"
                f"- Condition: {asset.get('condition')}\n"
                f"- Current Status: {asset.get('status')}\n\n"
                f"Historical Records:\n"
                f"- Maintenance Logs: {history.get('maintenance', [])}\n"
                f"- Allocation History count: {len(history.get('allocations', []))}\n"
            )
            result = await call_gemini_json(prompt, system_instruction)
            return result
        except Exception as e:
            print(f"⚠️ Gemini predict_next_maintenance failed, using fallback. Error: {e}")

    # Fallback / Mock logic (rule-based)
    condition = asset.get("condition", "Good")
    maint_count = len(history.get("maintenance", []))
    
    import datetime
    today = datetime.date.today()
    
    if condition == "Damaged":
        days_to_maint = 2
        fail_prob = 0.95
        reason = "Asset is currently flagged as physically Damaged. Immediate breakdown risk is extremely high."
    elif condition == "Poor":
        days_to_maint = 10
        fail_prob = 0.65
        reason = "Poor condition rating paired with frequent usage. Component fatigue is present."
    elif condition == "Fair":
        days_to_maint = 30
        fail_prob = 0.35
        reason = "Moderate wear visible. Suggestive of standard service intervals."
    else:
        days_to_maint = 90 - (maint_count * 10)
        days_to_maint = max(15, days_to_maint)
        fail_prob = 0.05 + (maint_count * 0.05)
        reason = "Asset is in stable condition. Standard scheduled checkup timeline predicted."
        
    next_date = (today + datetime.timedelta(days=int(days_to_maint))).strftime("%Y-%m-%d")
    
    return {
        "nextMaintenanceDate": next_date,
        "failureProbability": float(min(0.99, fail_prob)),
        "reasoning": reason
    }
