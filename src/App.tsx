import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [initLoading, setInitLoading] = useState(false);
  const [outputLoading, setOutputLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful assistant for Humo Bank." },
  ]);
  const [prompt, setPropmt] = useState("");
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    function init() {
      setInitLoading(true);
      worker.current = new Worker(new URL("./worker.ts", import.meta.url), {
        type: "module",
      });

      worker.current.postMessage({ type: "init" });

      worker.current.onmessage = (event) => {
        switch (event.data?.type) {
          case "ready":
            setInitLoading(false);
            break;
          case "message":
            console.log(event.data?.dayload);
            
            setOutputLoading(false);
            break;
          case "error":
            setOutputLoading(false);
            break;
        }
      };
    }

    init();

    return () => {
      worker.current?.terminate();
    };
  }, []);

  function generate() {
    if (worker.current && prompt) {
      setOutputLoading(true);
      const newMessages = [...messages, {role: "user", content: prompt}]
      worker.current.postMessage({ type: "generate", payload: newMessages });
      setPropmt("");
    }
  }

  return (
    <>
      {initLoading ? (
        <h1>Модель загружается...</h1>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            opacity: `${outputLoading ? 0.6 : 1}`,
          }}
        >
          <h1>Hello, I am Humo Bank chat bot</h1>
          <div style={{ width: "100%", display: "flex", flexDirection: "row", gap: "10px" }}>
            <input
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPropmt(e.target.value)}
              value={prompt}
              disabled={outputLoading}
              style={{
                width: "80%",
                padding: "8px",
                borderRadius: "4px",
                border: "none",
                outline: "1px solid grey",
                fontSize: "24px",
              }}
              type="text"
              placeholder="Ask a question..."
            />
            <button
              onClick={generate}
              disabled={outputLoading}
              style={{ width: "20%", opacity: `${outputLoading ? "0.5" : "1"}` }}
            >
              Отправить
            </button>
          </div>
          <div className="chat_container">
            {messages.slice(1).map(
              (
                msg,
                index
              ) => (
                <p key={index} style={{ fontWeight: msg.role === "user" ? "bold" : "normal" }}>
                  {msg.role === "user" ? "You:" : "Assistant:"} {msg.content}
                </p>
              )
            )}
            {outputLoading && <p>Generating...</p>}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
