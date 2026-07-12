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
        print(f"⚠️ Error configuring Gemini in agent: {e}")

async def chat_agent(
    message: str,
    history: List[Dict[str, str]],
    user_context: Dict[str, Any],
    user_token: str = None
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Runs an agentic conversational loop with Gemini. Gemini is provided tools (functions)
    which it can invoke. These tools perform HTTP actions against the Express backend
    forwarding the user's JWT credentials.
    """
    actions_executed = []

    if not gemini_enabled:
        # Fallback if Gemini is not configured
        fallback_reply = (
            f"Hi {user_context.get('name')}, Gemini is currently offline (API key not set). "
            f"However, the backend-ml microservice is active! Please configure GEMINI_API_KEY to enable full agentic automation."
        )
        return fallback_reply, []

    headers = {}
    if user_token:
        headers["Authorization"] = f"Bearer {user_token}"

    async with httpx.AsyncClient(headers=headers, timeout=30.0) as client:
        
        # ─── Define Local Tools ───────────────────────────────────────────────
        
        async def list_users(search_query: str = "") -> Dict[str, Any]:
            """
            Search for employees or company users by name or email.
            Use this to find the correct user ID or details before performing allocations.
            
            Args:
                search_query: Search term matching user's name or email (e.g. 'Sarah Connor' or 'sarah@example.com').
            """
            try:
                res = await client.get(f"{BACKEND_URL}/users", params={"search": search_query})
                if res.status_code == 200:
                    return res.json()
                return {"error": f"Backend returned status {res.status_code}", "detail": res.text}
            except Exception as e:
                return {"error": f"Failed to connect to backend: {str(e)}"}

        async def search_assets(query: str = "", status: str = None, category: str = None) -> Dict[str, Any]:
            """
            Search for assets in the inventory using filters or query term.
            
            Args:
                query: Search text matching name, serial number, tag, or location.
                status: Status of the asset ('Available', 'Allocated', 'Under Maintenance').
                category: Category name (e.g. 'Laptops', 'Monitors').
            """
            try:
                params = {}
                if query:
                    params["search"] = query
                if status:
                    params["status"] = status
                if category:
                    params["category"] = category
                res = await client.get(f"{BACKEND_URL}/assets", params=params)
                if res.status_code == 200:
                    return res.json()
                return {"error": f"Backend returned status {res.status_code}", "detail": res.text}
            except Exception as e:
                return {"error": f"Failed to query assets: {str(e)}"}

        async def allocate_asset(asset_tag: str, user_email: str, expected_return_date: str = None, condition_notes: str = None) -> Dict[str, Any]:
            """
            Assign / allocate an asset to an active employee.
            
            Args:
                asset_tag: Unique tag of the asset (e.g. 'AF-0001').
                user_email: Email of the employee receiving the asset.
                expected_return_date: Estimated return date in YYYY-MM-DD format (optional).
                condition_notes: Notes on condition of asset during assignment (optional).
            """
            try:
                # 1. Look up asset ID from tag
                asset_res = await client.get(f"{BACKEND_URL}/assets", params={"assetTag": asset_tag})
                if asset_res.status_code != 200:
                    return {"error": "Failed to look up asset", "detail": asset_res.text}
                
                assets_data = asset_res.json()
                # Field spread: assets list is inside 'assets' top level key
                assets_list = assets_data.get("assets", [])
                if not assets_list:
                    return {"error": f"Asset with tag '{asset_tag}' not found"}
                asset = assets_list[0]
                asset_id = asset.get("_id")
                
                # 2. Look up user ID from email
                user_res = await client.get(f"{BACKEND_URL}/users", params={"search": user_email})
                if user_res.status_code != 200:
                    return {"error": "Failed to look up user", "detail": user_res.text}
                
                users_data = user_res.json()
                users_list = users_data.get("users", [])
                if not users_list:
                    return {"error": f"User with email '{user_email}' not found"}
                user = users_list[0]
                user_id = user.get("_id")
                
                # 3. Create allocation
                payload = {
                    "assetId": asset_id,
                    "allocatedTo": user_id,
                    "expectedReturnDate": expected_return_date,
                    "conditionNotes": condition_notes
                }
                res = await client.post(f"{BACKEND_URL}/allocations", json=payload)
                if res.status_code in (200, 201):
                    actions_executed.append({
                        "type": "allocate_asset",
                        "success": True,
                        "assetTag": asset_tag,
                        "allocatedTo": user.get("name"),
                        "email": user_email
                    })
                    return res.json()
                return {"error": f"Allocation failed: status {res.status_code}", "detail": res.json()}
            except Exception as e:
                return {"error": f"Allocation process crash: {str(e)}"}

        async def return_asset(asset_tag: str, condition_at_return: str = "Good", condition_notes: str = None) -> Dict[str, Any]:
            """
            Confirm the return of an allocated asset, making it available again.
            
            Args:
                asset_tag: Unique tag of the asset (e.g. 'AF-0001').
                condition_at_return: The condition of the asset ('Excellent', 'Good', 'Fair', 'Poor', 'Damaged').
                condition_notes: Descriptive notes regarding the returned asset's state.
            """
            try:
                # Get asset ID
                asset_res = await client.get(f"{BACKEND_URL}/assets", params={"assetTag": asset_tag})
                if asset_res.status_code != 200:
                    return {"error": "Asset lookup failed"}
                assets = asset_res.json().get("assets", [])
                if not assets:
                    return {"error": f"Asset tag '{asset_tag}' not found"}
                asset_id = assets[0]["_id"]
                
                payload = {
                    "assetId": asset_id,
                    "conditionAtReturn": condition_at_return,
                    "conditionNotes": condition_notes
                }
                res = await client.post(f"{BACKEND_URL}/allocations/return", json=payload)
                if res.status_code in (200, 201):
                    actions_executed.append({
                        "type": "return_asset",
                        "success": True,
                        "assetTag": asset_tag,
                        "condition": condition_at_return
                    })
                    return res.json()
                return {"error": f"Return confirmation failed: status {res.status_code}", "detail": res.text}
            except Exception as e:
                return {"error": f"Return process crash: {str(e)}"}

        async def create_maintenance_request(asset_tag: str, description: str, priority: str = "Medium") -> Dict[str, Any]:
            """
            Create a maintenance ticket / repair request for a damaged or faulty asset.
            
            Args:
                asset_tag: Unique tag of the asset needing service.
                description: Description of the hardware issues or malfunction details.
                priority: Priority score ('Low', 'Medium', 'High', 'Critical').
            """
            try:
                # Find asset
                asset_res = await client.get(f"{BACKEND_URL}/assets", params={"assetTag": asset_tag})
                if asset_res.status_code != 200:
                    return {"error": "Asset lookup failed"}
                assets = asset_res.json().get("assets", [])
                if not assets:
                    return {"error": f"Asset '{asset_tag}' not found"}
                asset_id = assets[0]["_id"]
                
                payload = {
                    "assetId": asset_id,
                    "description": description,
                    "priority": priority
                }
                res = await client.post(f"{BACKEND_URL}/maintenance", json=payload)
                if res.status_code in (200, 201):
                    actions_executed.append({
                        "type": "create_maintenance",
                        "success": True,
                        "assetTag": asset_tag,
                        "priority": priority
                    })
                    return res.json()
                return {"error": f"Failed to create maintenance: status {res.status_code}", "detail": res.text}
            except Exception as e:
                return {"error": f"Maintenance ticket creation error: {str(e)}"}

        async def create_booking(asset_tag: str, start_time: str, end_time: str, title: str = "AI Booking") -> Dict[str, Any]:
            """
            Reserve / book a shared bookable asset for a specific time range.
            
            Args:
                asset_tag: Unique tag of the bookable asset (e.g. conference room, projector, test device).
                start_time: ISO 8601 string of starting time (e.g. '2026-07-13T14:00:00Z').
                end_time: ISO 8601 string of ending time (e.g. '2026-07-13T17:00:00Z').
                title: Event title or booking reason (e.g. 'Client Demo Presentation').
            """
            try:
                # Find asset
                asset_res = await client.get(f"{BACKEND_URL}/assets", params={"assetTag": asset_tag})
                if asset_res.status_code != 200:
                    return {"error": "Asset lookup failed"}
                assets = asset_res.json().get("assets", [])
                if not assets:
                    return {"error": f"Asset '{asset_tag}' not found"}
                asset_id = assets[0]["_id"]
                
                payload = {
                    "resourceId": asset_id,
                    "startTime": start_time,
                    "endTime": end_time,
                    "title": title
                }
                res = await client.post(f"{BACKEND_URL}/bookings", json=payload)
                if res.status_code in (200, 201):
                    actions_executed.append({
                        "type": "create_booking",
                        "success": True,
                        "assetTag": asset_tag,
                        "startTime": start_time,
                        "endTime": end_time
                    })
                    return res.json()
                return {"error": f"Booking reservation failed: status {res.status_code}", "detail": res.json()}
            except Exception as e:
                return {"error": f"Booking creation error: {str(e)}"}

        # Dictionary lookup for tools
        tools_map = {
            "list_users": list_users,
            "search_assets": search_assets,
            "allocate_asset": allocate_asset,
            "return_asset": return_asset,
            "create_maintenance_request": create_maintenance_request,
            "create_booking": create_booking
        }
        tools_list = list(tools_map.values())

        # ─── Initialize Agent ──────────────────────────────────────────────────
        
        system_instruction = (
            "You are the AssetFlow AI Copilot, a highly capable agentic assistant. "
            "You help users manage, audit, and troubleshoot assets. You can check asset info, "
            "allocate assets to employees, handle return check-ins, request maintenance, and make bookings.\n"
            f"You are speaking with: {user_context.get('name')} (Role: {user_context.get('role')}, Department: {user_context.get('departmentId')}).\n"
            "Guidelines:\n"
            "1. When user requests actions like allocate, first search for the asset tag and the employee details to make sure they exist.\n"
            "2. Execute the appropriate tool when a request implies database mutations. Give a friendly, professional explanation. "
            "Do NOT pretend to perform actions; actually call the tools.\n"
            "3. Formulate date queries relative to current date if mentioned as 'tomorrow' or 'next week'. The current local time is July 12, 2026.\n"
            "4. Keep your responses clear, helpful, and formatted nicely in Markdown."
        )

        model = genai.GenerativeModel(
            model_name="gemini-3.5-flash",
            tools=tools_list,
            system_instruction=system_instruction
        )

        # Build chat messages context manually for robust tool loop
        messages = []
        
        # Load historical conversation (from oldest to newest)
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            messages.append({
                "role": role,
                "parts": [msg["content"]]
            })
            
        # Append current user prompt
        messages.append({
            "role": "user",
            "parts": [message]
        })

        # ─── Execute Generative Loop (Function Calling Dispatcher) ────────────
        
        max_iterations = 8
        for i in range(max_iterations):
            response = model.generate_content(messages)
            
            # Check if Gemini wants to call a function
            candidate = response.candidates[0]
            function_calls = getattr(candidate.content, "parts", [])
            function_calls = [p.function_call for p in function_calls if p.function_call]
            
            if not function_calls:
                # No more function calls, return final answer
                final_reply = response.text
                return final_reply, actions_executed
                
            # Keep track of the tool calls in the conversation history
            # We must append the model's tool calls to the messages history first
            messages.append({
                "role": "model",
                "parts": list(candidate.content.parts)
            })
            
            # Execute the function calls
            function_response_parts = []
            for fc in function_calls:
                func_name = fc.name
                func_args = dict(fc.args)
                
                if func_name in tools_map:
                    # Run the tool
                    print(f"⚙️ Agent executing tool: {func_name} with args: {func_args}")
                    tool_func = tools_map[func_name]
                    result = await tool_func(**func_args)
                    
                    # Append result to function responses
                    # Note: function response structure
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
            
            # Send the tool outputs back in a role="function" part
            messages.append({
                "role": "function",
                "parts": function_response_parts
            })
            
        # If loop limit hit
        return "I processed your request, but hit an internal operations loop. Please try again with simpler instructions.", actions_executed
