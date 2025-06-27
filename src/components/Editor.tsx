import React, { useState, useEffect } from 'react';
import { diffWords, Change } from 'diff';
import { fetchOpenAISuggestion } from '../utils/openai';

interface Version {
  id: number;
  original: string;
  suggestion: string;
  prompt: string;
  timestamp: Date;
  diff: Change[];
}

const Editor: React.FC = () => {
  const [text, setText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('versions');
    if (raw) {
      const parsed: Version[] = JSON.parse(raw);
      parsed.forEach(v => (v.timestamp = new Date(v.timestamp)));
      setVersions(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('versions', JSON.stringify(versions));
  }, [versions]);

  const handleSubmit = async () => {
    if (!text.trim() || !prompt.trim()) return;
    setLoading(true);
    try {
      const result = await fetchOpenAISuggestion(text, prompt);
      setSuggestion(result);
      const diff = diffWords(text, result);
      const newVersion: Version = {
        id: Date.now(),
        original: text,
        suggestion: result,
        prompt,
        timestamp: new Date(),
        diff,
      };
      setVersions([newVersion, ...versions]);
    } catch (error) {
      console.error(error);
      alert('Error fetching suggestion.');
    }
    setLoading(false);
  };

  const applySuggestion = (v: Version) => {
    setText(v.suggestion);
  };
  const rejectSuggestion = (v: Version) => {
    setText(v.original);
  };
  const restoreVersion = (v: Version) => {
    setText(v.original);
    setPrompt(v.prompt);
    setSuggestion('');
  };

  const renderDiff = (diff: Change[]) => (
    <span>
      {diff.map((part, i) =>
        part.removed ? (
          <del key={i}>{part.value}</del>
        ) : part.added ? (
          <ins key={i}>{part.value}</ins>
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </span>
  );

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1, padding: '1rem' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0 }}>Rewrite Assistant</h1>
          <button onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter original text..."
          style={{ width: '100%', height: '120px', marginBottom: '0.5rem', padding: '0.5rem', border: '1px solid #ccc' }}
        />

        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Rewrite prompt (e.g., formal tone)"
          style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', border: '1px solid #ccc' }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: '0.5rem 1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Working...' : 'Submit'}
        </button>

        {suggestion && (
          <>
            <h2 style={{ marginTop: '1rem' }}>Output</h2>
            <textarea
              value={suggestion}
              readOnly
              style={{ width: '100%', height: '120px', padding: '0.5rem', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}
            />
          </>
        )}
      </div>

      {showHistory && (
        <div style={{ width: '280px', borderLeft: '1px solid #ddd', padding: '1rem', overflowY: 'auto' }}>
          <h3 style={{ marginTop: 0 }}>Version History</h3>
          {versions.map(v => (
            <div key={v.id} style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#555' }}>
                {v.timestamp.toLocaleString()}
              </div>
              <div style={{ margin: '0.25rem 0', fontStyle: 'italic' }}>{v.prompt}</div>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', lineHeight: 1.4 }}>
                {renderDiff(v.diff)}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => applySuggestion(v)}>Accept</button>
                <button onClick={() => rejectSuggestion(v)}>Reject</button>
                <button onClick={() => restoreVersion(v)}>Restore</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Editor;
