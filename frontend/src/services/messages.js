import { apiRequest, handleApiError } from './api';

// Get all conversations
export const getConversations = async () => {
  try {
    const response = await apiRequest.get('/api/messages/conversations');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// Create or get conversation
export const createOrGetConversation = async (participantId, appointmentId = null) => {
  try {
    const response = await apiRequest.post('/api/messages/conversations', {
      participantId,
      appointmentId,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// Get messages for conversation
export const getMessages = async (conversationId, page = 1, limit = 50) => {
  try {
    const response = await apiRequest.get(
      `/api/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// Send message
export const sendMessage = async (conversationId, messageData) => {
  try {
    const response = await apiRequest.post(
      `/api/messages/conversations/${conversationId}/messages`,
      messageData
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// Delete conversation
export const deleteConversation = async (conversationId) => {
  try {
    const response = await apiRequest.delete(`/api/messages/conversations/${conversationId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// Get unread count
export const getUnreadCount = async () => {
  try {
    const response = await apiRequest.get('/api/messages/unread-count');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// Format message time
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 24 * 7) {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
};

// Get participant display name
export const getParticipantDisplayName = (participant, currentUserId) => {
  if (participant._id === currentUserId) {
    return 'Vous';
  }
  
  if (participant.role === 'pro') {
    return participant.companyName || `${participant.firstName} ${participant.lastName}`;
  }
  
  return `${participant.firstName} ${participant.lastName}`;
};

// Get conversation display name
export const getConversationDisplayName = (conversation, currentUserId) => {
  const otherParticipant = conversation.participants.find(
    p => p._id !== currentUserId
  );
  
  return getParticipantDisplayName(otherParticipant, currentUserId);
};

// Truncate message for preview
export const truncateMessage = (message, maxLength = 50) => {
  if (message.length <= maxLength) {
    return message;
  }
  return message.substring(0, maxLength) + '...';
};
