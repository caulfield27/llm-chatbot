import { CreateMLCEngine } from "@mlc-ai/web-llm";


let engine: any;

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "init":
      try {
        engine = await CreateMLCEngine("Qwen2-0.5B-Instruct-q4f16_1-MLC");
        self.postMessage({ type: "ready" });
      } catch (e) {
        self.postMessage({ type: "error" });
      }
      break;
    case "generate":
      if (engine) {
        const chunks = await engine?.chat?.completions?.create({
          messages: payload,
          stream: true,
          temperature: 0.7,
          max_tokens: 256,
        });

        // self.postMessage({type: "chunk", payload: chunks?.choices?.[0]?.message?.content})
        
        let firstChunk = true;
        for await (const chunk of chunks) {
          self.postMessage({
            type: "chunk",
            payload: {
              msg: chunk?.choices[0]?.delta?.content,
              isFirst: firstChunk,
            },
          });
          if (firstChunk) {
            firstChunk = false;
          }
        }

        self.postMessage({type: "responseEnd"})
      }
      break;
  }
};
