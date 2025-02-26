"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa";
import axios from "axios";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (
      (typeof window !== "undefined" && "SpeechRecognition" in window) ||
      "webkitSpeechRecognition" in window
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const newMessage = { text: input, sender: "user" };
    setMessages([...messages, newMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: input,
      });
      const botReply = { text: response.data.reply, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botReply]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
      <div className="flex-1 p-4 overflow-hidden">
        <div
          ref={chatContainerRef}
          className="h-full overflow-y-auto pr-4 space-y-4"
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-4 rounded-2xl shadow-lg backdrop-blur-sm ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : "bg-gradient-to-r from-green-400 to-blue-500 text-white"
                  }`}
                  style={{
                    boxShadow:
                      message.sender === "user"
                        ? "0 0 15px rgba(102, 126, 234, 0.5)"
                        : "0 0 15px rgba(72, 187, 120, 0.5)",
                  }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {message.sender === "bot" ? (
                      <FaRobot className="text-yellow-300 text-xl" />
                    ) : (
                      <FaUser className="text-indigo-200 text-xl" />
                    )}
                    <span className="font-bold text-lg">
                      {message.sender === "bot" ? "Radha" : "You"}
                    </span>
                  </div>
                  <p className="text-md">{message.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-2xl shadow-lg backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <FaRobot className="text-yellow-300 text-xl" />
                  <span className="font-bold text-lg">Radha</span>
                </div>
                <p className="text-md mt-2">
                  Typing<span className="animate-pulse">...</span>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <motion.form
        onSubmit={sendMessage}
        className="p-4 bg-white bg-opacity-20 backdrop-blur-lg"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 rounded-full bg-white bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 placeholder-gray-500"
          />
          <motion.button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
              isListening
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isListening ? (
              <FaMicrophoneSlash className="text-xl text-white" />
            ) : (
              <FaMicrophone className="text-xl text-white" />
            )}
          </motion.button>
          <motion.button
            type="submit"
            className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPaperPlane className="text-xl" />
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default ChatInterface;
