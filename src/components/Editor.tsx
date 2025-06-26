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
        <div>
            <h2>Editor</h2>

            <textarea
            rows={10}
            cols={80}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here"
            />

            <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter rewrite prompt..."
            />

            <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Prompt'}
            </button>
  </div>
        );
    };
    
    export default Editor;