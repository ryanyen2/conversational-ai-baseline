
'use client';

import { type Message, useChat } from 'ai/react';
import { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { BsChevronDown, BsPlusLg } from "react-icons/bs";
import { RxHamburgerMenu } from "react-icons/rx";
import ChatMessage from './Message';
import useAutoResizeTextArea from '../hooks/useAutoResizeTextArea';
import type { ChatHistory } from "@/app/types/type";

export default function Chat({
    onNewMessages,
    currentChat,
    onResponseFinish
}: {
    onNewMessages: (messages: Message[]) => void;
    currentChat: ChatHistory | null;
    onResponseFinish: (message: Message) => void;
}) {
    const { messages, input, setMessages, handleInputChange, handleSubmit, isLoading } = useChat({
        onFinish: (message: Message) => {
            onResponseFinish(message);
        },
    });
    const textAreaRef = useAutoResizeTextArea();
    const bottomOfChatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomOfChatRef.current) {
            bottomOfChatRef.current.scrollIntoView({ behavior: "smooth" });
        }
        if (messages.length > 0) handleNewMessages(messages);
    }, [messages]);

    
    const handleNewMessages = (messages: Message[]) => {
        onNewMessages(messages);
    }


    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "24px";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [input, textAreaRef]);
    

    // if change currentChat, reset
    useEffect(() => {
        if (currentChat) {
            setMessages(currentChat.messages);
        }
    }, [currentChat]);


    const handleKeypress = (e: any) => {
        if (e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex max-w-full flex-1 flex-col">
            <div className="sticky top-0 z-10 flex items-center border-b border-white/20 bg-gray-800 pl-1 pt-1 text-gray-200 sm:pl-3 md:hidden">
                <button
                    type="button"
                    className="-ml-0.5 -mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:hover:text-white"
                >
                    <span className="sr-only">Open sidebar</span>
                    <RxHamburgerMenu className="h-6 w-6 text-white" />
                </button>
                <h1 className="flex-1 text-center text-base font-normal">New chat</h1>
                <button type="button" className="px-3">
                    <BsPlusLg className="h-6 w-6" />
                </button>
            </div>
            <div className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
                <div className="flex-1 overflow-hidden">
                    <div className="react-scroll-to-bottom--css-ikyem-79elbk h-full dark:bg-gray-800 overflow-y-auto">
                        <div className="react-scroll-to-bottom--css-ikyem-1n7m0yu">
                            {currentChat && currentChat.messages.length > 0 ? (
                                <div className="flex flex-col items-center text-sm bg-gray-800">
                                    {currentChat?.messages.map((message, index)  => (
                                        <ChatMessage key={index} message={message} />
                                    ))}
                                    <div className="w-full h-32 md:h-48 flex-shrink-0"></div>
                                    <div ref={bottomOfChatRef}></div>
                                </div>
                            ) : null}
                            <div className="flex flex-col items-center text-sm dark:bg-gray-800"></div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-vert-light-gradient bg-white dark:bg-gray-800 md:!bg-transparent dark:md:bg-vert-dark-gradient pt-2">
                    {/* <form onSubmit={handleSubmit}>
                        <label>
                            Say something...
                            <input value={input} onChange={handleInputChange} />
                        </label>
                        <button type="submit">Send</button>
                    </form> */}
                    <form className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl" onSubmit={handleSubmit}>
                        <div className="relative flex flex-col h-full flex-1 items-stretch md:flex-col">
                            <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
                                <textarea
                                    ref={textAreaRef}
                                    value={input}
                                    tabIndex={0}
                                    data-id="root"
                                    onChange={handleInputChange}
                                    style={{
                                        height: "24px",
                                        maxHeight: "200px",
                                        overflowY: "hidden",
                                    }}
                                    onKeyDown={handleKeypress}
                                    placeholder="Send a message..."
                                    className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                                ></textarea>
                                <button
                                    disabled={isLoading || input?.length === 0}
                                    type='submit'
                                    className="absolute p-1 rounded-md bottom-1.5 md:bottom-2.5 bg-transparent disabled:bg-gray-500 right-1 md:right-2 disabled:opacity-40"
                                >
                                    <FiSend className="h-4 w-4 mr-1 text-white " />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}