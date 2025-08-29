// import { pipeline } from "@huggingface/transformers";
// import * as tf from "@tensorflow/tfjs";
import { CreateMLCEngine } from "@mlc-ai/web-llm";

let engine: any;

// const companyFacts = [
//   "Humo Bank is one of the top five financial organizations in Tajikistan.",
//   "Humo Bank was founded in 2005 as a Microloan Fund by CARE International.",
//   "Humo Bank officially transformed into a bank on 23 July 2025.",
//   "Humo Bank is part of Gojo & Company, a Japanese investment holding.",
//   "Humo Bank serves over 350,000 clients across Tajikistan.",
//   "Humo Bank manages a credit portfolio of over 1.8 billion somoni.",
//   "Humo Bank offers commission-free payments through the Humo Online app.",
//   "Humo Online allows payments for over 300 services, including mobile, internet, and utilities.",
//   "Humo Bank provides loans up to 50,000 somoni through the 'Orzu' service in the Humo Online app.",
//   "Humo Bank supports money transfers to over 70 countries with systems like Visa, Mastercard, and Korti Milli.",
//   "Humo Bank offers banking cards for secure and convenient financial access.",
//   "Humo Bank's mission is to provide accessible financial services to rural and underserved populations.",
//   "Humo Bank promotes small and medium business development in Tajikistan.",
//   "Humo Bank focuses on digital transformation of financial services.",
//   "Humo Bank's currency exchange rates on 27 August 2025: 1 USD = 9.50 (buy), 9.65 (sell); 1 EUR = 11.00 (buy), 11.30 (sell); 1 RUB = 0.1179 (buy), 0.1200 (sell).",
//   "Humo Bank's contact number is +992 (44) 6405544.",
//   "Humo Bank offers internet banking through the Humo Online app.",
//   "Humo Bank provides cashback up to 20% at partner stores via Humo Online.",
//   "Humo Bank's deposits are insured under Tajikistan's deposit insurance law.",
//   "Humo Bank has a network of branches across Tajikistan.",
//   "Привет",
// ];

// let embedder: any;
// // let generator: any;
// let factEmbeddings: number[][] = [];

// function cosineSimilarity(vecA: number[], vecB: number[]): number {
//   const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
//   const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
//   const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
//   return dotProduct / (magnitudeA * magnitudeB);
// }

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "init":
      try {
        engine = await CreateMLCEngine("Qwen2-0.5B-Instruct-q4f16_1-MLC");
        // model = await pipeline("feature-extraction", "mixedbread-ai/mxbai-embed-large-v1");
        // generator = await pipeline("text-generation", "Xenova/distilgpt2");
        // embedder = await tf.loadGraphModel(
        //   "https://tfhub.dev/google/universal-sentence-encoder/4"
        // );

        // factEmbeddings = await Promise.all(
        //   companyFacts.map(async (fact) => {
        //     const tensor = await embedder.predict([fact]);
        //     const embedding = await tensor.array();
        //     return embedding[0];
        //   })
        // );

        // factEmbeddings = await Promise.all(
        //   companyFacts.map(async (fact) => {
        //     const output = await model(fact, { pooling: "mean", normalize: true });
        //     return Array.from(output.data) as number[];
        //   })
        // );

        self.postMessage({ type: "ready" });
      } catch (e) {
        self.postMessage({ type: "error" });
      }
      break;
    case "generate":
      if (engine) {
        console.log(payload);

        const chunks = await engine.chat.completions.create({
          messages: payload,
          stream: true,
          temperature: 0.7,
          max_tokens: 128,
        });

        chunks.next().value;
        console.log("response chanks: ", chunks);
      }
      //   if (model && factEmbeddings.length > 0) {
      //     try {
      //       const queryEmbedding = await model(payload, {
      //         pooling: "mean",
      //         normalize: true,
      //       });

      //       const queryVector = Array.from(queryEmbedding.data) as number[];

      //       const similarities = factEmbeddings.map((factEmbedding, index) => ({
      //         index,
      //         similarity: cosineSimilarity(queryVector, factEmbedding),
      //       }));
      //       similarities.sort((a, b) => b.similarity - a.similarity);
      //       const topFacts = similarities.slice(0, 3);

      //       if (topFacts[0].similarity < 0.5) {
      //         self.postMessage({
      //           type: "message",
      //           payload: "Нет информации, обратитесь в службу поддержки по номеру: 544",
      //         });
      //       } else {
      //         const context = topFacts.map(({ index }) => companyFacts[index]).join("\n");
      //         const prompt = `Based on this information: ${context}\nQuestion: ${payload}\nAnswer in a concise and natural way:`;
      //         const genOutput = await generator(prompt, { max_new_tokens: 50, temperature: 0.7 });
      //         console.log(genOutput);

      //         const answer =
      //           genOutput[0].generated_text
      //             .split("Answer in a concise and natural way:")[1]
      //             ?.trim() || "Нет информации.";

      //         self.postMessage({ type: "message", payload: answer });
      //       }

      //       // let maxSimilarity = -1;
      //       // let bestFact = "";
      //       // factEmbeddings.forEach((factEmbedding, index) => {
      //       //   const similarity = cosineSimilarity(queryVector, factEmbedding);
      //       //   if (similarity > maxSimilarity) {
      //       //     maxSimilarity = similarity;
      //       //     bestFact = companyFacts[index];
      //       //   }
      //       // });

      //       // self.postMessage({ type: "message", payload: "hello" });
      //     } catch (e) {
      //       self.postMessage({ type: "error" });
      //     }
      //   }
      break;
  }
};
