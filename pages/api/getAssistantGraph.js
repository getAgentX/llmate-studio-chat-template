// pages/api/getAssistantGraph.js

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 1) Extract parameters from the request body
    const { message_id, event_id, payload, skip, limit } = req.body;

    // 2) Validate required fields
    if (!message_id) {
      return res.status(400).json({ error: "message_id is required" });
    }
    if (!event_id) {
      return res.status(400).json({ error: "event_id is required" });
    }

    // 3) Construct the URL
    //    Adjust the base URL and any env variable usage for your environment
    const baseUrl = process.env.LLMATE_API_END_POINT;
    const endpoint = `${baseUrl}/v1/integrate/assistant/${message_id}/graph/${event_id}/get-graph/?skip=${skip}&limit=${limit}`;

    // 4) Make the POST request to the remote service

    // Add your API key:
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.LLMATE_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed with status ${response.status}: ${errorText}`);
    }

    // 5) Parse the JSON data
    const data = await response.json();

    // 6) Return it to the client
    return res.status(200).json(data);
  } catch (error) {
    console.error("getAssistantGraph error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
