"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  type AnimatePresenceProps,
  type MotionProps,
  type Transition,
} from "framer-motion";
import { cn } from "@/lib/cn";

export interface TextRotateRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

interface TextRotateProps {
  texts: string[];
  rotationInterval?: number;
  transition?: Transition;
  initial?: MotionProps["initial"];
  animate?: MotionProps["animate"];
  exit?: MotionProps["exit"];
  animatePresenceMode?: AnimatePresenceProps["mode"];
  animatePresenceInitial?: boolean;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | number | "random";
  loop?: boolean;
  auto?: boolean;
  splitBy?: "words" | "characters" | "lines" | string;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
  onNext?: (index: number) => void;
}

interface WordObject {
  characters: string[];
  needsSpace: boolean;
}

const TextRotate = forwardRef<TextRotateRef, TextRotateProps>(
  (
    {
      texts,
      rotationInterval = 2600,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      staggerDuration = 0.018,
      staggerFrom = "first",
      loop = true,
      auto = true,
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      splitBy = "characters",
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      onNext,
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const safeIndex = texts.length ? Math.min(currentIndex, texts.length - 1) : 0;
    const currentText = texts[safeIndex] ?? "";

    const splitIntoCharacters = (text: string) => {
      if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
        const segmenter = new Intl.Segmenter("fr", { granularity: "grapheme" });
        return Array.from(segmenter.segment(text), ({ segment }) => segment);
      }
      return Array.from(text);
    };

    const elements = useMemo(() => {
      if (splitBy === "characters") {
        const words = currentText.split(" ");
        return words.map((word, index) => ({
          characters: splitIntoCharacters(word),
          needsSpace: index !== words.length - 1,
        }));
      }

      return splitBy === "words"
        ? currentText.split(" ")
        : splitBy === "lines"
          ? currentText.split("\n")
          : currentText.split(splitBy);
    }, [currentText, splitBy]);

    const getStaggerDelay = useCallback(
      (index: number, total: number) => {
        if (staggerFrom === "first") return index * staggerDuration;
        if (staggerFrom === "last") return (total - 1 - index) * staggerDuration;
        if (staggerFrom === "center") {
          return Math.abs(Math.floor(total / 2) - index) * staggerDuration;
        }
        if (staggerFrom === "random") {
          return Math.abs(Math.floor(Math.random() * total) - index) * staggerDuration;
        }
        return Math.abs(staggerFrom - index) * staggerDuration;
      },
      [staggerFrom, staggerDuration]
    );

    const next = useCallback(() => {
      if (texts.length < 2) return;
      setCurrentIndex((index) => {
        const nextIndex = index === texts.length - 1 ? (loop ? 0 : index) : index + 1;
        if (nextIndex !== index) onNext?.(nextIndex);
        return nextIndex;
      });
    }, [loop, onNext, texts.length]);

    const previous = useCallback(() => {
      if (texts.length < 2) return;
      setCurrentIndex((index) => {
        const previousIndex = index === 0 ? (loop ? texts.length - 1 : index) : index - 1;
        if (previousIndex !== index) onNext?.(previousIndex);
        return previousIndex;
      });
    }, [loop, onNext, texts.length]);

    const jumpTo = useCallback(
      (index: number) => {
        if (!texts.length) return;
        const nextIndex = Math.max(0, Math.min(index, texts.length - 1));
        setCurrentIndex(nextIndex);
        onNext?.(nextIndex);
      },
      [onNext, texts.length]
    );

    const reset = useCallback(() => {
      setCurrentIndex(0);
      onNext?.(0);
    }, [onNext]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [
      jumpTo,
      next,
      previous,
      reset,
    ]);

    useEffect(() => {
      if (!auto || texts.length < 2) return;
      const intervalId = window.setInterval(next, rotationInterval);
      return () => window.clearInterval(intervalId);
    }, [auto, next, rotationInterval, texts.length]);

    return (
      <motion.span
        layout
        className={cn("flex flex-wrap whitespace-pre-wrap", mainClassName)}
        transition={transition}
      >
        <span className="sr-only">{currentText}</span>
        <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
          <motion.div
            key={safeIndex}
            layout
            aria-hidden="true"
            className={cn("flex flex-wrap", splitBy === "lines" && "w-full flex-col")}
          >
            {(splitBy === "characters"
              ? (elements as WordObject[])
              : (elements as string[]).map((element, index) => ({
                  characters: [element],
                  needsSpace: index !== elements.length - 1,
                }))
            ).map((word, wordIndex, words) => {
              const previousCharsCount = words
                .slice(0, wordIndex)
                .reduce((sum, item) => sum + item.characters.length, 0);
              const totalChars = words.reduce(
                (sum, item) => sum + item.characters.length,
                0
              );

              return (
                <span
                  key={wordIndex}
                  className={cn("inline-flex", splitLevelClassName)}
                >
                  {word.characters.map((character, characterIndex) => (
                    <motion.span
                      key={characterIndex}
                      initial={initial}
                      animate={animate}
                      exit={exit}
                      transition={{
                        ...transition,
                        delay: getStaggerDelay(
                          previousCharsCount + characterIndex,
                          totalChars
                        ),
                      }}
                      className={cn("inline-block", elementLevelClassName)}
                    >
                      {character}
                    </motion.span>
                  ))}
                  {word.needsSpace && <span className="whitespace-pre"> </span>}
                </span>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.span>
    );
  }
);

TextRotate.displayName = "TextRotate";

export { TextRotate };