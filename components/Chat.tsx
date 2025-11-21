import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User } from '../types';
import { MOCK_CHATS, addChatMessage } from '../services/mockData';
import { translateText } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, Input, VoiceInput, Card, Badge } from './Shared';
import { Send, X, Languages } from 'lucide-react';

interface ChatProps {
    currentUser: User;
    targetUser: { id: string; name: string; language?: string }; // target user simplified
    onClose: () => void;
}

export const ChatWindow: React.FC<ChatProps> = ({ currentUser, targetUser, onClose }) => {
    const { language: myLang, t } = useLanguage();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Filter chats between these two users
        const relevantChats = MOCK_CHATS.filter(m => 
            (m.senderId === currentUser.id && m.receiverId === targetUser.id) ||
            (m.senderId === targetUser.id && m.receiverId === currentUser.id)
        ).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(relevantChats);
    }, [currentUser.id, targetUser.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, translatedMessages]);

    // Auto-translate incoming messages
    useEffect(() => {
        const translateIncoming = async () => {
            const incoming = messages.filter(m => m.senderId !== currentUser.id);
            for (const msg of incoming) {
                if (!translatedMessages[msg.id]) {
                     // If message language is different from my language, translate
                     if (msg.originalLanguage !== myLang) {
                         const translation = await translateText(msg.text, msg.originalLanguage, myLang);
                         setTranslatedMessages(prev => ({ ...prev, [msg.id]: translation }));
                     }
                }
            }
        };
        translateIncoming();
    }, [messages, myLang, currentUser.id]);

    const handleSend = () => {
        if (!newMessage.trim()) return;

        const msg: any = {
            senderId: currentUser.id,
            receiverId: targetUser.id,
            text: newMessage,
            originalLanguage: myLang
        };

        addChatMessage(msg);
        // Optimistic update
        setMessages(prev => [...prev, { ...msg, id: Date.now().toString(), timestamp: Date.now() }]);
        setNewMessage('');
    };

    return (
        <Card className="fixed bottom-4 right-4 w-80 sm:w-96 h-[500px] flex flex-col shadow-2xl border-0 z-50 animate-fade-in-up">
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white rounded-t-xl">
                <div>
                    <h3 className="font-bold flex items-center">
                        {targetUser.name}
                    </h3>
                    <div className="text-xs text-indigo-200 flex items-center mt-0.5">
                        <Languages className="w-3 h-3 mr-1" />
                        {t('translated_from')} {targetUser.language || 'en'}
                    </div>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map(msg => {
                    const isMe = msg.senderId === currentUser.id;
                    const translation = translatedMessages[msg.id];

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                                {translation && !isMe ? (
                                    <>
                                        <div className="font-medium text-sm">{translation}</div>
                                        <div className="text-xs opacity-60 mt-1 pt-1 border-t border-gray-200/20 italic">
                                            {t('original')}: {msg.text}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-sm">{msg.text}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t flex gap-2 items-center rounded-b-xl">
                <div className="flex-1 relative">
                     <input 
                        className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={t('chat_placeholder')}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                     />
                     <div className="absolute right-1 top-1">
                         <VoiceInput onResult={setNewMessage} />
                     </div>
                </div>
                <Button size="sm" className="rounded-full w-10 h-10 p-0 flex items-center justify-center" onClick={handleSend}>
                    <Send className="w-4 h-4 ml-0.5" />
                </Button>
            </div>
        </Card>
    );
};