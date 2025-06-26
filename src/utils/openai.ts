export async function fetchOpenAISuggestion(text: string, prompt: string): Promise<string> {
    const body = {
      model: "gpt-4",
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
  
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }