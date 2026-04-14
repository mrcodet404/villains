import { useState, useRef } from "react";

type DownloadStatus = "idle" | "processing" | "ready" | "error";

interface SongResult {
  mp3Url: string;
  filename: string;
}

function extractMp3Url(input: string): SongResult | null {
  try {
    const trimmed = input.trim();

    // Match the pattern: /work/{numbers}-{uuid}
    // UUID portion starts after the first numeric segment and dash
    const workPathMatch = trimmed.match(
      /\/work\/\d+-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
    );

    if (workPathMatch) {
      const uuid = workPathMatch[1];
      const mp3Url = `https://cdn9.ilovesong.ai/audios/${uuid}.mp3`;
      const filename = `ilovesong-${uuid}.mp3`;
      return { mp3Url, filename };
    }

    // Fallback: if user pastes raw UUID directly
    const uuidMatch = trimmed.match(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
    );
    if (uuidMatch) {
      const uuid = uuidMatch[1];
      const mp3Url = `https://cdn9.ilovesong.ai/audios/${uuid}.mp3`;
      const filename = `ilovesong-${uuid}.mp3`;
      return { mp3Url, filename };
    }

    return null;
  } catch {
    return null;
  }
}

const ParticlesBg = () => (
  <div className="particles-container" aria-hidden="true">
    {Array.from({ length: 20 }).map((_, i) => (
      <span key={i} className="particle" style={{ "--i": i } as React.CSSProperties} />
    ))}
  </div>
);

export default function App() {
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [result, setResult] = useState<SongResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [_audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const historyKey = "vbd_history";

  const getHistory = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(historyKey) || "[]");
    } catch {
      return [];
    }
  };

  const saveToHistory = (url: string) => {
    const history = getHistory();
    const updated = [url, ...history.filter((h) => h !== url)].slice(0, 10);
    localStorage.setItem(historyKey, JSON.stringify(updated));
  };

  const handleProcess = () => {
    if (!link.trim()) {
      setErrorMsg("Please paste an ilovesong.ai link first.");
      setStatus("error");
      return;
    }

    setStatus("processing");
    setResult(null);
    setAudioLoaded(false);
    setAudioError(false);
    setErrorMsg("");

    setTimeout(() => {
      const parsed = extractMp3Url(link);
      if (parsed) {
        setResult(parsed);
        setStatus("ready");
        saveToHistory(link.trim());
      } else {
        setErrorMsg(
          "Invalid link format. Please use a valid ilovesong.ai song URL."
        );
        setStatus("error");
      }
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleProcess();
  };

  const handleCopy = () => {
    if (result?.mp3Url) {
      navigator.clipboard.writeText(result.mp3Url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.mp3Url;
    a.download = result.filename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setLink("");
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
    setAudioLoaded(false);
    setAudioError(false);
  };

  const [_history] = useState<string[]>(() => getHistory());

  return (
    <div className="app-root">
      <ParticlesBg />

      {/* Background grid */}
      <div className="grid-bg" aria-hidden="true" />

      {/* Glow orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />

      <div className="content-wrapper">
        {/* Header */}
        <header className="header">
          <div className="logo-wrap">
            <div className="logo-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" stroke="url(#lg1)" strokeWidth="2" />
                <path d="M16 13l12 7-12 7V13z" fill="url(#lg2)" />
                <defs>
                  <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient id="lg2" x1="14" y1="13" x2="30" y2="27" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1 className="site-title">Villains Bot</h1>
              <p className="site-subtitle">DOWNLOADER</p>
            </div>
          </div>
          <div className="header-badge">
            <span className="badge-dot" />
            ilovesong.ai
          </div>
        </header>

        {/* Main card */}
        <main className="main-card">
          <div className="card-header">
            <div className="card-title-row">
              <svg className="music-icon" viewBox="0 0 24 24" fill="none">
                <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
              <h2 className="card-title">MP3 Downloader</h2>
            </div>
            <p className="card-desc">
              Paste your <span className="highlight">ilovesong.ai</span> song link below and instantly get the MP3 download link.
            </p>
          </div>

          {/* Input area */}
          <div className="input-section">
            <label className="input-label">Song Link</label>
            <div className="input-wrap">
              <div className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <input
                className="url-input"
                type="url"
                placeholder="https://ilovesong.ai/work/xxxxxxx-xxxx-xxxx..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status === "processing"}
                autoComplete="off"
                spellCheck={false}
              />
              {link && (
                <button className="clear-btn" onClick={handleReset} title="Clear">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            <button
              className={`process-btn ${status === "processing" ? "loading" : ""}`}
              onClick={handleProcess}
              disabled={status === "processing"}
            >
              {status === "processing" ? (
                <>
                  <span className="spinner" />
                  Processing...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Generate MP3 Link
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {status === "error" && (
            <div className="error-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result */}
          {status === "ready" && result && (
            <div className="result-section">
              <div className="result-header">
                <div className="result-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  MP3 Link Ready!
                </div>
              </div>

              {/* URL display */}
              <div className="url-display-wrap">
                <p className="url-display-label">Direct MP3 URL</p>
                <div className="url-display">
                  <div className="url-text-scroll">
                    <span className="url-text">{result.mp3Url}</span>
                  </div>
                  <button className="copy-btn" onClick={handleCopy} title="Copy URL">
                    {copied ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                </div>
                {copied && <p className="copied-msg">✓ Copied to clipboard!</p>}
              </div>

              {/* Audio player */}
              <div className="audio-player-wrap">
                <p className="audio-player-label">Preview</p>
                <div className={`audio-player-box ${audioError ? "audio-err" : ""}`}>
                  {audioError ? (
                    <div className="audio-error-msg">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                        <path d="M2 2l20 20" strokeLinecap="round" />
                      </svg>
                      <span>Preview unavailable — use the download button below</span>
                    </div>
                  ) : (
                    <audio
                      ref={audioRef}
                      controls
                      className="audio-el"
                      src={result.mp3Url}
                      onLoadedData={() => setAudioLoaded(true)}
                      onError={() => setAudioError(true)}
                      crossOrigin="anonymous"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="action-btns">
                <button className="download-btn" onClick={handleDownload}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
                  </svg>
                  Download MP3
                </button>
                <button className="another-btn" onClick={handleReset}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3.51 15a9 9 0 1 0 .49-3.51" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Another Song
                </button>
              </div>
            </div>
          )}

          {/* How to use */}
          {status === "idle" && (
            <div className="howto-section">
              <p className="howto-title">How to use</p>
              <div className="howto-steps">
                <div className="step">
                  <div className="step-num">1</div>
                  <div className="step-text">
                    <strong>Go to</strong> ilovesong.ai and find your song
                  </div>
                </div>
                <div className="step">
                  <div className="step-num">2</div>
                  <div className="step-text">
                    <strong>Copy</strong> the song page URL from your browser
                  </div>
                </div>
                <div className="step">
                  <div className="step-num">3</div>
                  <div className="step-text">
                    <strong>Paste</strong> it above and click Generate
                  </div>
                </div>
                <div className="step">
                  <div className="step-num">4</div>
                  <div className="step-text">
                    <strong>Download</strong> your MP3 instantly!
                  </div>
                </div>
              </div>

              <div className="example-box">
                <p className="example-title">Example Input URL:</p>
                <code className="example-code">
                  https://ilovesong.ai/work/8342710-578fbb00-1979-4cbc-8e99-f7d471020a3d
                </code>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>Villains Bot Downloader &copy; {new Date().getFullYear()} &mdash; Built with ❤️ for music lovers</p>
          <p className="footer-note">Not affiliated with ilovesong.ai</p>
        </footer>
      </div>
    </div>
  );
}
