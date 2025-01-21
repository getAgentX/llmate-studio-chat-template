// export default async function handler(req, res) {
//   const { assistant_id, chat_id } = req.body;
//   if (!assistant_id) {
//     return res.status(400).json({ error: "assistant_id is required" });
//   }

//   if (!chat_id) {
//     return res.status(400).json({ error: "chat_id is required" });
//   }

//   if (req.method === "OPTIONS") {
//     res.status(200).end();
//     return;
//   }

//   res.setHeader("Transfer-Encoding", "chunked");
//   res.setHeader("Connection", "keep-alive");

//   try {
//     const apiUrl = "https://api.staging.llmate.ai";
//     const endpoint = `${apiUrl}/v1/integrate/assistant/${assistant_id}/chat/${chat_id}/send-message/`;

//     const response = await fetch(endpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-API-KEY": "77826d4d-932e-450d-ab2b-8da7c4634787",
//       },
//       body: JSON.stringify(req.body),
//     });

//     const reader = response.body.getReader();
//     const decoder = new TextDecoder();

//     async function sendEvent(data) {
//       res.write(`${data}`);
//     }

//     async function closeConnection() {
//       res.end();
//     }

//     async function processResponse({ done, value }) {
//       if (done) {
//         closeConnection();
//         return;
//       }

//       const chunk = decoder.decode(value);
//       sendEvent(chunk);

//       return reader.read().then(processResponse);
//     }

//     reader.read().then(processResponse);
//   } catch (error) {
//     console.error(error);
//     res.statusCode = 500;
//     res.end("Internal Server Error");
//   }
// }

// pages/api/streamSendMessage.js
export default async function handler(req, res) {
  const { assistant_id, chat_id, user_query } = req.body;

  if (!assistant_id || !chat_id) {
    return res
      .status(400)
      .json({ error: "assistant_id and chat_id are required" });
  }

  // Optional: handle pre-flight OPTIONS request if needed
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Enable chunked response
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Connection", "keep-alive");

  try {
    const apiUrl = "https://stream.staging.llmate.ai";
    const endpoint = `${apiUrl}/v1/integrate/assistant/${assistant_id}/chat/${chat_id}/send-message/`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "77826d4d-932e-450d-ab2b-8da7c4634787",
      },
      body: JSON.stringify({ user_query }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    async function processChunk({ done, value }) {
      if (done) {
        res.end();
        return;
      }

      // Decode the current chunk
      const chunk = decoder.decode(value);
      // Write it directly to the client
      res.write(chunk);

      // Continue reading
      return reader.read().then(processChunk);
    }

    reader.read().then(processChunk);
  } catch (err) {
    console.error("Streaming route error:", err);
    res.status(500).end("Internal Server Error");
  }
}
