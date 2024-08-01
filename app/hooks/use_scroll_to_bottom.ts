import React from "react";

export function useScrollToBottom(dependencies: React.DependencyList) {
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);
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

  React.useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, isAtBottom]);

  React.useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return { scrollAreaRef };
}
