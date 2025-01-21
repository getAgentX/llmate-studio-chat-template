import { sseConnectionClosed, sseReceived } from "./_actions";
import { getSession } from "next-auth/react";

async function createSSEWithPost(url, options) {
  const response = await fetch(url, options);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  // Create a custom EventSource-like object
  const sse = new EventSource("");

  // Handle stream of data manually
  function pushMessageEvent(data) {
    const event = new MessageEvent("message", { data });
    sse.dispatchEvent(event);
  }
  function pushCloseEvent() {
    const event = new Event("close");
    sse.dispatchEvent(event);
  }

  reader.read().then(function process({ done, value }) {
    if (done) {
      pushCloseEvent();
      sse.close();
      return;
    }

    const chunk = decoder.decode(value);
    pushMessageEvent(chunk);

    return reader.read().then(process);
  });

  return sse;
}

async function prepareHeadersAsync() {
  const headers = {
    "Content-Type": "application/json",
  };

  const session = await getSession();

  if (session) {
    headers["Authorization"] = `Bearer ${session["accessToken"]}`;
  }

  return headers;
}

const selectOrganizationId = (state) => {
  return state.currentOrganization?.id;
};

export const streamBaseQuery = async (args, api, extraOptions) => {
  const projectId = selectOrganizationId(api.getState());

  if (!projectId) {
    return {
      error: {
        status: 400,
        statusText: "Bad Request",
        data: "No project ID received",
      },
    };
  }

  const adjustedUrl = `${process.env.NEXT_PUBLIC_STREAM_URL}/${projectId}/${args.url}`;
  const headers = await prepareHeadersAsync();

  try {
    const sse = await createSSEWithPost(adjustedUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(args.body),
    });

    // Attach event listeners to handle SSE messages
    sse.addEventListener("message", (event) => {
      api.dispatch(sseReceived(event.data));
    });

    sse.addEventListener("close", () => {
      api.dispatch(sseConnectionClosed());
    });

    // Given the asynchronous nature of SSE, return a status message saying the connection was initialized.
    return { data: "SSE connection initialized" };
  } catch (error) {
    return {
      error: {
        status: 500,
        statusText: "SSE Connection Error",
        data: error.message,
      },
    };
  }
};
