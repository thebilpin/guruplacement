
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Bot,
  Mic,
  FileText,
  Briefcase,
  PenSquare,
  Sparkles,
  Send,
  User,
  School,
  Star,
  Camera,
  Video,
  RefreshCw,
  MessageCircle,
  Clock,
  Target,
  Zap,
  BookOpen,
  Users,
  Search,
  Plus,
  History,
  Trash2,
  Lightbulb,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface AIAssistantData {
  student: {
    id: string;
    name: string;
    course: string;
    skills?: string[];
    interests?: string[];
    careerGoals?: string;
  };
  conversations: ConversationHistory[];
  recentMessages: Message[];
  quickActions: Array<{
    id: string;
    title: string;
    description: string;
    category: 'career' | 'resume' | 'interview';
    prompt: string;
  }>;
  statistics: {
    totalConversations: number;
    totalMessages: number;
    lastActivity: string;
  };
}

export default function AiAssistantPage() {
  const { user } = useAuth();
  const [assistantData, setAssistantData] = useState<AIAssistantData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Chat-specific state
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Computed properties
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Fetch AI assistant data
  const fetchAssistantData = async () => {
    if (!user?.uid) return;

    try {
      console.log('🤖 Fetching AI assistant data...');
      const response = await fetch(`/api/student/ai-assistant?studentId=${user.uid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI assistant data');
      }

      const result = await response.json();
      if (result.success) {
        setAssistantData(result.data);
        console.log('✅ AI assistant data loaded successfully');
      } else {
        throw new Error(result.error || 'Failed to load AI assistant data');
      }
    } catch (error) {
      console.error('Error fetching AI assistant data:', error);
      toast({
        title: "Error",
        description: "Failed to load AI assistant data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  // Create new conversation
  const createNewConversation = async () => {
    if (!user?.uid) return;
    
    try {
      const response = await fetch('/api/student/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.uid,
          action: 'create_conversation',
          title: 'New Conversation'
        })
      });

      const result = await response.json();
      if (result.success && result.conversation) {
        setConversations(prev => [result.conversation, ...prev]);
        setActiveConversationId(result.conversation.id);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error Creating Conversation",
        description: "Failed to create new conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    if (!user?.uid) return;
    
    try {
      const response = await fetch('/api/student/ai-assistant', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.uid,
          conversationId
        })
      });

      const result = await response.json();
      if (result.success) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (activeConversationId === conversationId) {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error Deleting Conversation",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !user?.uid) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/student/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.uid,
          action: 'send_message',
          message: messageContent,
          conversationId: activeConversationId
        })
      });

      const result = await response.json();
      if (result.success && result.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Update conversations list
        if (result.conversation) {
          setConversations(prev => 
            prev.map(c => c.id === result.conversation.id ? result.conversation : c)
          );
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error Sending Message",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  // Handle quick actions
  const handleQuickAction = (message: string) => {
    setNewMessage(message);
    setTimeout(() => sendMessage(), 100);
  };

  // Load conversation messages
  useEffect(() => {
    if (activeConversation) {
      setMessages(activeConversation.messages || []);
    }
  }, [activeConversation]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch data on component mount
  useEffect(() => {
    fetchAssistantData();
  }, [user?.uid]);



  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-full">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold font-headline text-slate-800">
                AI Career Assistant
              </h1>
              <p className="text-muted-foreground">
                {assistantData?.student ? 
                  `${assistantData.student.name} - ${assistantData.statistics.totalConversations} conversations` : 
                  'Your personal coach for resume building, mock interviews, and career advice.'
                }
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={fetchAssistantData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={createNewConversation}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
        </div>
      </header>

      {/* Dynamic Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Conversation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Conversations</h3>
            <Button size="sm" onClick={createNewConversation}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  activeConversationId === conv.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  AI Career Assistant
                </CardTitle>
                {activeConversation && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteConversation(activeConversation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardDescription>
                Get personalized career advice and guidance
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Messages Area */}
              <div 
                ref={messagesEndRef}
                className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px] max-h-[500px] p-4 border rounded-lg bg-gray-50/30"
              >
                {loading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="text-center">
                      <Bot className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Welcome to Your AI Career Assistant!</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-md">
                        I'm here to help you navigate your career journey. I can assist with career planning, skill development, job search strategies, and interview preparation.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className={message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </Avatar>
                      <div className={`flex-1 p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-50 ml-12' : 'bg-white border mr-12'}`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {loading && messages.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="bg-gray-600 text-white">
                      <Bot className="h-4 w-4" />
                    </Avatar>
                    <div className="flex-1 bg-white border p-3 rounded-lg mr-12">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..." 
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={loading}
                  />
                  <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickAction("I need career advice for my field. What should I focus on?")}
                    disabled={loading}
                  >
                    <Lightbulb className="mr-2 h-3 w-3" />
                    Career Advice
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickAction("What skills should I develop to advance in my career?")}
                    disabled={loading}
                  >
                    <Target className="mr-2 h-3 w-3" />
                    Skill Development
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickAction("Can you give me some interview tips and preparation strategies?")}
                    disabled={loading}
                  >
                    <MessageCircle className="mr-2 h-3 w-3" />
                    Interview Tips
                  </Button>  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickAction("How can I improve my job search strategy?")}
                    disabled={loading}
                  >
                    <Briefcase className="mr-2 h-3 w-3" />
                    Job Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Avatar component for chat messages
function Avatar({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${className}`}>
      {children}
    </div>
  )
}

    