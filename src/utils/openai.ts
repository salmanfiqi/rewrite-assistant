export async function fetchOpenAISuggestion(text: string, prompt: string): Promise<string> {
  console.log("API Key:", process.env.REACT_APP_OPENAI_API_KEY);

  const body = {
    // use the turbo model that we verified via curl
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You're an expert editor." },
      { role: "user", content: `${prompt}\n\n---\n\n${text}` },
    ],
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("OpenAI API error:", err);
    throw new Error(err.error?.message || "Unknown API error");
  }

  const data = await res.json();
  console.log("Suggestion:", data.choices?.[0]?.message?.content);
  return data.choices?.[0]?.message?.content ?? '';
}