import { useState, useRef, useEffect } from "react";

export default function Chatbot() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function sendMessage() {

    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: input })
      });

      const data = await res.json();
      const botMsg = { role: "bot", text: data.answer };
      setMessages(m => [...m, botMsg]);
    } catch (error) {
      const errorMsg = { role: "bot", text: "Sorry, something went wrong. Please try again." };
      setMessages(m => [...m, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>

      {/* floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          fontSize: "24px",
          border: "none",
          background: "white",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        }}
      >
        💬
      </button>

      {/* chat window */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: "90px",
          right: "20px",
          width: "350px",
          height: "500px",
          border: "none",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 5px 20px rgba(0, 0, 0, 0.2)",
          padding: "0",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>

          {/* header */}
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "16px",
            borderRadius: "12px 12px 0 0",
            color: "white",
            fontWeight: "600",
            fontSize: "16px"
          }}>
            Chat with AI
          </div>

          {/* messages */}
          <div style={{
            flex: 1,
            overflow: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>

            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start"
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background: m.role === "user" ? "#667eea" : "#e9ecef",
                    color: m.role === "user" ? "white" : "#333",
                    fontSize: "14px",
                    lineHeight: "1.4",
                    wordWrap: "break-word"
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{
                display: "flex",
                justifyContent: "flex-start"
              }}>
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: "#e9ecef",
                  color: "#666",
                  fontSize: "14px",
                  fontStyle: "italic"
                }}>
                  AI is thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* input area */}
          <div style={{
            display: "flex",
            gap: "8px",
            padding: "12px",
            borderTop: "1px solid #e9ecef",
            background: "#f8f9fa"
          }}>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "text"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#ddd"}
            />

            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: "8px 16px",
                background: loading || !input.trim() ? "#ccc" : "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "background 0.2s",
                opacity: loading || !input.trim() ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.target.style.background = "#5568d3";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && input.trim()) {
                  e.target.style.background = "#667eea";
                }
              }}
            >
              {loading ? "..." : "Send"}
            </button>

          </div>

        </div>
      )}

    </div>
  );
}