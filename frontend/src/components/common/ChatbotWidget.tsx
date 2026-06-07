import { useState } from "react";
import { chatApi } from "../../services/aiApi";
import { useAuth } from "../../context/AuthContext";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const ChatbotWidget = () => {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hi! I'm your AI HR assistant. How can I help?" },
  ]);
  const [loading, setLoading] = useState(false);

  if (!token || !user) return null;

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const reply = await chatApi(userMsg, `Role: ${user?.role ?? "guest"}`);
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Sorry, I could not reach the AI service." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chatbot ${open ? "chatbot-open" : ""}`}>
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <strong>HR Assistant</strong>
            <button type="button" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-msg-${m.role}`}>
                {m.text}
              </div>
            ))}
            {loading && <p className="muted">Thinking...</p>}
          </div>
          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void send()}
              placeholder="Ask about leave, payroll, attendance..."
            />
            <button type="button" onClick={() => void send()} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}
      <button type="button" className="chatbot-toggle" onClick={() => setOpen(!open)}>
        {open ? "Close" : "HR Chat"}
      </button>
    </div>
  );
};

export default ChatbotWidget;
