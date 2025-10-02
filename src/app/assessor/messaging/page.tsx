
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Archive,
  File,
  Inbox,
  Search,
  Send,
  Trash2,
  Paperclip,
  Smile,
} from 'lucide-react';
import * as React from 'react';

const conversations = [
  { name: 'Sarah Johnson (Student)', lastMessage: 'Thanks for the feedback on my last assessment!', time: '10m', avatar: 'https://picsum.photos/seed/student1/100/100' },
  { name: 'RTO Admin', lastMessage: 'Reminder: Final assessments for the current...', time: '1h', avatar: 'https://picsum.photos/seed/rto-admin/100/100', isGroup: true },
  { name: 'Ben Carter (Student)', lastMessage: 'I have a question about the evidence for UOC-002.', time: '3h', avatar: 'https://picsum.photos/seed/student2/100/100' },
];

const messages = [
    { sender: 'Sarah Johnson', text: 'Thanks for the feedback on my last assessment!', time: '10:30 AM', isOwn: false },
    { sender: 'You', text: 'You\'re welcome, Sarah! You showed great improvement.', time: '10:32 AM', isOwn: true },
];

export default function AssessorMessagingPage() {
    const [selectedConv, setSelectedConv] = React.useState(conversations[0]);
  return (
    <div className="h-[calc(100vh-4rem-1px)] flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4">
        {/* Sidebar */}
        <div className="col-span-1 border-r bg-slate-100/50 flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold font-headline text-slate-800">Messaging</h1>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9 h-9" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {conversations.map(conv => (
                <button
                key={conv.name}
                onClick={() => setSelectedConv(conv)}
                className={`w-full text-left p-4 border-b hover:bg-slate-200/50 transition-colors ${selectedConv.name === conv.name ? 'bg-slate-200' : ''}`}
              >
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        {conv.avatar && <AvatarImage src={conv.avatar} />}
                        <AvatarFallback>{conv.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold truncate">{conv.name}</p>
                            <p className="text-xs text-muted-foreground">{conv.time}</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="col-span-3 lg:col-span-4 xl:col-span-3 flex flex-col">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        {selectedConv.avatar && <AvatarImage src={selectedConv.avatar} />}
                        <AvatarFallback>{selectedConv.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{selectedConv.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {selectedConv.isGroup ? 'Announcement Channel' : 'Online'}
                        </p>
                    </div>
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-6 bg-slate-50">
                <div className="space-y-6">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.isOwn ? 'justify-end' : ''}`}>
                      {!msg.isOwn && (
                        <Avatar className="h-8 w-8">
                             <AvatarImage src={selectedConv.avatar} />
                             <AvatarFallback>{selectedConv.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-md p-3 rounded-lg ${msg.isOwn ? 'bg-primary text-primary-foreground' : 'bg-white shadow-sm'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                      </div>
                       {msg.isOwn && (
                        <Avatar className="h-8 w-8">
                             <AvatarImage src="https://picsum.photos/seed/assessor/100/100" />
                             <AvatarFallback>J</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-4 border-t bg-white">
                <div className="relative">
                  <Input placeholder={`Message ${selectedConv.name}...`} className="pr-24 h-12" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon"><Smile className="h-5 w-5" /></Button>
                    <Button size="icon"><Send className="h-5 w-5"/></Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Inbox className="h-16 w-16 text-slate-300 mx-auto"/>
                    <p className="mt-4 text-lg font-semibold text-muted-foreground">Select a conversation to start messaging</p>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
