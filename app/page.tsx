'use client';

import { useEffect, useState, useRef } from "react";
import Chat from "@/app/components/Chat";
import Sidebar from "@/app/components/Sidebar";
import type { ChatHistory } from "@/app/types/type";
import { type Message } from 'ai/react';
// import moment from "moment";

import { addCollection, getCollection } from "./lib/firebase";

export default function Home() {
  const [userId, setUserId] = useState<string>("");
  const [chats, setChats] = useState<ChatHistory[]>([]);
  // const [currentChatId, setCurrentChatId] = useState<string>("");
  const currentChatId = useRef<string>("");
  const [currentChat, setCurrentChat] = useState<ChatHistory | null>(null);

  const [showDialog, setShowDialog] = useState(true);
  const [condition, setCondition] = useState('');

  const handleSubmitMeta = async (event: any) => {
    event.preventDefault();

    if (userId && condition) {
      localStorage.setItem("userId", userId);

      // addCollection(`${condition}-${userId}`, {
      //   action: "login",
      //   timestamp: new Date().toISOString(),
      // });

      const logs = await getCollection(`stage1-${userId}`);
      if (logs) {
        // get actions = 'chat', and group by chatId, and sort by timestamp
        let chats = logs.filter((log: any) => log.action === "chat");
        // sort by message.createdAt.seconds
        chats = chats.sort((a: any, b: any) => {
          const aTime = a.messages.length > 0 ? a.messages.slice(-1)[0].createdAt.seconds : 0;
          const bTime = b.messages.length > 0 ? b.messages.slice(-1)[0].createdAt.seconds : 0;
          return aTime - bTime;
        });
        if (chats && chats.length > 0) {
          const chatIds = chats.map((chat: any) => chat.chatId);
          const uniqueChatIds = Array.from(new Set(chatIds));

          const chatHistories = uniqueChatIds.map((chatId: string) => {
            const chatLogs = chats.filter((chat: any) => chat.chatId === chatId);
            const messages = chatLogs.map((chat: any) => chat.messages).flat();
            return {
              userId: userId,
              chatId: chatId,
              messages: messages,
              active: false,
            };
          });

          setChats(chatHistories);
        } else {
          handleNewChat();
        }
      }
    }
    setShowDialog(false);
  }

  const handleNewChat = async () => {
    const newChatId = chats.length + 1;
    const newChat = {
      userId: userId,
      chatId: newChatId.toString(),
      messages: [],
      active: true,
    };

    chats.forEach((chat) => {
      chat.active = false;
    });
    setChats([...chats, newChat]);
    currentChatId.current = newChat.chatId;
    setCurrentChat(newChat);

    // await addCollection(`${condition}-${userId}-${newChat.chatId}`, {
    //   chatId: newChat.chatId,
    //   messages: [],
    //   timestamp: new Date().toISOString(),
    // });
  }

  const handleSwitchChat = async (chatId: string) => {
    chats.forEach((chat) => {
      chat.active = chat.chatId === chatId;
    });
    currentChatId.current = chatId;
    setCurrentChat(chats.find(chat => chat.chatId === chatId) || null);

    await addCollection(`${condition}-${userId}`, {
      action: "switch_chat",
      chatId: chatId,
      timestamp: new Date().toISOString(),
    });
  }

  const handleNewMessages = (messages: Message[]) => {
    const newChats = chats.map((chat) => {
      if (chat.chatId === currentChatId.current && chat.userId === userId) {
        chat.messages = messages;
      }
      return chat;
    });
    setChats(newChats);
  }

  const handleResponseFinish = async (message: Message) => {
    await addCollection(`${condition}-${userId}`, {
      action: "chat",
      chatId: currentChatId.current,
      messages: [chats.find(chat => chat.chatId === currentChatId.current)?.messages.slice(-2)[0], message],
      timestamp: new Date().toISOString(),
    });
  }

  const handleExportConversations = async () => {
    // export all chats to a csv file
    // userId, condition, chatId, messageId, role, content, timestamp
    const logs = await getCollection(`${condition}-${userId}`);
    if (logs) {
      const chats = logs.filter((log: any) => log.action === "chat");
      const headers = "userId,condition,chatId,messageId,role,content,timestamp\n";
      const csv = chats.map((chat: any) => {
        return chat.messages.map((message: any) => {
          return `${userId},${condition},${chat.chatId},${message.id},${message.role},"${message.content.replace(/"/g, '""')}",${message.createdAt.seconds}`
        }).join('\n');
      }).join('\n');

      const blob = new Blob([headers + csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${condition}-${userId}.csv`;
      a.click();
    }
  }


  const handleExportLogs = async () => {
    // export all logs to a csv file
    // userId, condition, action, chatId, content, messageId, role, message_content, source, target, timestamp
    const logs = await getCollection(`${condition}-${userId}`);
    if (logs) {
      const headers = "userId,condition,action,chatId,content,messageId,role,message_content,source,target,timestamp\n";
      const csv = logs.flatMap((log: any) => {
        if (log.action === 'chat') {
          return log.messages.map((message: any) => {
            const content = message.content.replace(/"/g, '""').replace(/\n/g, ' ');
            return `${userId},${condition},${log.action},${log.chatId},,${message.id},${message.role},"${content}",,,${message.createdAt.seconds}`;
          });
        } else {
          const content = log.content ? log.content.replace(/"/g, '""').replace(/\n/g, ' ') : '';
          const timestamp_unix = new Date(log.timestamp).getTime() / 1000;
          return `${userId},${condition},${log.action},${log.chatId || ''},${content},,,,${log.source || ''},${log.target || ''},${timestamp_unix}`;
        }
      }).join('\n');

      const blob = new Blob([headers + csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${condition}-${userId}-logs.csv`;
      a.click();
    }
  }


  const handleSearch = async (keyword: string) => {
    // record 
    await addCollection(`${condition}-${userId}`, {
      action: "search",
      chatId: currentChatId.current,
      content: keyword,
      timestamp: new Date().toISOString(),
    });
  }


  useEffect(() => {
    const handleCopy = (event: any) => {
      const selection = document.getSelection() || "";
      event.clipboardData.setData("text/plain", selection.toString())

      addCollection(`${condition}-${userId}`, {
        action: "copy",
        chatId: currentChatId.current,
        content: selection.toString(),
        source: event.target.tagName,
        timestamp: new Date().toISOString(),
      });
    }

    const handlePaste = (event: any) => {
      addCollection(`${condition}-${userId}`, {
        action: "paste",
        chatId: currentChatId.current,
        content: event.clipboardData.getData('text'),
        target: event.target.tagName,
        timestamp: new Date().toISOString(),
      });
    }

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    }
  }, [userId, condition]);

  return (
    <main className="overflow-hidden w-full h-screen relative flex">
      {/* {isComponentVisible ? (
        <MobileSiderbar toggleComponentVisibility={toggleComponentVisibility} />
      ) : null} */}
      {showDialog && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <form onSubmit={handleSubmitMeta} className="p-4 rounded text-white bg-gray-800">
            <label>
              User ID:
              <input
                type="number"
                className="rounded text-black p-1 ml-2 mr-3"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </label>
            <label>
              Condition:
              <select
                className="rounded text-black p-1 ml-2 mr-3"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
              >
                <option value="">Select condition</option>
                <option value="stage1">Stage 1</option>
                <option value="baseline">Baseline</option>
              </select>
            </label>
            <button
              type="submit"
              className="rounded bg-blue-500 text-white px-2 py-1"
            >Submit</button>
          </form>
        </div>
      )}
      <div className="dark hidden flex-shrink-0 bg-gray-900 md:flex md:w-[200px] md:flex-col">
        <div className="flex h-full min-h-0 flex-col ">
          <Sidebar
            onNewChat={handleNewChat}
            chatHistories={chats}
            onSwitchChat={handleSwitchChat}
            exportConversations={handleExportConversations}
            onSearch={handleSearch}
            exportLogs={handleExportLogs}
          />
        </div>
      </div>
      <Chat
        currentChat={currentChat}
        onNewMessages={handleNewMessages}
        onResponseFinish={handleResponseFinish}
      />
    </main>
  );
}
