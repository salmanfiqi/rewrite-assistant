import React, { useState } from 'react';
import { useEffect } from 'react';
import { diffWords, Change } from 'diff';
import { fetchOpenAISuggestion } from '../utils/openai';

interface Version {
  id: number;
  text: string;
  original: string;
  prompt: string;
  timestamp: Date;
  diff: Change[];
}


function applyDiff(diff: Change[]): string {
    return diff
      .filter(change => !change.removed)
      .map(change => change.value)
      .join('');
  }

const Editor = () => {
  const [text, setText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('rewriteVersions');
    if (saved) {
      setVersions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rewriteVersions', JSON.stringify(versions));
  }, [versions]);

  const handleSubmit = async () => {
    if (!text || !prompt) return;
    setLoading(true);
    const aiResponse = await fetchOpenAISuggestion(text, prompt);
    setResult(aiResponse);
  
    const diff = diffWords(text, aiResponse); 
  
    const newVersion: Version = {
      id: Date.now(),
      text: aiResponse,
      original: text,
      prompt: prompt,
      timestamp: new Date(),
      diff: diff,
    };
  
    setVersions([newVersion, ...versions]);
    setLoading(false);
  };

  const handleRestore = (version: Version) => {
    setText(version.text);
    setPrompt(version.prompt);
    setResult('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Rewrite Assistant</h1>

      <textarea
        rows={10}
        className="w-full p-4 border rounded-md resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here..."
      />

      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded-md"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter rewrite prompt (e.g., make it more formal)"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Prompt'}
        </button>
      </div>

      {result && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <h3 className="font-semibold mb-2">AI Suggestion:</h3>
          <p>{result}</p>
        </div>
      )}

      {versions.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Version History:</h3>
          <ul className="space-y-3">
            {versions.map((v) => (
              <li key={v.id} className="p-4 border rounded bg-white shadow-sm">
                <div className="text-sm text-gray-500">
                  {v.timestamp.toLocaleString()} — Prompt: <i>{v.prompt}</i>
                </div>
                <div className="mt-2 whitespace-pre-wrap">{v.text}</div>
                <button
                  onClick={() => handleRestore(v)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Restore
                </button>
                <button
                onClick={() => {
                    setText(applyDiff(v.diff));
                    setPrompt('');
                    setResult('');
                }}
                className="mt-2 text-sm text-green-600 hover:underline"
                >
                Accept All Changes
                </button>
                <button
                onClick={() => {
                    setText(v.original);
                    setPrompt('');
                    setResult('');
                }}
                className="text-sm text-red-600 hover:underline"
                >
                Reject Changes
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Editor;