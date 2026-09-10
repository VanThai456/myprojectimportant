import { useEffect, useRef, useState } from "react";

function TypewriterText({ text, speed = 35, onComplete, className = "" }) {
  const [visibleText, setVisibleText] = useState("");
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    let characterIndex = 0;
    setVisibleText("");

    const timer = setInterval(() => {
      characterIndex += 1;
      setVisibleText(text.slice(0, characterIndex));

      if (characterIndex >= text.length) {
        clearInterval(timer);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [speed, text]);

  return (
    <span className={className} aria-live="polite">
      {visibleText}
    </span>
  );
}

export default TypewriterText;
