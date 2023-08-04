import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PineconeClient } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const filePath = "docs";

export const run = async () => {
  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT ?? "",
      apiKey: process.env.PINECONE_API_KEY ?? "",
    });

    // Load the text from the file
    const loader = new TextLoader(`./${filePath}/nutuk.txt`);
    const txtDoc = await loader.load();

    // Split the text into chunks
    const textSplitter = new CharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separator: "\r\n",
    });

    const docs = await textSplitter.splitDocuments(txtDoc);

    for (const doc of docs) {
      // replace all \r\n with spaces
      doc.pageContent = doc.pageContent.replace(/\r\n/g, " ");
    }

    console.log("Split Docs :", docs);

    console.log("Creating vector store...");
    // Create and store the embeddings in the vectorStore
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(process.env.PINECONE_INDEX ?? "");

    // embed the Txt documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to ingest your data");
  }
};

(async () => {
  await run();
  console.log("ingestion complete");
})();
