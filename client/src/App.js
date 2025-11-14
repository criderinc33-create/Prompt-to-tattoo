import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tattoo design');
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else if (data.message) {
        setMessage(data.message);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `tattoo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const examplePrompts = [
    'Dragon breathing fire',
    'Minimalist rose with thorns',
    'Geometric wolf',
    'Japanese wave',
    'Celtic knot',
    'Phoenix rising from ashes'
  ];

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1 className="title">✨ Prompt to Tattoo</h1>
          <p className="subtitle">Generate unique tattoo designs with AI</p>
        </header>

        <div className="main-content">
          <form onSubmit={handleGenerate} className="prompt-form">
            <div className="input-group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your tattoo idea... (e.g., 'dragon with spread wings')"
                className="prompt-input"
                rows="4"
                disabled={loading}
              />
              <button 
                type="submit" 
                className="generate-button"
                disabled={loading || !prompt.trim()}
              >
                {loading ? '🎨 Generating...' : '🎨 Generate Tattoo'}
              </button>
            </div>

            <div className="examples">
              <p className="examples-label">Try these examples:</p>
              <div className="example-chips">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    className="example-chip"
                    onClick={() => setPrompt(example)}
                    disabled={loading}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Creating your tattoo design...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="info-message">
              <span className="info-icon">ℹ️</span>
              <p>{message}</p>
            </div>
          )}

          {generatedImage && (
            <div className="result-container">
              <div className="image-wrapper">
                <img 
                  src={generatedImage} 
                  alt="Generated tattoo design" 
                  className="generated-image"
                />
              </div>
              <div className="action-buttons">
                <button onClick={handleDownload} className="download-button">
                  📥 Download Image
                </button>
                <button 
                  onClick={() => {
                    setGeneratedImage(null);
                    setPrompt('');
                  }} 
                  className="new-button"
                >
                  ✨ Create New Design
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="footer">
          <p>💡 Tip: Be specific with your prompt for better results!</p>
          <p className="disclaimer">Note: Generated designs are AI-created. Consult a professional tattoo artist before getting inked.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
