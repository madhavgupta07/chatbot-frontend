import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send } from "lucide-react";
import { Button, TextField, Card, CardContent, CardHeader, Typography, CircularProgress } from "@mui/material";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function App() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setChatHistory((prev) => [...prev, { role: "user", content: message }]);
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/api/chat", { message });
      const botResponse = res.data.message;
      setChatHistory((prev) => [...prev, { role: "bot", content: botResponse }]);
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev,
        { role: "bot", content: "Error: Failed to fetch response from the chatbot." },
      ]);
    } finally {
      setIsLoading(false);
      setMessage("");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full">
          <Typography variant="h5" className="text-center">Gemini Chatbot</Typography>
        <CardContent className="p-4">
          <div ref={chatContainerRef} className="h-[400px] overflow-y-auto mb-4 p-4 border rounded-md bg-gray-50">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-20">
                Send a message to start chatting with Gemini
              </div>
            ) : (
              chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`mb-4 p-3 rounded-lg max-w-[50%] ${
                    chat.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-200 mr-auto"
                  }`}
                >
                  {chat.role === "bot" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {chat.content}
                    </ReactMarkdown>
                  ) : (
                    chat.content
                  )}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <TextField
              fullWidth
              variant="outlined"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button type="submit" variant="contained" color="primary" disabled={isLoading || !message.trim()}>
              {isLoading ? <CircularProgress size={20} /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}