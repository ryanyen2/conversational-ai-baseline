import { useEffect, useState } from "react";
import {
    AiOutlinePlus,
    AiOutlineSetting,
} from "react-icons/ai";
import { FiSearch, FiMessageSquare } from "react-icons/fi";
import { MdLogout } from "react-icons/md";
import { FaDownload } from "react-icons/fa";
import type { ChatHistory } from "@/app/types/type";
import { TiExport } from "react-icons/ti";

const Sidebar = ({
    onNewChat,
    chatHistories,
    onSwitchChat,
    exportConversations,
    onSearch,
    exportLogs
}: {
    onNewChat: () => void;
    chatHistories: ChatHistory[];
    onSwitchChat: (chatId: string) => void;
    exportConversations: () => void;
    onSearch: (keyword: string) => void;
    exportLogs: () => void;
}) => {

    const [searchKeyword, setSearchKeyword] = useState('');
    const [filteredChats, setFilteredChats] = useState(chatHistories);
    const [typingTimeout, setTypingTimeout] = useState<any>(null);

    const handleSearch = (event: any) => {
        setSearchKeyword(event.target.value);
        const keyword = event.target.value.toLowerCase();
        const filtered = chatHistories.filter(chat =>
            chat.messages.some(message => message.content.toLowerCase().includes(keyword))
        );
        setFilteredChats(filtered);

        // only store search event if not typing after 1 second
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
        setTypingTimeout(setTimeout(() => {
            onSearch(keyword);
        }, 1000));
    }

    useEffect(() => {
        if (searchKeyword === '') {
            setFilteredChats(chatHistories);
        } else {
            const filtered = chatHistories.filter(chat =>
                chat.messages.some(message => message.content.toLowerCase().includes(searchKeyword))
            );
            setFilteredChats(filtered);
        }
    }, [chatHistories]);

    return (
        <div className="scrollbar-trigger flex h-full w-full flex-1 items-start border-white/20">
            <nav className="flex h-full flex-1 flex-col space-y-1 p-2 w-full">
                {/* <a className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-1 flex-shrink-0 border border-white/20">
                    <FiSearch className="h-4 w-4" />
                    Find Chat
                </a> */}
                <label className="flex py-3 px-3 items-center gap-3 rounded-md bg-gray-500/100 hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-1 flex-shrink-0 border border-white/20">
                    <FiSearch className="h-4 w-4" />
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={handleSearch}
                        className="bg-transparent text-white"
                        placeholder="Find Chat"
                    />
                </label>
                {/* <input
                    type="text"
                    value={searchKeyword}
                    onChange={handleSearch}
                    className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-1 flex-shrink-0 border border-white/20"
                    placeholder="Find Chat"
                /> */}
                <a
                    className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-1 flex-shrink-0 border border-white/20"
                    onClick={onNewChat}
                >
                    <AiOutlinePlus className="h-4 w-4" />
                    New chat
                </a>
                <div className="flex-col flex-1 overflow-y-auto border-b border-white/20">
                    <div className="flex flex-col gap-1 pb-2 text-gray-100 text-sm">
                        {/* <a className="flex py-3 px-3 items-center gap-3 relative rounded-md hover:bg-[#2A2B32] cursor-pointer break-all hover:pr-4 group">
                            <FiMessageSquare className="h-4 w-4" />
                            <div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
                                New conversation
                                <div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-gray-900 group-hover:from-[#2A2B32]"></div>
                            </div>
                        </a> */}
                        {filteredChats.map((chatHistory, index) => (
                            <a
                                key={index}
                                className={`flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-0 flex-shrink-0 border border-white/20 ${chatHistory.active ? 'border-blue-500' : ''}`}
                                onClick={() => onSwitchChat(chatHistory.chatId)}
                            >
                                <FiMessageSquare className="h-4 w-4" />
                                {chatHistory.userId}_{chatHistory.chatId}
                            </a>
                        ))}
                    </div>
                </div>
                <a
                    onClick={exportConversations}
                    className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm">
                    <FaDownload className="h-4 w-4" />
                    Download Chats
                </a>
                <a
                    onClick={exportLogs}
                    className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm">
                    <TiExport className="h-4 w-4" />
                    Export Logs
                </a>
                <a className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm">
                    <AiOutlineSetting className="h-4 w-4" />
                    Settings
                </a>
                <a className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm">
                    <MdLogout className="h-4 w-4" />
                    Log out
                </a>
            </nav>
        </div>
    );
};

export default Sidebar;
