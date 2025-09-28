import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../../config";
import { MessageSquare, ArrowLeft, Pin, Lock, Send, Clock, User, School } from "lucide-react";
import Swal from "sweetalert2";
import useSocket from "../../../hooks/useSocket";

const ThreadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const socket = useSocket();
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchThread();

    // Join thread room
    if (socket.current) {
      socket.current.emit("join_thread", id);

      // Listen for new messages
      socket.current.on("receive_message", (messageData) => {
        setMessages((prevMessages) => {
          // Cek jika pesan sudah ada (berdasarkan ID)
          if (prevMessages.some((msg) => msg.id === messageData.id)) {
            return prevMessages;
          }

          // Jika pesan adalah balasan
          if (messageData.parentId) {
            return prevMessages.map((msg) => {
              if (msg.id === messageData.parentId) {
                return {
                  ...msg,
                  replies: [...(msg.replies || []), messageData],
                };
              }
              return msg;
            });
          }

          // Jika pesan adalah pesan utama
          return [...prevMessages, messageData];
        });
      });
    }

    // Cleanup on unmount
    return () => {
      if (socket.current) {
        socket.current.emit("leave_thread", id);
        socket.current.off("receive_message");
      }
    };
  }, [id, socket]);

  const fetchThread = async () => {
    try {
      const response = await axios.get(`${API_URL}/discussion-threads/${id}`);
      setThread(response.data.data.thread);
      setMessages(response.data.data.messages);
    } catch (error) {
      console.error("Error fetching thread:", error);
      Swal.fire("Error", "Gagal memuat thread", "error");
      navigate("/discussion");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      // Jika menggunakan REST API
      await axios.post(`${API_URL}/discussion-threads/${id}/messages`, {
        message: newMessage,
        parentId: replyingTo || null,
      });

      // Pesan akan ditambahkan melalui socket, jadi tidak perlu di-set manual
      setNewMessage("");
      setReplyingTo(null);

      // Refresh thread untuk update last update time
      fetchThread();
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal mengirim pesan";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Memuat thread...</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 font-medium">Thread tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/super-admin/forum-diskusi")}
            className="flex items-center px-4 py-2 bg-white text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg shadow-sm border border-blue-200 transition-all duration-200"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">Kembali ke Forum</span>
          </button>

          <div className="flex items-center space-x-3">
            {thread.isPinned && (
              <div className="flex items-center bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                <Pin size={16} className="mr-1" />
                Disematkan
              </div>
            )}
            {thread.isClosed && (
              <div className="flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                <Lock size={16} className="mr-1" />
                Ditutup
              </div>
            )}
          </div>
        </div>

        {/* Thread Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-white/20 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-blue-100">
              <div className="flex items-center">
                <School size={18} className="mr-2" />
                <span>{thread.School.name}</span>
              </div>
              <div className="flex items-center">
                <User size={18} className="mr-2" />
                <span>Dibuat oleh: {thread.author?.name}</span>
              </div>
              <div className="flex items-center">
                <Clock size={18} className="mr-2" />
                <span>Terakhir update: {formatTime(thread.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Messages Section */}
          <div className="p-6">
            <div className="flex items-center mb-6">
              <MessageSquare size={24} className="text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Diskusi</h2>
              <div className="ml-auto bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                {messages.length} pesan
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Belum ada diskusi</h3>
                <p className="text-gray-500">Jadilah yang pertama memulai diskusi di thread ini</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {messages.map((message) => (
                  <div key={message.id} className="group">
                    <div className="bg-gray-50 hover:bg-gray-100 rounded-xl p-5 transition-colors duration-200">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {message.author?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">{message.author?.name}</h4>
                            <span className="text-sm text-gray-500">{formatTime(message.createdAt)}</span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{message.message}</p>
                          
                          {!thread.isClosed && (
                            <button
                              onClick={() => setReplyingTo(message.id)}
                              className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              💬 Balas
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Replies */}
                      {message.replies && message.replies.length > 0 && (
                        <div className="mt-4 ml-14 space-y-3">
                          {message.replies.map((reply) => (
                            <div key={reply.id} className="bg-white rounded-lg p-4 border-l-4 border-indigo-200">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                  {reply.author?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-medium text-gray-800 text-sm">{reply.author?.name}</h5>
                                    <span className="text-xs text-gray-500">{formatTime(reply.createdAt)}</span>
                                  </div>
                                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          {!thread.isClosed ? (
            <div className="border-t border-gray-200 bg-gray-50 p-6">
              {replyingTo && (
                <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-indigo-700">
                      <MessageSquare size={18} className="mr-2" />
                      <span className="font-medium">Membalas pesan</span>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      ✕ Batalkan
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tulis pesan Anda di sini..."
                    rows={3}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[100px]"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Send size={18} className="mr-2" />
                        Kirim
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 bg-gray-50 p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                <Lock size={32} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Thread Ditutup</h3>
              <p className="text-gray-600">Diskusi pada thread ini telah ditutup dan tidak dapat dilanjutkan</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default ThreadDetail;