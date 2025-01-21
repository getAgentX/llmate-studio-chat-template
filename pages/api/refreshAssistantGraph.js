// pages/api/refreshAssistantGraph.js

export default async function handler(req, res) {
  // Allow only POST requests
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

    // 3) You might have an ENV or a base URL. For example:
    const baseUrl = "https://api.staging.llmate.ai";

    // Construct the endpoint
    const endpoint = `${baseUrl}/v1/integrate/assistant/${message_id}/graph/${event_id}/refresh/?skip=${skip}&limit=${limit}`;

    // 4) Make the POST request to your remote service
    //    Include any headers you need (e.g. X-API-KEY)

    // Add your API key:
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "77826d4d-932e-450d-ab2b-8da7c4634787",
      },
      body: JSON.stringify(payload), // The payload from your request body
    });

    // 5) Check if the remote response is OK
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Refresh graph request failed [${response.status}]: ${errorText}`
      );
    }

    // 6) Parse the response data
    const data = await response.json();

    // Return the result to the client
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in refreshAssistantGraph route:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
