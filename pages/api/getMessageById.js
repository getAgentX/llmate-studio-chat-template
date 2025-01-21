// pages/api/getMessageById.js
export default async function handler(req, res) {
  // Only allow POST requests (you can switch to GET if you prefer)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 1) Extract `assistant_id` and `message_id` from the request body
    const { message_id } = req.body;

    // 2) Validate the input

    if (!message_id) {
      return res.status(400).json({ error: "message_id is required" });
    }

    // 3) Make the request to the remote API
    //    Replace `YOUR_BASE_URL` with your actual API base
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://api.staging.llmate.ai";
    const endpoint = `${baseUrl}/assistant/${message_id}/`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "77826d4d-932e-450d-ab2b-8da7c4634787",
      },
    });

    if (!response.ok) {
      // Maybe read the body for more info:
      const errorText = await response.text();
      throw new Error(`Failed with status ${response.status}: ${errorText}`);
    }

    // 4) Parse the response as JSON and return to caller
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in getMessageById route:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
