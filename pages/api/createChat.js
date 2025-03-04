export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { assistant_id } = req.body;
    if (!assistant_id) {
      return res.status(400).json({ error: "assistant_id is required" });
    }

    const apiUrl = process.env.LLMATE_API_END_POINT;

    const endpoint = `${apiUrl}/v1/integrate/assistant/${assistant_id}/chat/`;

    // Add your API key:
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.LLMATE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("API Route Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
