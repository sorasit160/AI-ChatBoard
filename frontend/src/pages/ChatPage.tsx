import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatApi } from '../api/client';
import './ChatPage.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(undefined);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await chatApi.sendMessage(userMessage.content, sessionId);
      setSessionId(res.data.sessionId);
      setMessages((prev) => [...prev, res.data.message]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '❌ ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ\n\nSorry, connection error. Please check that the backend is running.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-ai-avatar">🤖</div>
          <div>
            <h1 className="chat-title gradient-text">{t('chat.title')}</h1>
            <p className="chat-subtitle">{t('chat.subtitle')}</p>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleNewChat} id="btn-new-chat">
          ✨ {t('chat.newChat')}
        </button>
      </div>

      {/* Messages area */}
      <div className="chat-messages" id="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="empty-state-icon">💬</div>
            <h2 className="empty-state-title">{t('chat.emptyState')}</h2>
            <p className="empty-state-desc">{t('chat.emptyHint')}</p>
            {/* Suggestion chips */}
            <div className="suggestion-chips">
              {['สวัสดี! คุณช่วยอะไรได้บ้าง?', 'Hello! What can you do?', 'ช่วยเขียนโค้ด Python ให้หน่อย', 'Explain machine learning'].map((s) => (
                <button key={s} className="chip" onClick={() => { setInput(s); inputRef.current?.focus(); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`message-wrapper ${msg.role}`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-role">
                  {msg.role === 'user' ? t('chat.you') : t('chat.ai')}
                  <span className="message-time">{formatTime(msg.created_at)}</span>
                </div>
                <div className={`message-bubble ${msg.role}`}>
                  {msg.role === 'assistant' ? (
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="message-text">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isLoading && (
          <div className="message-wrapper assistant animate-fade-in">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-role">{t('chat.ai')}</div>
              <div className="message-bubble assistant">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <span className="typing-text">{t('chat.thinking')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            id="chat-input"
            className="chat-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="btn btn-primary send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            id="btn-send"
            aria-label={t('chat.send')}
          >
            {isLoading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : '➤'}
          </button>
        </div>
        <p className="chat-hint">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
