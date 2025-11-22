'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    Message, 
    subscribeToMessages, 
    sendMessage, 
    markMessagesAsRead 
} from '../utils/messaging';
import { XMarkIcon, PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import ImageUpload from './ImageUpload';
import toast from 'react-hot-toast';

interface ChatWindowProps {
    conversationId: string;
    petId: string;
    petName: string;
    otherUserId: string;
    otherUserName: string;
    onClose: () => void;
}

export default function ChatWindow({
    conversationId,
    petId,
    petName,
    otherUserId,
    otherUserName,
    onClose,
}: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!conversationId) return;

        const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
            setMessages(msgs);
            // Mark messages as read
            if (user) {
                markMessagesAsRead(conversationId, user.uid);
            }
        });

        return () => unsubscribe();
    }, [conversationId, user]);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !imageUrl) || !user || isSending) return;

        setIsSending(true);
        try {
            await sendMessage(
                conversationId,
                user.uid,
                user.displayName || 'Usuario',
                otherUserId,
                petId,
                petName,
                newMessage.trim(),
                imageUrl || undefined
            );
            setNewMessage('');
            setImageUrl(null);
            setShowImageUpload(false);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error al enviar el mensaje');
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
            {/* Header */}
            <div className="bg-primary-600 text-white p-4 rounded-t-xl flex items-center justify-between">
                <div>
                    <h3 className="font-bold">{otherUserName}</h3>
                    <p className="text-xs text-primary-100">Chat sobre {petName}</p>
                </div>
                <button onClick={onClose} className="hover:text-gray-200">
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        No hay mensajes aún. ¡Empieza la conversación!
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwn = message.senderId === user?.uid;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-lg p-3 ${
                                        isOwn
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-white border border-gray-200 text-gray-900'
                                    }`}
                                >
                                    {message.imageUrl && (
                                        <div className="relative w-full h-40 mb-2 rounded overflow-hidden">
                                            <Image
                                                src={message.imageUrl}
                                                alt="Mensaje"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    {message.text && (
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                            {message.text}
                                        </p>
                                    )}
                                    <p
                                        className={`text-xs mt-1 ${
                                            isOwn ? 'text-primary-100' : 'text-gray-400'
                                        }`}
                                    >
                                        {formatDistanceToNow(new Date(message.createdAt), {
                                            addSuffix: true,
                                            locale: es,
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Image Upload Preview */}
            {showImageUpload && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Agregar imagen</span>
                        <button
                            onClick={() => {
                                setShowImageUpload(false);
                                setImageUrl(null);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <ImageUpload
                        onImageSelect={(url) => setImageUrl(url)}
                        initialImage={imageUrl || undefined}
                    />
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowImageUpload(!showImageUpload)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Adjuntar imagen"
                    >
                        <PhotoIcon className="h-6 w-6" />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        disabled={isSending}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={(!newMessage.trim() && !imageUrl) || isSending}
                        className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
