import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../types';

interface Props {
  message: ChatMessage;
  onDownload?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
}

export function MessageBubble({ message, onDownload, onEdit }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className={`avatar ${isUser ? 'user' : 'assistant'}`}>
        {isUser ? (
          'You'
        ) : (
          <img src="/logo.png" alt="Quantum AI" />
        )}
      </div>
      <div className={`bubble ${isUser ? 'user' : 'assistant'}`}>
        {isUser ? (
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
        ) : message.content ? (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        ) : (
          <div className="typing">
            <span />
            <span />
            <span />
          </div>
        )}
        {message.downloadable && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={() => onDownload?.(message)}
              style={{
                padding: '6px 12px',
                background: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              ⬇ Download
            </button>
            <button
              onClick={() => onEdit?.(message)}
              style={{
                padding: '6px 12px',
                background: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              ✏️ Request Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}