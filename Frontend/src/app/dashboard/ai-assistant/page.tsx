'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Bot, User, Play, CheckCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface Action {
  type: string;
  success: boolean;
  assetTag?: string;
  allocatedTo?: string;
  email?: string;
  startTime?: string;
  endTime?: string;
  priority?: string;
  condition?: string;
}

// Custom simple markdown renderer for clean, professional styling
const MarkdownRenderer = ({ text }: { text: string }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string | number) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} style={{ margin: '0 0 0.75rem 0', paddingLeft: '1.25rem', listStyleType: 'disc' }}>
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushList(index);
      renderedElements.push(<div key={`empty-${index}`} style={{ height: '0.4rem' }} />);
      return;
    }

    // Check for headers (e.g. ### Header)
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      flushList(index);
      const level = headerMatch[1].length;
      const content = headerMatch[2];
      const parsedContent = parseInlineMarkdown(content);
      
      const headerStyle = {
        marginTop: '0.75rem',
        marginBottom: '0.4rem',
        fontWeight: 700,
        lineHeight: '1.25'
      };

      if (level === 1) {
        renderedElements.push(<h1 key={`h-${index}`} style={{ ...headerStyle, fontSize: '1.3rem' }}>{parsedContent}</h1>);
      } else if (level === 2) {
        renderedElements.push(<h2 key={`h-${index}`} style={{ ...headerStyle, fontSize: '1.15rem' }}>{parsedContent}</h2>);
      } else {
        renderedElements.push(<h3 key={`h-${index}`} style={{ ...headerStyle, fontSize: '1.05rem' }}>{parsedContent}</h3>);
      }
      return;
    }

    // Check for bullet list items
    const bulletMatch = line.match(/^[\*\-\+]\s+(.*)$/);
    if (bulletMatch) {
      inList = true;
      const content = bulletMatch[1];
      listItems.push(
        <li key={`li-${index}`} style={{ marginBottom: '0.2rem', lineHeight: '1.4' }}>
          {parseInlineMarkdown(content)}
        </li>
      );
      return;
    }

    // Normal text
    flushList(index);
    renderedElements.push(
      <p key={`p-${index}`} style={{ margin: '0 0 0.5rem 0', lineHeight: '1.4' }}>
        {parseInlineMarkdown(line)}
      </p>
    );
  });

  flushList('end');
  return <>{renderedElements}</>;
};

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|[^\*`]+)/g;
  let keyIndex = 0;
  
  const matches = text.matchAll(regex);
  for (const match of matches) {
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={keyIndex++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={keyIndex++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code 
          key={keyIndex++} 
          style={{ 
            backgroundColor: 'hsla(var(--primary), 0.15)', 
            color: 'hsl(var(--primary))',
            padding: '0.1rem 0.25rem', 
            borderRadius: '4px', 
            fontFamily: 'monospace', 
            fontSize: '0.85em' 
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(<React.Fragment key={keyIndex++}>{token}</React.Fragment>);
    }
  }

  return parts;
}

export default function AIAssistantPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Message[]>([
    {
      role: 'model',
      content: `Hello ${currentUser?.name || 'there'}! I am your **AssetFlow AI Assistant**. I can help you find, allocate, return, book, and diagnose company assets. 

Try asking me:
* *"Show me all available assets in IT"*
* *"Assign MacBook AF-0001 to john.doe@example.com until next Friday"*
* *"Reserve projector AF-0005 for tomorrow from 2 PM to 5 PM"*
* *"Report that asset AF-0002 has a cracked screen and needs repairs"*`
    }
  ]);
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggestions for quick prompting
  const suggestions = [
    "List available Laptops",
    "Find asset AF-0001 details",
    "Return my assigned MacBook",
    "Predict maintenance for AF-0002"
  ];

  useEffect(() => {
    // Scroll to bottom of chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleSendMessage = async (inputMsg: string) => {
    if (!inputMsg.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputMsg };
    setHistory((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // API call to the proxy route
      const { data } = await api.post('/ai/chat', {
        message: inputMsg,
        // Send history excluding the welcome message for API performance, or pass full history
        history: history.slice(1).map((m) => ({
          role: m.role,
          content: m.content
        }))
      });

      if (data.success) {
        const botMessage: Message = {
          role: 'model',
          content: data.data.reply || "Done!"
        };
        setHistory((prev) => [...prev, botMessage]);

        // Capture actions if any
        if (data.data.actions && data.data.actions.length > 0) {
          setActions((prev) => [...data.data.actions, ...prev]);
        }
      }
    } catch (error: any) {
      console.error('AI chat failed', error);
      const errorMessage: Message = {
        role: 'model',
        content: `⚠️ Sorry, I encountered an issue: **${error.response?.data?.message || error.message}**. Please make sure the ML service is running on port 8000 and has a configured API key.`
      };
      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  const renderActionLabel = (action: Action) => {
    switch (action.type) {
      case 'allocate_asset':
        return `Allocated ${action.assetTag} to ${action.allocatedTo}`;
      case 'return_asset':
        return `Returned asset ${action.assetTag} (${action.condition || 'Good'})`;
      case 'create_maintenance':
        return `Requested maintenance for ${action.assetTag} (${action.priority || 'Medium'})`;
      case 'create_booking':
        return `Booked asset ${action.assetTag}`;
      default:
        return `Executed ${action.type}`;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '2rem', height: 'calc(100vh - 120px)' }}>
      {/* Chat Area */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem', overflow: 'hidden', position: 'relative' }}>
        
        {/* Glowing Ambient Gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '1rem', marginBottom: '1rem', zIndex: 1 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>AI Operations Copilot</h2>
            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', margin: '2px 0 0 0' }}>Fully integrated Agentic Assistant</p>
          </div>
        </div>

        {/* Message Logs */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', zIndex: 1, paddingBottom: '1rem' }}>
          {history.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div key={index} style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start'
              }}>
                {!isUser && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'hsla(var(--primary), 0.1)',
                    color: 'hsl(var(--primary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Bot size={18} />
                  </div>
                )}
                
                <div style={{
                  maxWidth: '75%',
                  padding: '0.75rem 1rem',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: isUser ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                  color: isUser ? '#fff' : 'hsl(var(--text))',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                  whiteSpace: 'pre-wrap'
                }}>
                  <MarkdownRenderer text={msg.content} />
                </div>

                {isUser && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {currentUser?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                <Bot size={18} />
              </div>
              <div style={{ display: 'flex', gap: '4px', padding: '0.75rem 1rem', borderRadius: '12px', backgroundColor: 'hsl(var(--secondary))' }}>
                <div className="dot-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'hsl(var(--text-muted))', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                <div className="dot-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'hsl(var(--text-muted))', animation: 'bounce 1.4s infinite ease-in-out both 0.2s' }}></div>
                <div className="dot-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'hsl(var(--text-muted))', animation: 'bounce 1.4s infinite ease-in-out both 0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        {history.length <= 2 && !isLoading && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', zIndex: 1 }}>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(s)}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '9999px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--surface))',
                  color: 'hsl(var(--text))',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                className="hover:border-primary hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(message);
          }}
          style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem', zIndex: 1 }}
        >
          <input
            type="text"
            placeholder="Type your command (e.g. 'allocate laptop AF-0001 to John...')"
            className="input-field"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!message.trim() || isLoading}
            style={{ width: '48px', height: '48px', padding: 0, borderRadius: '8px' }}
          >
            {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>

      {/* Real-time Agent Log Side Panel */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', height: '100%', overflow: 'hidden' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <Play size={16} className="text-primary" /> Active AI Actions
        </h3>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {actions.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', color: 'hsl(var(--text-muted))', textAlign: 'center', gap: '0.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>No actions logged yet.</p>
              <p style={{ fontSize: '0.75rem' }}>When the AI runs tools (e.g. allocating or booking), they will display here in real time.</p>
            </div>
          ) : (
            actions.map((act, index) => (
              <div key={index} style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: 'hsla(var(--success), 0.05)',
                border: '1px solid hsla(var(--success), 0.2)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <CheckCircle size={16} style={{ color: 'hsl(var(--success))', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--success))', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {act.type.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '2px', color: 'hsl(var(--text))' }}>
                    {renderActionLabel(act)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounce {
          0%, 100% { transform: scale(0); }
          50% { transform: scale(1); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
