"use client";

import { default as OpenAI } from "openai";
import { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { toast } from "@netizen/ui";
import { Button } from "@netizen/ui/server";
import { getMessageHistoryAction, promptAction } from "./actions";

function Message({ content, role }: OpenAI.Chat.Completions.ChatCompletionMessageParam) {
  const isUser = role === "user";
  return (
    <div className={"mb-1 flex w-full"}>
      <div className={`${isUser ? "bg-neutral-100 " : ""} w-full rounded p-1`}>
        {typeof content === "string" ? (
          <Markdown
            children={content}
            components={{
              pre(props) {
                const { node: _node, ...rest } = props;
                return <pre className="bg-primary-200" {...rest} />;
              },
            }}
          />
        ) : (
          content?.map((item, index) => (
            <div key={index}>{item.type === "text" ? item.text : <img src={item.image_url.url} alt="" />}</div>
          ))
        )}
      </div>
    </div>
  );
}

export default function GPT4Panel({ params: { chatId } }: { params: { chatId: string } }) {
  const [images, setImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<OpenAI.Chat.Completions.ChatCompletionMessageParam[]>([]);
  const [botReply, setBotReply] = useState<OpenAI.Chat.Completions.ChatCompletionMessageParam | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const initialMessages = await getMessageHistoryAction({ chatId });
      if (initialMessages.success) {
        const messages = initialMessages.data?.history;
        if (messages) setMessages(messages);
        setLoading(false);
      } else {
        const description = initialMessages.error?.message;
        if (description)
          toast.error("Error", {
            description,
            cancel: { label: "close" },
          });
      }
    })();
  }, [chatId]);
  useEffect(() => {
    if (botReply) {
      setMessages([...messages, botReply]);
      setBotReply(null);
    }
  }, [botReply, messages]);

  const handleSendMessage = useCallback(() => {
    if (messages.length !== 0) {
      if (newMessage.trim() !== "" || images.length !== 0) {
        setLoading(true);
        const newMessageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];
        if (newMessage.trim() !== "") newMessageContent.push({ type: "text", text: newMessage });
        if (images.length !== 0) {
          images.forEach((image) => {
            newMessageContent.push({
              type: "image_url",
              image_url: {
                url: image,
              },
            });
          });
        }
        setMessages([...messages, { content: newMessageContent, role: "user" }]);
        (async () => {
          const response = await promptAction({ chatId, content: newMessageContent });
          if (response.success) {
            const message = response.data?.message;
            if (message) setBotReply(message);
          } else {
            const description = response.error?.message;
            if (description)
              toast.error("Error", {
                description,
                cancel: { label: "close" },
              });
          }
          setLoading(false);
        })();

        setImages([]);
        setNewMessage("");
        // Scroll to the bottom of the textarea when a new message is sent
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      }
    }
  }, [messages, newMessage, images, chatId]);

  const handleUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages([...images, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    },
    [images],
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      const updatedImages = [...images];
      updatedImages.splice(index, 1);
      setImages(updatedImages);
    },
    [images],
  );

  return (
    <div className="bg-gray-100 flex w-full flex-col">
      <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(100% - 12rem)" }} ref={textareaRef}>
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
      </div>
      <div className="p-4">
        <div className="mb-4 flex flex-row">
          {images.map((img, index) => (
            <div key={index} className="relative mb-2">
              <img
                key={index}
                src={img}
                alt={`Preview ${index + 1}`}
                className="mr-2 h-10 w-10 cursor-pointer rounded object-cover"
                onClick={() => handleRemoveImage(index)}
              />
              <div className="absolute bottom-0 left-0 right-0 top-0 flex cursor-pointer items-center justify-center rounded bg-neutral-100/50 bg-opacity-50">
                <span className="text-xl font-bold text-white" onClick={() => handleRemoveImage(index)}>
                  -
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center">
          <label
            htmlFor="imageUpload"
            className="mr-2  cursor-pointer rounded bg-primary-600 p-2 text-primary-foreground"
          >
            +
          </label>
          <input
            id="imageUpload"
            type="file"
            accept=".jpg, .jpeg, .png"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
          <textarea
            className="mr-2 flex-1 resize-none rounded border p-2"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!loading) handleSendMessage();
              }
            }}
          />
          <Button
            onClick={() => {
              if (!loading) handleSendMessage();
            }}
          >
            {loading ? "¡¡¡!!!Loading¡¡¡!!!" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
