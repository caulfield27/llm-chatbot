import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Bot, Send, User } from "lucide-react";
import logo from "../public/singleLogo.svg";

type IMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const companyFacts = [
  "Humo Bank is one of the top five financial organizations in Tajikistan.",
  "Humo Bank was founded in 2005 as a Microloan Fund by CARE International.",
  "Humo Bank officially transformed into a bank on 23 July 2025.",
  "Humo Bank is part of Gojo & Company, a Japanese investment holding.",
  "Humo Bank serves over 350,000 clients across Tajikistan.",
  "Humo Bank manages a credit portfolio of over 1.8 billion somoni.",
  "Humo Bank offers commission-free payments through the Humo Online app.",
  "Humo Online allows payments for over 300 services, including mobile, internet, and utilities.",
  "Humo Bank provides loans up to 50,000 somoni through the 'Orzu' service in the Humo Online app.",
  "Humo Bank supports money transfers to over 70 countries with systems like Visa, Mastercard, and Korti Milli.",
  "Humo Bank offers banking cards for secure and convenient financial access.",
  "Humo Bank's mission is to provide accessible financial services to rural and underserved populations.",
  "Humo Bank promotes small and medium business development in Tajikistan.",
  "Humo Bank focuses on digital transformation of financial services.",
  "Humo Bank's currency exchange rates on 27 August 2025: 1 USD = 9.50 (buy), 9.65 (sell); 1 EUR = 11.00 (buy), 11.30 (sell); 1 RUB = 0.1179 (buy), 0.1200 (sell).",
  "Humo Bank's contact number is +992 (44) 6405544.",
  "Humo Bank offers internet banking through the Humo Online app.",
  "Humo Bank provides cashback up to 20% at partner stores via Humo Online.",
  "Humo Bank's deposits are insured under Tajikistan's deposit insurance law.",
  "Humo Bank has a network of branches across Tajikistan.",
];

const signs = ["?", ",", ".", "!"];

function App() {
  const [initLoading, setInitLoading] = useState(false);
  const [messageStatus, setMessageStatus] = useState<{
    loading: boolean;
    index: number | null;
  }>({
    loading: false,
    index: null,
  });
  const [outputLoading, setOutputLoading] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([
    {
      role: "system",
      content: `You are a helpful assistant for Humo Bank. Use the following information to answer questions concisely and naturally: ${companyFacts.join(
        "\n"
      )}`,
    },
    {
      role: "assistant",
      content:
        "Hello! I'm a chatbot for Humo Bank, one of Tajikistan's top financial institutions. Ask me about our services, history, or anything else!",
    },
  ]);
  const [prompt, setPropmt] = useState("");
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    function init() {
      setInitLoading(true);
      console.log('case 2');
      
      worker.current = new Worker(new URL("./worker.ts", import.meta.url), {
        type: "module",
      });

      worker.current.postMessage({ type: "init" });

      worker.current.onmessage = (event) => {
        switch (event.data?.type) {
          case "ready":
            setInitLoading(false);
            break;
          case "chunk":
            const { msg, isFirst } = event.data?.payload;

            if (msg) {
              if (isFirst) {
                setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
              } else {
                setMessages((prev) => {
                  return prev.map((elem, ind) => {
                    if (ind === prev.length - 1) {
                      return {
                        ...elem,
                        content: elem.content + `${signs.includes(msg) ? msg : " " + msg}`,
                      };
                    } else {
                      return elem;
                    }
                  });
                });
              }
            }
            setOutputLoading(false);
            // setMessages((prev) => [...prev, { role: "assistant", content: event.data?.payload }]);
            break;
          case "error":
            setMessageStatus({
              loading: false,
              index: null,
            });
            break;
          case "responseEnd":
            setMessageStatus({
              loading: false,
              index: null,
            });
            break;
        }
      };
    }

    init();

    return () => {
      worker.current?.terminate();
    };
  }, []);

  function sendPrompt() {
    if (worker.current && prompt) {
      setOutputLoading(true);
      setMessageStatus({
        loading: true,
        index: messages.length,
      });
      const newMessages: IMessage[] = [...messages, { role: "user", content: prompt }];
      setMessages(newMessages);
      worker.current.postMessage({ type: "generate", payload: newMessages });
      setPropmt("");
    }
  }

  function handlePresKey(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      sendPrompt();
    }
  }

  // return (
  //   <>
  //     {initLoading ? (
  //       <h1>Модель загружается...</h1>
  //     ) : (
  //       <div
  //         style={{
  //           display: "flex",
  //           flexDirection: "column",
  //           gap: "16px",
  //           opacity: `${outputLoading ? 0.6 : 1}`,
  //         }}
  //       >
  //         <h1>Hello, I am Humo Bank chat bot</h1>
  //         <div style={{ width: "100%", display: "flex", flexDirection: "row", gap: "10px" }}>
  //           <input
  //             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPropmt(e.target.value)}
  //             value={prompt}
  //             disabled={outputLoading}
  //             style={{
  //               width: "80%",
  //               padding: "8px",
  //               borderRadius: "4px",
  //               border: "none",
  //               outline: "1px solid grey",
  //               fontSize: "24px",
  //             }}
  //             type="text"
  //             placeholder="Ask a question..."
  //           />
  //           <button
  //             onClick={generate}
  //             disabled={outputLoading}
  //             style={{ width: "20%", opacity: `${outputLoading ? "0.5" : "1"}` }}
  //           >
  //             Отправить
  //           </button>
  //         </div>
  //         <div className="chat_container">
  //           {messages.slice(1).map((msg, index) => (
  //             <p key={index} style={{ fontWeight: msg.role === "user" ? "bold" : "normal" }}>
  //               {msg.role === "user" ? "You:" : "assistant:"} {msg.content}
  //             </p>
  //           ))}
  //           {outputLoading && <p>Generating...</p>}
  //         </div>
  //       </div>
  //     )}
  //   </>
  // );

  return initLoading ? (
    <h1>Модель загружается...</h1>
  ) : (
    <div className="flex flex-col h-screen bg-[#F5F5F5]">
      <div className="bg-[#F76835] backdrop-blur-xl border-b border-[#F76835] p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center space-x-3">
          <div
            style={{
              background: "white",
              padding: "5px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img src={logo} alt="logo" />
          </div>
          {/* <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full"></div>
            </div>
          </div> */}
          <div>
            <h1 className="text-xl font-semibold text-white">Humo Bank assistant</h1>
            <p className="text-sm text-white">Always here to help</p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">Online</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {messages.slice(1).map((message, i) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.content + i}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl space-x-3 ${
                      isUser ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isUser
                          ? "bg-gradient-to-br from-purple-500 to-blue-600"
                          : "bg-gradient-to-br from-slate-700 to-slate-600"
                      }`}
                    >
                      {isUser ? (
                        <User size={16} className="text-white" />
                      ) : (
                        <Bot size={16} className="text-white" />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div
                        className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                          isUser
                            ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white ml-auto"
                            : "bg-[#dcdcdc]"
                        } ${
                          isUser ? "rounded-br-md" : "rounded-bl-md"
                        } transition-all duration-200 hover:shadow-xl`}
                      >
                        <p className="text-sm md:text-base leading-relaxed break-words">
                          {messageStatus.loading && i === messageStatus.index ? (
                            <>
                              {message.content}
                              <strong> . </strong>
                              <strong> . </strong>
                              <strong> . </strong>
                            </>
                          ) : (
                            message.content
                          )}
                        </p>
                      </div>
                      <p
                        className={`text-xs text-slate-500 mt-1 ${
                          isUser ? "text-right" : "text-left"
                        }`}
                      >
                        {new Date().toDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {outputLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex max-w-xs md:max-w-md space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-[#dcdcdc] backdrop-blur-sm border border-slate-700/50 px-4 py-3 rounded-2xl rounded-bl-md shadow-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div />
          </div>
        </div>
      </div>

      <div className="bg-[#dcdcdc] backdrop-blur-xl border-t border-[#dcdcdc] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={prompt}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setPropmt(event.target.value)
                }
                onKeyPress={handlePresKey}
                placeholder="Type your message..."
                className="w-full bg-[white] border border-slate-700/50 rounded-2xl px-4 py-3 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 resize-none"
                disabled={messageStatus.loading}
              />
            </div>
            <button
              onClick={sendPrompt}
              disabled={messageStatus.loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 text-white p-3 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Send size={20} className="transform transition-transform duration-200" />
            </button>
          </div>
          <p className="text-xs text-[black] mt-2 text-center">Press Enter to send</p>
        </div>
      </div>
    </div>
  );
}

export default App;
