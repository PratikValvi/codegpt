"use client";

import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Textarea from "react-textarea-autosize";
import { LoadingCircle, SendIcon } from "@/icons/icons";

const apiKey = process.env.NEXT_PUBLIC_API_KEY; // Replace with your API key
const hostName = process.env.NEXT_PUBLIC_HOST;
const model = process.env.NEXT_PUBLIC_MODEL; // Replace with model of your choice
const apiUrl = `https://${hostName}/v1beta2/models/${model}:generateText`;

const examples = [
  "What is JavaScript?",
  "Tell me some basic concepts of JavaScript.",
  "What are data types in JavaScript?",
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [userText, setUserText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const inputText = useRef({
    value: "",
  });

  const setInputText = (value) => {
    inputText.current.value = value;
  };

  const disabled = loading;

  useEffect(() => {
    const generateAIMessage = async (textInput) => {
      setLoading(true);
      setError(null);
      try {
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: { text: textInput }, // Use the stored user input as prompt text
          }),
        };
        const response = await fetch(`${apiUrl}?key=${apiKey}`, requestOptions);
        const jsonData = await response.json();

        const newMessage = {
          role: "assistant",
          content: jsonData.candidates[0].output,
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } catch (error) {
        setError(error);
        const newMessage = {
          role: "assistant",
          content: "Something went wrong. Try Again!",
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } finally {
        setLoading(false);
        setUserText("");
      }
    };

    if (userText && userText?.trim() !== "") {
      const newMessage = {
        role: "user",
        content: userText,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      generateAIMessage(userText);
    }
  }, [userText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.current.value && inputText.current.value?.trim() !== "") {
      setUserText(inputText.current.value);
      setInputText("");
      inputRef.current.value = "";
      inputRef.current?.focus();
    }
  };

  return (
    <main className="flex flex-col items-center justify-between pb-40">
      {messages.length > 0 ? (
        messages.map((message, i) => (
          <div
            key={i}
            className={clsx(
              "flex w-full items-center justify-center border-b border-gray-200 py-8",
              message.role === "user" ? "bg-white" : "bg-gray-100"
            )}
          >
            <div className="flex w-full max-w-screen-md items-start space-x-4 px-5 sm:px-0">
              <div
                className={clsx(
                  "p-1.5 text-white",
                  message.role === "assistant" ? "bg-green-500" : "bg-black"
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
        <div className="border-gray-200 sm:mx-0 mx-5 mt-20 max-w-screen-md rounded-md border sm:w-full">
          <div className="flex flex-col space-y-4 p-7 sm:p-10">
            <h1 className="text-lg font-semibold text-black">
              Welcome to CodeGPT
            </h1>
            <p className="text-gray-500">
              "Explore coding concepts and conquer challenges with your
              dedicated coding buddy by your side."
            </p>
          </div>
          <div className="flex flex-col space-y-4 border-t border-gray-200 bg-gray-50 p-7 sm:p-10">
            {examples.map((example, i) => (
              <button
                key={i}
                className="rounded-md border border-gray-200 bg-white px-5 py-3 text-left text-sm text-gray-500 transition-all duration-75 hover:border-black hover:text-gray-700 active:bg-gray-50"
                onClick={(e) => {
                  e.preventDefault();
                  setInputText(example);
                  inputRef.current.value = example;
                  inputRef.current?.focus();
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="fixed bottom-0 flex w-full flex-col items-center space-y-3 bg-gradient-to-b from-transparent via-gray-100 to-gray-100 p-5 pb-3 sm:px-0">
        <form
          ref={formRef}
          onSubmit={(e) => handleSubmit(e)}
          className="relative w-full max-w-screen-md rounded-xl border border-gray-200 bg-white px-4 pb-2 pt-3 shadow-lg sm:pb-3 sm:pt-4"
        >
          <Textarea
            ref={inputRef}
            tabIndex={0}
            required
            rows={1}
            autoFocus
            placeholder="Send a message"
            // value={inputText.current.value}
            onChange={(e) => setInputText(e.target.value)}
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
                : "bg-green-500 hover:bg-green-600"
            )}
            disabled={disabled}
          >
            {loading ? (
              <LoadingCircle />
            ) : (
              <SendIcon
                className={clsx(
                  "h-4 w-4",
                  inputText.current.value?.length === 0
                    ? "text-gray-300"
                    : "text-white"
                )}
              />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400">
          Built with ❤ by Pratik Valvi using Google's Text Bison LLM as base
          model.
        </p>
      </div>
    </main>
  );
}
