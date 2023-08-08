"use client";

import { useRef, useState, useEffect } from "react";
import clsx from "clsx";
import { LoadingCircle, SendIcon, TwitterIcon } from "./icons";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Textarea from "react-textarea-autosize";
import Image from "next/image";
import logoPicture from "./ataturk-logo.png";
import socketIOClient from "socket.io-client";

const examples = [
  "Nutuk ne anlatmaktadır?",
  "Atatürk'ün Nutukta gençliğe mesajı nedir?",
  "Nutuk'a göre kurtuluş savaşı ne gibi şartlarda yapılmıştır?",
];

type APIMessage = {
  type: "apiMessage" | "userMessage";
  message: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

async function query({
  question,
  socketIOClientId,
  history,
}: {
  question: string;
  socketIOClientId: string;
  history: APIMessage[];
}) {
  const response = await fetch(
    "https://flowise-main-eu.nod.li/api/v1/prediction/ead0f07a-53ae-48a9-b828-067ae55e2279",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
        socketIOClientId: socketIOClientId,
        history: history,
      }),
    },
  );
  const result = await response.json();
  return result;
}

const socket = socketIOClient("https://flowise-main-eu.nod.li");

export default function Chat() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [socketIOClientId, setSocketIOClientId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSubmit = async (e: any) => {
    setMessages((messages) => {
      return [
        ...messages,
        {
          role: "user",
          content: input,
        },
      ];
    });
    setInput("");
    e.preventDefault();
    setIsLoading(true);

    query({
      question: input,
      socketIOClientId: socketIOClientId,
      history: messages.map((message) => {
        return {
          type: message.role === "user" ? "userMessage" : "apiMessage",
          message: message.content,
        };
      }),
    }).then(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    socket.on("connect", () => {
      setSocketIOClientId(socket.id);
    });

    socket.on("start", () => {
      setMessages((messages) => {
        return [
          ...messages,
          {
            role: "assistant",
            content: "",
          },
        ];
      });
    });

    socket.on("token", (token: any) => {
      isLoading === false &&
        setMessages((messages) => {
          return messages.map((message, ix) => {
            if (ix === messages.length - 1) {
              return {
                role: message.role,
                content: message.content + token,
              };
            } else {
              return message;
            }
          });
        });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const disabled = isLoading || input.length === 0;

  return (
    <main className="flex flex-col items-center justify-between pb-40">
      <div className="absolute top-5 hidden w-full justify-between px-5 sm:flex">
        <a
          href="/"
          target="_blank"
          className="transition-border rounded-lg p-2 transition-shadow duration-200 hover:border-stone-100 hover:shadow sm:bottom-auto"
        >
          <Image src={logoPicture} width={30} height={30} alt="ataturk-logo" />
        </a>
        <a
          href="https://twitter.com/batuhan"
          target="_blank"
          className="h-10 w-10 rounded-lg p-2 transition-colors duration-200 hover:bg-stone-100"
        >
          <TwitterIcon />
        </a>
      </div>
      {messages.length > 0 ? (
        messages.map((message, i) => (
          <div
            key={i}
            className={clsx(
              "flex w-full items-center justify-center border-b border-gray-200 py-8",
              message.role === "user" ? "bg-white" : "bg-gray-100",
            )}
          >
            <div className="flex w-full max-w-screen-md items-start space-x-4 px-5 sm:px-0">
              <div
                className={clsx(
                  "p-1.5 text-white",
                  message.role === "assistant" ? "bg-green-500" : "bg-black",
                )}
              >
                {message.role === "user" ? (
                  <User width={20} />
                ) : (
                  <Bot width={20} />
                )}
              </div>
              <ReactMarkdown
                className="prose mt-1 w-full break-words prose-p:leading-relaxed"
                remarkPlugins={[remarkGfm]}
                components={{
                  // open links in new tab
                  a: (props) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))
      ) : (
        <div className="border-gray-200sm:mx-0 mx-5 mt-20 max-w-screen-md rounded-md border sm:w-full">
          <div className="flex flex-col space-y-4 p-7 sm:p-10">
            <h1 className="text-lg font-semibold text-black">
              Nutuk&apos;a sor!
            </h1>
            <p className="text-gray-500">
              Bu proje, Atatürk&apos;ün Nutuk&apos;una soru sorabileceğiniz bir{" "}
              <a
                href="https://github.com/batuhan/nutuk"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 transition-colors hover:text-black"
              >
                açık-kaynak
              </a>{" "}
              AI chatbot uygulamasıdır. Bu projede OpenAI için{" "}
              <a
                href="https://js.langchain.com/docs/get_started/introduction"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 transition-colors hover:text-black"
              >
                Langchain.js
              </a>{" "}
              ve memory için{" "}
              <a
                href="https://www.pinecone.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 transition-colors hover:text-black"
              >
                Pinecone
              </a>{" "}
              kullanılmıştır.
            </p>
          </div>
          <div className="flex flex-col space-y-4 border-t border-gray-200 bg-gray-50 p-7 sm:p-10">
            {examples.map((example, i) => (
              <button
                key={i}
                className="rounded-md border border-gray-200 bg-white px-5 py-3 text-left text-sm text-gray-500 transition-all duration-75 hover:border-black hover:text-gray-700 active:bg-gray-50"
                onClick={() => {
                  setInput(example);
                  inputRef.current?.focus();
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
      {isLoading && (
        <div className="fixed bottom-[100px] flex flex-col items-center space-y-3 p-5 pb-3 sm:px-0">
          <div className="relative flex w-full max-w-screen-md items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-1 text-gray-600 shadow-lg">
            <LoadingCircle /> Cevap Oluşturuluyor...
          </div>
        </div>
      )}
      <div className="fixed bottom-0 flex w-full flex-col items-center space-y-3 bg-gradient-to-b from-transparent via-gray-100 to-gray-100 p-5 pb-3 sm:px-0">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative w-full max-w-screen-md rounded-xl border border-gray-200 bg-white px-4 pb-2 pt-3 shadow-lg sm:pb-3 sm:pt-4"
        >
          <Textarea
            ref={inputRef}
            tabIndex={0}
            required
            rows={1}
            autoFocus
            placeholder="Bir soru sorun..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                formRef.current?.requestSubmit();
                e.preventDefault();
              }
            }}
            spellCheck={false}
            className="w-full pr-10 focus:outline-none"
          />
          <button
            className={clsx(
              "absolute inset-y-0 right-3 my-auto flex h-8 w-8 items-center justify-center rounded-md transition-all",
              disabled
                ? "cursor-not-allowed bg-white"
                : "bg-green-500 hover:bg-green-600",
            )}
            disabled={disabled}
          >
            {isLoading ? (
              <LoadingCircle />
            ) : (
              <SendIcon
                className={clsx(
                  "h-4 w-4",
                  input.length === 0 ? "text-gray-300" : "text-white",
                )}
              />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400">
          Built with{" "}
          <a
            href="https://js.langchain.com/docs/get_started/introduction"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black"
          >
            Langchain.js
          </a>{" "}
          and{" "}
          <a
            href="https://www.pinecone.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black"
          >
            Pinecone DB
          </a>
          . An AI Chatbot using{" "}
          <a
            href="https://openai.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black"
          >
            OpenAI.
          </a>
          Made by {" "}
          <a
            href="https://twitter.com/alperdegre"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black"
          >
            @alperdegre
          </a>
        </p>
      </div>
    </main>
  );
}
