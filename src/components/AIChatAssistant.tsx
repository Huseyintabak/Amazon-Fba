import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import { Product, Shipment } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatAssistantProps {
  products: Product[];
  shipments: Shipment[];
  totalRevenue: number;
  totalProfit: number;
  averageROI: number;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  products,
  shipments,
  totalRevenue,
  totalProfit,
  averageROI
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Merhaba! Ben AI asistanınızım. Amazon FBA işletmeniz hakkında sorularınızı yanıtlayabilirim. Örneğin: "En karlı ürünlerim hangileri?" veya "Bu ay neden kar düştü?"',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateSystemContext = () => {
    const topProducts = [...products]
      .filter(p => p.estimated_profit)
      .sort((a, b) => (b.estimated_profit || 0) - (a.estimated_profit || 0))
      .slice(0, 5);

    const lowProducts = [...products]
      .filter(p => p.estimated_profit !== undefined)
      .sort((a, b) => (a.estimated_profit || 0) - (b.estimated_profit || 0))
      .slice(0, 5);

    const recentShipments = [...shipments]
      .sort((a, b) => new Date(b.shipment_date).getTime() - new Date(a.shipment_date).getTime())
      .slice(0, 5);

    return `
Sen Amazon FBA işletmesi için AI asistansın. Kullanıcıya Türkçe yanıt ver.

İŞLETME VERİLERİ:
- Toplam Ürün: ${products.length}
- Toplam Gelir: $${(totalRevenue || 0).toFixed(2)}
- Toplam Kar: $${(totalProfit || 0).toFixed(2)}
- Ortalama ROI: ${(averageROI || 0).toFixed(1)}%
- Toplam Sevkiyat: ${shipments.length}

EN KARLI 5 ÜRÜN:
${topProducts.map(p => `- ${p.name}: $${p.estimated_profit?.toFixed(2)} kar, %${p.profit_margin?.toFixed(1)} margin`).join('\n')}

EN DÜŞÜK PERFORMANS:
${lowProducts.map(p => `- ${p.name}: $${p.estimated_profit?.toFixed(2)} kar`).join('\n')}

SON SEVKİYATLAR:
${recentShipments.map(s => `- ${s.fba_shipment_id}: ${new Date(s.shipment_date).toLocaleDateString('tr-TR')}`).join('\n')}

GÖREV:
- Kısa ve net yanıtlar ver (max 3-4 cümle)
- Sayıları kullan
- Actionable öneriler sun
- Emoji kullan 📊 💰 📈
- Türkçe konuş
`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: generateSystemContext()
          },
          ...messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          {
            role: 'user',
            content: input.trim()
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const aiResponse = response.choices[0]?.message?.content || 'Üzgünüm, yanıt oluşturamadım.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    '💰 En karlı ürünlerim hangileri?',
    '📉 Bu ay neden kar düştü?',
    '🎯 Hangi ürünlere odaklanmalıyım?',
    '📦 Stok durumum nasıl?',
    '💡 Kar artırmak için ne yapmalıyım?'
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center group"
          title="AI Chat Asistan"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🤖</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className="text-3xl">🤖</span>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-bold">AI Asistan</h3>
                <p className="text-xs text-blue-100">Powered by GPT-4o-mini</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Hızlı Sorular:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.slice(0, 3).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="text-xs bg-white hover:bg-blue-50 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Bir soru sorun..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? '...' : '➤'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;

