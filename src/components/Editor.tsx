import React, { useState } from 'react';
import { fetchOpenAISuggestion } from '../utils/openai';

const Editor = () => {
  const [text, setText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await fetchOpenAISuggestion(text, prompt);
    console.log('AI Response:', result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">Rewrite Assistant</h2>

      <textarea
        rows={10}
        className="w-full p-4 border rounded-md resize-none focus:outline-none focus:ring"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here..."
      />

      <input
        type="text"
        className="w-full p-2 border rounded-md focus:outline-none focus:ring"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter rewrite prompt (e.g. 'Make it more formal')"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Prompt'}
      </button>
    </div>
  );
};

export default Editor;