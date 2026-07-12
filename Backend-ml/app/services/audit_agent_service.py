import os
import json
import httpx
from typing import List, Dict, Any, Tuple
import google.generativeai as genai
import google.ai.generativelanguage as glm

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000/api/v1")
api_key = os.getenv("GEMINI_API_KEY")
gemini_enabled = False

if api_key and api_key.strip():
    try:
        genai.configure(api_key=api_key.strip())
        gemini_enabled = True
    except Exception as e:
        print(f"⚠️ Error configuring Gemini in audit agent: {e}")

async def audit_chat_agent(
    message: str,
    history: List[Dict[str, str]],
    user_context: Dict[str, Any],
    user_token: str = None
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Agentic conversation loop for Audits, Compliance, Transfers, and Reports.
    Provides tools for full automation of stock auditing and compliance checks.
    """
    actions_executed = []

    if not gemini_enabled:
        fallback_reply = (
            f"Hello {user_context.get('name')}, the specialized Audit & Compliance AI Agent is active, "
            f"but Gemini is currently offline (API key not set). Please provide GEMINI_API_KEY to enable stock auditing automation."
        )
        return fallback_reply, []

    headers = {}
    if user_token:
        headers["Authorization"] = f"Bearer {user_token}"

    async with httpx.AsyncClient(headers=headers, timeout=30.0) as client:
        
        # ─── Define Audit & Compliance Tools ───────────────────────────────────
        
        async def list_audit_cycles() -> Dict[str, Any]:
            """
            Retrieve all past and active physical inventory audit cycles.
            """
            try:
                res = await client.get(f"{BACKEND_URL}/audit-cycles")
                if res.status_code == 200:
                    return res.json()
                return {"error": f"Failed to retrieve audit cycles: status {res.status_code}"}
            except Exception as e:
                return {"error": f"Connection error: {str(e)}"}

        async def get_audit_cycle_details(cycle_id: str) -> Dict[str, Any]:
            """
            Get full details of a specific audit cycle, including lists of verified and unverified assets.
            
            Args:
                cycle_id: The unique ID of the audit cycle.
            """
            try:
                res = await client.get(f"{BACKEND_URL}/audit-cycles/{cycle_id}")
                if res.status_code == 200:
                    return res.json()
                return {"error": f"Failed to retrieve details: status {res.status_code}"}
            except Exception as e:
                return {"error": f"Connection error: {str(e)}"}

        async def create_audit_cycle(
            title: str,
            scope_type: str,
            date_range_start: str,
            date_range_end: str,
            scope_value: str = None,
            auditor_ids: List[str] = None
        ) -> Dict[str, Any]:
            """
            Create a new physical asset verification audit cycle.
            
            Args:
                title: Title of the audit cycle (e.g. 'Q3 Laptop Stock Verification').
                scope_type: Type of scope matching ('All', 'Category', 'Location', 'Department').
                date_range_start: Starting date in YYYY-MM-DD format.
                date_range_end: Ending date in YYYY-MM-DD format.
                scope_value: Target identifier matching the scope type (e.g. Category ID or Location name) (optional).
                auditor_ids: List of User IDs assigned as auditors (optional).
            """
            try:
                payload = {
                    "title": title,
                    "scopeType": scope_type,
                    "scopeValue": scope_value,
                    "dateRangeStart": date_range_start,
                    "dateRangeEnd": date_range_end,
                    "auditorIds": auditor_ids or []
                }
                res = await client.post(f"{BACKEND_URL}/audit-cycles", json=payload)
                if res.status_code in (200, 201):
                    actions_executed.append({
                        "type": "create_audit_cycle",
                        "success": True,
                        "title": title,
                        "scopeType": scope_type
                    })
                    return res.json()
                return {"error": f"Failed to create audit cycle: status {res.status_code}", "detail": res.text}
            except Exception as e:
                return {"error": f"Process crash: {str(e)}"}

        async def verify_asset_audit(
            cycle_id: str,
            asset_tag: str,
            result: str,
            notes: str = None
        ) -> Dict[str, Any]:
            """
            Verify the physical presence and condition of an asset during an open audit cycle.
            
            Args:
                cycle_id: Unique ID of the active audit cycle.
                asset_tag: Unique tag of the asset (e.g. 'AF-0001').
                result: Outcome of physical verification ('Verified', 'Missing', 'Damaged').
                notes: Verification notes or discrepancy description (optional).
            """
            try:
                # 1. Lookup asset by tag to get asset ID
                asset_res = await client.get(f"{BACKEND_URL}/assets", params={"assetTag": asset_tag})
                if asset_res.status_code != 200:
                    return {"error": "Asset lookup failed"}
                assets = asset_res.json().get("assets", [])
                if not assets:
                    return {"error": f"Asset '{asset_tag}' not found"}
                asset_id = assets[0]["_id"]

                # 2. Record verification
                payload = {
                    "assetId": asset_id,
                    "result": result,
                    "notes": notes
                }
                res = await client.post(f"{BACKEND_URL}/audit-cycles/{cycle_id}/verify", json=payload)
                if res.status_code in (200, 201):
                    actions_executed.append({
                        "type": "verify_asset_audit",
                        "success": True,
                        "cycleId": cycle_id,
                        "assetTag": asset_tag,
                        "result": result
                    })
                    return res.json()
                return {"error": f"Failed to record verification: status {res.status_code}", "detail": res.text}
            except Exception as e:
                return {"error": f"Verification error: {str(e)}"}

        async def close_audit_cycle(cycle_id: str) -> Dict[str, Any]:
            """
            Close an open audit cycle, finalizing reports and compiling discrepancies.
            
            Args:
                cycle_id: Unique ID of the audit cycle to close.
            """
            try:
                res = await client.post(f"{BACKEND_URL}/audit-cycles/{cycle_id}/close", json={})
                if res.status_code in (200, 201):
                    actions_executed.append({
                        "type": "close_audit_cycle",
                        "success": True,
                        "cycleId": cycle_id
                    })
                    return res.json()
                return {"error": f"Failed to close audit cycle: status {res.status_code}"}
            except Exception as e:
                return {"error": f"Close audit cycle error: {str(e)}"}

        async def list_transfer_requests() -> Dict[str, Any]:
            """
            Retrieve all asset transfer requests across departments or locations.
            """
            try:
                res = await client.get(f"{BACKEND_URL}/transfer-requests")
                if res.status_code == 200:
                    return res.json()
                return {"error": f"Failed to retrieve transfer requests: status {res.status_code}"}
            except Exception as e:
                return {"error": f"Connection error: {str(e)}"}

        async def create_transfer_request(
            asset_tag: str,
            target_location: str,
            target_department_id: str = None
        ) -> Dict[str, Any]:
            """
            Create a request to transfer an asset to a new location or department.
            
            Args:
                asset_tag: Unique tag of the asset to transfer (e.g. 'AF-0001').
                target_location: Target destination location (e.g. 'Building B, Floor 2').
                target_department_id: Target department unique ID (optional).
            """
            try:
                # 1. Lookup asset by tag
                asset_res = await client.get(f"{BACKEND_URL}/assets", params={"assetTag": asset_tag})
                if asset_res.status_code != 200:
                    return {"error": "Asset lookup failed"}
                assets = asset_res.json().get("assets", [])
                if not assets:
                    return {"error": f"Asset '{asset_tag}' not found"}
                asset_id = assets[0]["_id"]

                # 2. Request transfer
                payload = {
                    "assetId": asset_id,
                    "targetLocation": target_location
                }
                if target_department_id:
                    payload["targetDepartmentId"] = target_department_id

                res = await client.post(f"{BACKEND_URL}/transfer-requests", json=payload)
                if res.status_code in (200, 201):
                    actions_executed.append({
                        "type": "create_transfer_request",
                        "success": True,
                        "assetTag": asset_tag,
                        "targetLocation": target_location
                    })
                    return res.json()
                return {"error": f"Failed to request transfer: status {res.status_code}", "detail": res.text}
            except Exception as e:
                return {"error": f"Transfer creation crash: {str(e)}"}

        async def get_valuation_report() -> Dict[str, Any]:
            """
            Retrieve asset inventory summary data including category valuations, depreciations, and health indices.
            """
            try:
                res = await client.get(f"{BACKEND_URL}/reports/assets")
                if res.status_code == 200:
                    return res.json()
                return {"error": f"Failed to retrieve report: status {res.status_code}"}
            except Exception as e:
                return {"error": f"Connection error: {str(e)}"}

        # Dictionary lookup for tools
        tools_map = {
            "list_audit_cycles": list_audit_cycles,
            "get_audit_cycle_details": get_audit_cycle_details,
            "create_audit_cycle": create_audit_cycle,
            "verify_asset_audit": verify_asset_audit,
            "close_audit_cycle": close_audit_cycle,
            "list_transfer_requests": list_transfer_requests,
            "create_transfer_request": create_transfer_request,
            "get_valuation_report": get_valuation_report
        }
        tools_list = list(tools_map.values())

        # ─── Initialize Agent ──────────────────────────────────────────────────
        
        system_instruction = (
            "You are the AssetFlow Audit & Compliance Copilot, a highly capable agentic assistant. "
            "You assist users in tracking asset audits, starting verification cycles, confirming physical "
            "presence of items, requesting department transfers, and checking valuation summaries.\n"
            f"You are speaking with: {user_context.get('name')} (Role: {user_context.get('role')}, Department: {user_context.get('departmentId')}).\n"
            "Guidelines:\n"
            "1. When performing asset audits, identify active cycles first or verify which cycle you are committing to.\n"
            "2. Execute the appropriate tool when a request implies database queries or mutations. Run them actually.\n"
            "3. Formulate date queries relative to current date if mentioned. The current local time is July 12, 2026.\n"
            "4. Keep your responses clear, compliant, and formatted nicely in Markdown."
        )

        model = genai.GenerativeModel(
            model_name="gemini-3.5-flash",
            tools=tools_list,
            system_instruction=system_instruction
        )

        messages = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            messages.append({
                "role": role,
                "parts": [msg["content"]]
            })
            
        messages.append({
            "role": "user",
            "parts": [message]
        })

        # ─── Execute Generative Loop (Function Calling Dispatcher) ────────────
        
        max_iterations = 8
        for i in range(max_iterations):
            response = model.generate_content(messages)
            
            candidate = response.candidates[0]
            function_calls = getattr(candidate.content, "parts", [])
            function_calls = [p.function_call for p in function_calls if p.function_call]
            
            if not function_calls:
                final_reply = response.text
                return final_reply, actions_executed
                
            messages.append({
                "role": "model",
                "parts": list(candidate.content.parts)
            })
            
            function_response_parts = []
            for fc in function_calls:
                func_name = fc.name
                func_args = dict(fc.args)
                
                if func_name in tools_map:
                    print(f"⚙️ Audit Agent executing tool: {func_name} with args: {func_args}")
                    tool_func = tools_map[func_name]
                    result = await tool_func(**func_args)
                    
                    function_response_parts.append(
                        glm.Part(
                            function_response=glm.FunctionResponse(
                                name=func_name,
                                response={"result": result}
                            )
                        )
                    )
                else:
                    function_response_parts.append(
                        glm.Part(
                            function_response=glm.FunctionResponse(
                                name=func_name,
                                response={"error": f"Tool '{func_name}' is not defined"}
                            )
                        )
                    )
            
            messages.append({
                "role": "function",
                "parts": function_response_parts
            })
            
        return "I processed your audit query, but hit an operations limit. Please break down instructions.", actions_executed
