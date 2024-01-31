"use client";

import { default as OpenAI } from "openai";
import { useCallback, useEffect, useState } from "react";
import Markdown from "react-markdown";
import { Button } from "@netizen/ui/server";
import { addMesageToThread, checkRunStatus, createThread, getThreadMessages } from "./actions";

function Message({ content, role }: OpenAI.Beta.Threads.Messages.ThreadMessage) {
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
            <div key={index}>
              {item.type === "text" ? (
                <Markdown
                  children={item.text.value}
                  components={{
                    pre(props) {
                      const { node: _node, ...rest } = props;
                      return <pre className="bg-primary-200" {...rest} />;
                    },
                  }}
                />
              ) : (
                <img src={item.image_file.file_id} alt="" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ChatPanel({
  assistantId,
  messages: initialMessages,
  threadId: initialThreadId,
}: {
  messages?: OpenAI.Beta.Threads.Messages.ThreadMessage[];
  threadId?: string;
  assistantId: string;
}) {
  const [threadId, setThreadId] = useState(initialThreadId ?? "");
  const [intervalHandle, setIntervalHandle] = useState<NodeJS.Timeout | null>(null);
  const [messages, setMessages] = useState(initialMessages ?? []);
  const [runId, setRunId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() !== "") {
      setLoading(true);
      (async () => {
        let localThreadId = threadId;
        if (localThreadId === "") {
          const response = await createThread();
          setThreadId(localThreadId);
          localThreadId = response.id;
        }
        setNewMessage("");
        const { runId } = await addMesageToThread({ assistantId, threadId: localThreadId, content: newMessage });
        setRunId(runId);
      })();
    }
  }, [assistantId, newMessage, threadId]);

  useEffect(() => {
    if (runId && intervalHandle === null) {
      const interval = setInterval(() => {
        (async () => {
          const status = await checkRunStatus({ threadId, runId });
          if (status.status === "completed") {
            const messages = await getThreadMessages({ threadId });
            setMessages(messages);
            setRunId("");
          }
        })();
      }, 1000);
      setIntervalHandle(interval);
    }
    if (runId === "" && intervalHandle) {
      clearInterval(intervalHandle);
      setIntervalHandle(null);
      setLoading(false);
    }
  }, [threadId, runId, intervalHandle]);

  return (
    <div className="bg-gray-100 flex w-full flex-col">
      <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(100% - 12rem)" }}>
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
      </div>
      <div className="p-4">
        <div className="flex items-center">
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
