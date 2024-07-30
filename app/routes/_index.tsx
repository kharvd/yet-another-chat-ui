import type { MetaFunction } from "@remix-run/node";
import React from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import {
  ChatCompletionChunk,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
} from "openai/resources/index.mjs";
import { ScrollArea } from "~/components/ui/scroll-area";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

function Message({ message }: { message: ChatCompletionMessageParam }) {
  const formattedText = (message.content as string)
    .split("\n")
    .map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));

  return (
    <Alert className="mt-4">
      <AlertTitle>{message.role}</AlertTitle>
      <AlertDescription>{formattedText}</AlertDescription>
    </Alert>
  );
}

export default function Index() {
  const [messages, setMessages] = React.useState<ChatCompletionMessageParam[]>(
    []
  );
  const [streamedMessage, setStreamedMessage] =
    React.useState<ChatCompletionMessage | null>(null);
  const [messageDraft, setMessageDraft] = React.useState("");
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);
  const [abortController, setAbortController] =
    React.useState<AbortController | null>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const [showAbort, setShowAbort] = React.useState(false);
  const showAbortTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const finishStreaming = () => {
    setStreamedMessage((lastMessage) => {
      if (lastMessage) {
        setMessages((prev) => [...prev, lastMessage]);
      }
      return null;
    });
    if (abortController) {
      abortController.abort();
    }
    setAbortController(null);
    if (showAbortTimeoutRef.current) {
      clearTimeout(showAbortTimeoutRef.current);
    }
    showAbortTimeoutRef.current = null;
    setShowAbort(false);
  };

  const postMessage = async () => {
    console.log("postMessage");
    const userMessage: ChatCompletionMessageParam = {
      role: "user",
      content: messageDraft,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessageDraft("");

    const ctrl = new AbortController();
    setAbortController(ctrl);

    showAbortTimeoutRef.current = setTimeout(() => {
      setShowAbort(true);
    }, 1000);

    await fetchEventSource("/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [...messages, userMessage],
      }),
      signal: ctrl.signal,
      openWhenHidden: true,
      onmessage(e) {
        console.log(e.data);
        const chunk = JSON.parse(e.data) as ChatCompletionChunk;
        if (chunk.choices[0].finish_reason === "stop") {
          finishStreaming();
        } else if (chunk.choices[0].finish_reason === null) {
          setStreamedMessage((prev) => {
            const delta = chunk.choices[0].delta;
            const role = ((prev?.role ?? "") + (delta.role ?? "")) as any;
            const content = (prev?.content ?? "") + (delta.content ?? "");
            return {
              role,
              content,
            };
          });
        }
      },
      onclose() {
        finishStreaming();
      },
      onerror(e) {
        console.error(e);
        finishStreaming();
      },
    });
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }

      setIsAtBottom(true);
    }
  };

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        setIsAtBottom(scrollHeight - scrollTop - clientHeight < 1);
      }
    }
  };

  const abort = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      finishStreaming();
    }
  };

  React.useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, streamedMessage, isAtBottom]);

  React.useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const shouldShowAbortButton = abortController && showAbort;

  return (
    <div className="font-sans flex flex-col h-screen">
      <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 relative">
        <div className={shouldShowAbortButton ? "pb-16" : ""}>
          {messages.map((message, i) => (
            <Message key={i} message={message} />
          ))}
          {streamedMessage ? <Message message={streamedMessage} /> : null}
        </div>
        {shouldShowAbortButton ? (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Button
              onClick={abort}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              Stop
            </Button>
          </div>
        ) : null}
      </ScrollArea>

      <div className="border-t p-4 bg-white">
        <div className="flex flex-row">
          <Textarea
            className="flex-1 resize-none h-[60px]"
            placeholder="Your message here..."
            value={messageDraft}
            onChange={(e) => setMessageDraft(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                console.log("onKeyDown");
                await postMessage();
              } else if (e.key === "Enter" && e.shiftKey) {
                setMessageDraft((prev) => prev + "\n");
              }
            }}
          />
          <Button
            className="ml-2"
            onClick={() => {
              console.log("onClick");
              postMessage();
            }}
            disabled={!messageDraft || !!streamedMessage}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
