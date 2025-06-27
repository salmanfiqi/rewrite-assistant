import React, { useState, useEffect } from 'react';
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

function renderDiff(diff: Change[]): React.ReactNode {
  return (
    <span>
      {diff.map((part, index) =>
        part.removed ? (
          <del key={index}>{part.value}</del>
        ) : part.added ? (
          <ins key={index}>{part.value}</ins>
        ) : (
          <span key={index}>{part.value}</span>
        )
      )}
    </span>
  );
}

const Editor: React.FC = () => {
  const [text, setText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('rewriteVersions');
    if (saved) {
      const parsed: Version[] = JSON.parse(saved);
      parsed.forEach(v => (v.timestamp = new Date(v.timestamp)));
      setVersions(parsed);
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('rewriteVersions', JSON.stringify(versions));
  }, [versions]);

  const handleSubmit = async () => {
    if (!text.trim() || !prompt.trim()) return;
    setLoading(true);
    try {
      const suggestion = await fetchOpenAISuggestion(text, prompt);
      const diff = diffWords(text, suggestion);
      const newVersion: Version = {
        id: Date.now(),
        original: text,
        text: suggestion,
        prompt,
        timestamp: new Date(),
        diff,
      };
      setVersions([newVersion, ...versions]);
    } catch (error) {
      console.error('OpenAI error:', error);
      alert('Error fetching suggestion. Check console.');
    }
    setLoading(false);
  };

  const handleRestore = (v: Version) => {
    setText(v.original);
    setPrompt(v.prompt);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Rewrite Assistant</h1>
      <textarea
        rows={6}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
        placeholder="Paste your text here..."
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <input
        type="text"
        style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
        placeholder="Enter rewrite prompt (e.g. email tone)"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ padding: '0.5rem 1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Working...' : 'Submit Prompt'}
      </button>

      {versions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Version History</h2>
          {versions.map(v => (
            <div key={v.id} style={{ borderTop: '1px solid #ccc', padding: '0.75rem 0' }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem', color: '#555' }}>
                {v.timestamp.toLocaleString()} — Prompt: <i>{v.prompt}</i>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                {renderDiff(v.diff)}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleRestore(v)}>Restore</button>
                <button onClick={() => setText(v.text)}>Accept All</button>
                <button onClick={() => setText(v.original)}>Reject All</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Editor;
