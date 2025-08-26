import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import usePolling from '../../hooks/usePolling';
import {
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
  formatMessageTime,
  getConversationDisplayName,
  truncateMessage,
} from '../../services/messages';

const ClientMessages = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversations
  const loadConversations = async () => {
    const result = await getConversations();
    if (result.success) {
      setConversations(result.data);
    } else {
      showToast('Erreur lors du chargement des conversations', 'error');
    }
    setIsLoading(false);
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId) => {
    const result = await getMessages(conversationId);
    if (result.success) {
      setMessages(result.data.messages);
      scrollToBottom();
    } else {
      showToast('Erreur lors du chargement des messages', 'error');
    }
  };

  // Send new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    const result = await sendMessage(selectedConversation._id, {
      body: newMessage.trim(),
    });

    if (result.success) {
      setMessages(prev => [...prev, result.data]);
      setNewMessage('');
      scrollToBottom();
      
      // Update conversation list
      await loadConversations();
    } else {
      showToast(result.error, 'error');
    }
    
    setIsSending(false);
  };

  // Delete conversation
  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      return;
    }

    const result = await deleteConversation(conversationId);
    if (result.success) {
      setConversations(prev => prev.filter(c => c._id !== conversationId));
      if (selectedConversation?._id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      showToast('Conversation supprimée', 'info');
    } else {
      showToast(result.error, 'error');
    }
  };

  // Select conversation and load messages
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation._id);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Initial load
  useEffect(() => {
    loadConversations();
  }, []);

  // Polling for new messages
  usePolling(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
    }
    loadConversations();
  }, 5000, [selectedConversation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 ${selectedConversation ? 'hidden md:block' : ''}`}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              </div>
              
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 73px)' }}>
                {conversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Aucune conversation</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?._id === conversation._id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {getConversationDisplayName(conversation, user._id)}
                          </h3>
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {truncateMessage(conversation.lastMessage.content)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end ml-2">
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(conversation.lastMessage.sentAt)}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conversation._id);
                            }}
                            className="text-gray-400 hover:text-red-600 mt-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className={`w-full md:w-2/3 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
              {selectedConversation ? (
                <>
                  {/* Messages Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden mr-3 text-gray-600"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getConversationDisplayName(selectedConversation, user._id)}
                    </h3>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.senderId._id === user._id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId._id === user._id
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.body}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId._id === user._id
                                ? 'text-primary-200'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        className="flex-1 input"
                        disabled={isSending}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="btn btn-primary"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-gray-600">
                      Choisissez une conversation pour commencer à échanger.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMessages;
