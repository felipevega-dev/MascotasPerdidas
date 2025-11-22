import { db } from '../lib/firebase';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    getDocs,
    Timestamp,
    doc,
    updateDoc,
    getDoc
} from 'firebase/firestore';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    petId: string;
    petName: string;
    text: string;
    imageUrl?: string;
    createdAt: string;
    read: boolean;
}

export interface Conversation {
    id: string;
    petId: string;
    petName: string;
    ownerId: string;
    ownerName: string;
    contactId: string;
    contactName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

const MESSAGES_COLLECTION = 'messages';
const CONVERSATIONS_COLLECTION = 'conversations';

// Create or get a conversation
export async function getOrCreateConversation(
    petId: string,
    petName: string,
    ownerId: string,
    ownerName: string,
    contactId: string,
    contactName: string
): Promise<string> {
    try {
        // Check if conversation already exists
        const q = query(
            collection(db, CONVERSATIONS_COLLECTION),
            where('petId', '==', petId),
            where('ownerId', '==', ownerId),
            where('contactId', '==', contactId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id;
        }
        
        // Create new conversation
        const conversationData = {
            petId,
            petName,
            ownerId,
            ownerName,
            contactId,
            contactName,
            lastMessage: '',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
        };
        
        const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), conversationData);
        return docRef.id;
    } catch (error) {
        console.error('Error getting/creating conversation:', error);
        throw error;
    }
}

// Send a message
export async function sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    receiverId: string,
    petId: string,
    petName: string,
    text: string,
    imageUrl?: string
): Promise<void> {
    try {
        const messageData = {
            conversationId,
            senderId,
            senderName,
            receiverId,
            petId,
            petName,
            text,
            imageUrl: imageUrl || null,
            createdAt: new Date().toISOString(),
            read: false,
        };
        
        await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
        
        // Update conversation
        const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
        await updateDoc(conversationRef, {
            lastMessage: text,
            lastMessageTime: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

// Get messages for a conversation (real-time)
export function subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
): () => void {
    const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages: Message[] = [];
        querySnapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() } as Message);
        });
        callback(messages);
    });
    
    return unsubscribe;
}

// Get conversations for a user
export function subscribeToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
): () => void {
    const q1 = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('ownerId', '==', userId),
        orderBy('lastMessageTime', 'desc')
    );
    
    const q2 = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('contactId', '==', userId),
        orderBy('lastMessageTime', 'desc')
    );
    
    // For simplicity, we'll just use one query (in production, combine both)
    const unsubscribe = onSnapshot(q1, async (querySnapshot) => {
        const conversations: Conversation[] = [];
        querySnapshot.forEach((doc) => {
            conversations.push({ id: doc.id, ...doc.data() } as Conversation);
        });
        
        // Also get conversations where user is contact
        const snapshot2 = await getDocs(q2);
        snapshot2.forEach((doc) => {
            conversations.push({ id: doc.id, ...doc.data() } as Conversation);
        });
        
        // Sort by last message time
        conversations.sort((a, b) => 
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
        
        callback(conversations);
    });
    
    return unsubscribe;
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
        const q = query(
            collection(db, MESSAGES_COLLECTION),
            where('conversationId', '==', conversationId),
            where('receiverId', '==', userId),
            where('read', '==', false)
        );
        
        const querySnapshot = await getDocs(q);
        const updatePromises = querySnapshot.docs.map(doc => 
            updateDoc(doc.ref, { read: true })
        );
        
        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
}
