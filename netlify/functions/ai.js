const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-2.5-flash";


export default async (request) => {

  if (request.method !== "POST") {

    return json(
      {
        error: "Method not allowed."
      },
      405
    );
  }


  if (!GEMINI_API_KEY) {

    return json(
      {
        error:
          "GEMINI_API_KEY is not configured in Netlify."
      },
      500
    );
  }


  let body;

  try {

    body = await request.json();

  } catch {

    return json(
      {
        error: "Invalid request."
      },
      400
    );
  }


  const message =
    String(body.message || "").trim();

  const context =
    String(body.context || "").trim();

  const conversation =
    Array.isArray(body.conversation)
      ? body.conversation
      : [];


  if (!message) {

    return json(
      {
        error: "Message is empty."
      },
      400
    );
  }


  /*
   * Keep prompts compact.
   * This helps reduce unnecessary input
   * and improves response speed.
   */

  const systemInstruction = `
You are LIFELOOP AI, a personal life-management assistant.

Your job is to help the user understand, organize, plan and act.

Answer in a visually structured way:
- Use short headings when useful.
- Use bullets for lists.
- Bold important concepts using Markdown.
- Avoid giant essay paragraphs.
- Give the most useful answer first.
- Be concise unless detail is actually needed.
- If the user asks for a task, reminder, note or plan,
  make the result practical and actionable.

Do not claim to have completed an action unless the
application has actually confirmed that action.
`.trim();


  let prompt =
    `${systemInstruction}\n\n`;

  if (context) {

    prompt +=
      `Relevant personal context:\n${context}\n\n`;
  }


  if (conversation.length) {

    const recent =
      conversation
        .slice(-6)
        .map(item =>
          `${item.role}: ${String(item.text || "").slice(0, 1500)}`
        )
        .join("\n");

    prompt +=
      `Recent conversation:\n${recent}\n\n`;
  }


  prompt +=
    `User request:\n${message}`;


  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      GEMINI_MODEL
    )}:generateContent?key=${encodeURIComponent(
      GEMINI_API_KEY
    )}`;


  try {

    const start =
      Date.now();


    const response =
      await fetch(
        url,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],

            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1200
            }

          })
        }
      );


    const elapsed =
      Date.now() - start;


    let data;

    try {
      data = await response.json();
    } catch {

      return json(
        {
          error:
            "Gemini returned an invalid response."
        },
        502
      );
    }


    if (!response.ok) {

      console.error(
        "Gemini error:",
        data
      );

      return json(
        {
          error:
            data?.error?.message ||
            "Gemini could not process the request.",
          responseTimeMs: elapsed
        },
        response.status
      );
    }


    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();


    if (!text) {

      return json(
        {
          error:
            "Gemini returned an empty answer.",
          responseTimeMs: elapsed
        },
        502
      );
    }


    return json(
      {
        text,
        model: GEMINI_MODEL,
        responseTimeMs: elapsed
      },
      200
    );


  } catch (error) {

    console.error(
      "LIFELOOP AI network error:",
      error
    );


    return json(
      {
        error:
          "Unable to connect to the AI service."
      },
      502
    );
  }
};


function json(data, status = 200) {

  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}