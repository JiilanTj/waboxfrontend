'use client';

import { useState, useEffect } from 'react';
import { Send, Paperclip, Smile, Mic, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMessage } from '@/hooks/useMessage';
import { SendMessageResponse } from '@/lib/types/message';
import { chatTemplateApi } from '@/lib/api';
import { ChatTemplate } from '@/lib/types';
import { normalizeWhatsAppNewlines, renderWhatsAppFormatted } from '@/lib/utils/whatsapp-format';

interface MessageInputProps {
  contactId: string;
  sessionId?: string; // 🆕 Add sessionId prop
  contactNumber?: string; // 🆕 Add contactNumber prop
}

export function MessageInput({ contactId, sessionId, contactNumber }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isResolvingTemplate, setIsResolvingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  // 🆕 Suggestions state for /command
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<ChatTemplate[]>([]);
  const [suggestIndex, setSuggestIndex] = useState(0);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  // 🆕 Use the message hook to get sendMessage function and contact data
  const { 
    sendMessage, 
    isSending, 
    sendError 
  } = useMessage({
    chatId: contactId,
    sessionId: sessionId,
    autoFetch: false, // We don't need to fetch messages here, just send
    enablePolling: false
  });

  const handleSend = async () => {
    if (message.trim() && sessionId && contactNumber) {
      const finalMessage = normalizeWhatsAppNewlines(message);
      console.log('📤 Sending message to', contactNumber, ':', finalMessage);
      console.log('📤 Session ID:', sessionId);
      console.log('📤 Contact number:', contactNumber);
      
      try {
        const result = await sendMessage(contactNumber, finalMessage);
        
        console.log('📤 Send result type:', typeof result);
        console.log('📤 Send result:', result);
        
        // Handle undefined result
        if (!result) {
          console.error('❌ Failed to send message: No result returned from sendMessage');
          return;
        }
        
        if (result.success) {
          setMessage(''); // Clear input on successful send
          const successResult = result as SendMessageResponse;
          console.log('✅ Message sent successfully:', successResult.data?.messageId || 'Success');
        } else {
          const errorResult = result as { success: boolean; error: { error: string; message: string; }; };
          const errorMessage = errorResult.error?.message || 'Unknown error occurred';
          console.error('❌ Failed to send message:', errorMessage);
        }
      } catch (error) {
        console.error('💥 Error sending message:', error);
        console.error('💥 Error type:', typeof error);
        console.error('💥 Error details:', error instanceof Error ? error.message : String(error));
      }
    } else {
      if (!sessionId) {
        console.warn('⚠️ SessionId is required to send messages');
        console.warn('⚠️ Current sessionId:', sessionId);
      }
      if (!contactNumber) {
        console.warn('⚠️ Contact number is required to send messages');
        console.warn('⚠️ Current contactNumber:', contactNumber);
      }
      if (!message.trim()) {
        console.warn('⚠️ Message content is required');
        console.warn('⚠️ Current message:', message);
      }
    }
  };

  const acceptTemplate = (tpl: ChatTemplate) => {
    const trimmed = message.trimStart();
    const firstSpaceIdx = trimmed.indexOf(' ');
    const remainder = firstSpaceIdx === -1 ? '' : trimmed.slice(firstSpaceIdx).trimStart();
    const newMessage = `${tpl.content}${remainder ? ` ${remainder}` : ''}`;
    setMessage(normalizeWhatsAppNewlines(newMessage));
    setShowSuggestions(false);
    setTemplateError(null);
  };

  const tryInsertTemplateByCommand = async () => {
    const trimmed = message.trimStart();
    if (!trimmed.startsWith('/')) return false;

    // Extract first token (command)
    const firstSpaceIdx = trimmed.indexOf(' ');
    const commandToken = (firstSpaceIdx === -1 ? trimmed : trimmed.slice(0, firstSpaceIdx)).trim();
    if (commandToken.length < 2) return false; // at least '/a'

    setTemplateError(null);
    setIsResolvingTemplate(true);
    try {
      const res = await chatTemplateApi.getByCommand(commandToken);
      if (res.success && res.data) {
        const content = res.data.data.content;
        const remainder = firstSpaceIdx === -1 ? '' : trimmed.slice(firstSpaceIdx).trimStart();
        const newMessage = `${content}${remainder ? ` ${remainder}` : ''}`;
        setMessage(normalizeWhatsAppNewlines(newMessage));
        return true;
      } else {
        setTemplateError(res.error?.message || 'Template tidak ditemukan');
        return false;
      }
    } catch (e) {
      setTemplateError(e instanceof Error ? e.message : 'Gagal mengambil template');
      return false;
    } finally {
      setIsResolvingTemplate(false);
    }
  };

  // 🆕 Detect /command typing and fetch suggestions
  useEffect(() => {
    const trimmed = message.trimStart();
    if (!trimmed.startsWith('/')) {
      setShowSuggestions(false);
      setCommandQuery('');
      setSuggestions([]);
      return;
    }

    const firstSpaceIdx = trimmed.indexOf(' ');
    const query = (firstSpaceIdx === -1 ? trimmed.slice(1) : trimmed.slice(1, firstSpaceIdx)).toLowerCase();
    setCommandQuery(query);

    let cancelled = false;
    setIsSuggestLoading(true);

    const fetchSuggestions = async () => {
      try {
        // Use list endpoint with search, then filter by command prefix to be safe
        const res = await chatTemplateApi.list({ page: 1, limit: 10, search: query, isActive: true });
        if (!res.success || !res.data) throw new Error(res.error?.message || 'Gagal memuat template');
        const items = res.data.data || [];
        const filtered = items.filter(t => (t.commands || '').toLowerCase().startsWith(`/${query}`));
        if (!cancelled) {
          setSuggestions(filtered);
          setSuggestIndex(0);
          setShowSuggestions(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Gagal memuat suggestion template', err);
          setSuggestions([]);
          setShowSuggestions(true); // still show panel with "no results"
        }
      } finally {
        if (!cancelled) setIsSuggestLoading(false);
      }
    };

    const handle = setTimeout(fetchSuggestions, 200); // debounce
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [message]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Navigation within suggestions
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestIndex((i) => (suggestions.length ? (i + 1) % suggestions.length : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestIndex((i) => (suggestions.length ? (i - 1 + suggestions.length) % suggestions.length : 0));
        return;
      }
      if (e.key === 'Enter') {
        if (suggestions[suggestIndex]) {
          e.preventDefault();
          acceptTemplate(suggestions[suggestIndex]);
          return;
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }

    // Insert template on Tab when typing a command
    if (e.key === 'Tab') {
      if (showSuggestions && suggestions[suggestIndex]) {
        e.preventDefault();
        acceptTemplate(suggestions[suggestIndex]);
        return;
      }
      const didInsert = await tryInsertTemplateByCommand();
      if (didInsert) {
        e.preventDefault();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (showSuggestions) {
        // When suggestions visible, Enter is handled in onKeyDown to accept; block sending
        e.preventDefault();
        return;
      }
      e.preventDefault();
      handleSend();
    }
  };

  const isTypingCommand = message.trimStart().startsWith('/');

  return (
    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
      {/* 🆕 Show send error if any */}
      {sendError && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Gagal mengirim pesan: {sendError}</span>
        </div>
      )}

      {/* 🆕 Template fetch error */}
      {templateError && (
        <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">
          {templateError}
        </div>
      )}

      {/* 🆕 Show warning if no sessionId (not connected) */}
      {!sessionId && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm flex items-center gap-2">
          <div className="w-4 h-4">⚠️</div>
          <span>WhatsApp belum terhubung. Tidak dapat mengirim pesan.</span>
        </div>
      )}
      
      <div className="flex items-end gap-3">
        {/* Attachment Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-shrink-0"
          disabled={!sessionId}
        >
          <Paperclip className="w-5 h-5 text-gray-600" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <div className="flex items-end bg-white rounded-lg border border-gray-200 focus-within:border-green-500">
            <div className="flex-1">
              <div className="relative">
                {/* Formatted overlay (behind textarea) */}
                {message && (
                  <div
                    aria-hidden
                    className="absolute inset-0 px-3 py-2 text-sm whitespace-pre-wrap text-gray-900 pointer-events-none"
                    style={{ fontSynthesis: 'none' }}
                  >
                    <div className="leading-5 tracking-normal">{renderWhatsAppFormatted(message, { preview: true })}</div>
                  </div>
                )}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(normalizeWhatsAppNewlines(e.target.value))}
                  onKeyDown={handleKeyDown}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    !sessionId ? "WhatsApp belum terhubung — Anda tetap bisa menulis pesan dan memasukkan template" :
                    !contactNumber ? "Contact number diperlukan untuk mengirim pesan — Anda tetap bisa menulis" :
                    "Ketik pesan atau /command (Tab untuk memasukkan template)"
                  }
                  disabled={isSending}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  autoComplete="off"
                  className="w-full px-3 py-2 text-sm leading-5 font-normal tracking-normal resize-none border-none outline-none rounded-lg max-h-20 min-h-[40px] disabled:bg-gray-100 disabled:text-gray-400 bg-transparent relative z-10"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '40px',
                    maxHeight: '80px',
                    color: message ? 'transparent' : undefined,
                    caretColor: '#111827',
                    fontSynthesis: 'none'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
              </div>
              {/* 🆕 Command hint */}
              {isTypingCommand && (
                <div className="px-3 pb-1 text-xs text-gray-500">
                  {isResolvingTemplate ? 'Memuat template…' : 'Ketik command, tekan Tab/Enter untuk memilih template'}
                </div>
              )}
              {/* Removed separate preview; formatting is now inline */}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-shrink-0 mr-2"
              disabled={!sessionId}
            >
              <Smile className="w-5 h-5 text-gray-600" />
            </Button>
          </div>

          {/* 🆕 Suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 bottom-full mb-2 z-20">
              <div className="bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                {isSuggestLoading && (
                  <div className="px-3 py-2 text-xs text-gray-500">Memuat…</div>
                )}
                {!isSuggestLoading && suggestions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">Tidak ada command cocok{commandQuery ? ` untuk \"${commandQuery}\"` : ''}</div>
                )}
                {!isSuggestLoading && suggestions.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); acceptTemplate(t); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-green-50 ${idx === suggestIndex ? 'bg-green-50' : ''}`}
                    title={t.name}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-green-700 whitespace-nowrap">{t.commands}</span>
                      <span className="text-gray-600 truncate">{t.name}</span>
                    </div>
                  </button>
                ))}
                <div className="px-3 py-2 border-t text-[11px] text-gray-500 bg-gray-50">
                  Enter/Tab: pilih • ↑/↓: navigasi • Esc: tutup
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Send Button or Mic */}
        {message.trim() ? (
          <Button 
            onClick={handleSend}
            disabled={isSending || !sessionId || !contactNumber}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 p-0 flex-shrink-0 disabled:opacity-50"
            title={!sessionId ? "WhatsApp belum terhubung" : !contactNumber ? "Contact number diperlukan" : "Kirim pesan"}
          >
            {isSending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-shrink-0 text-gray-600 rounded-full w-10 h-10 p-0"
            disabled={!sessionId}
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
