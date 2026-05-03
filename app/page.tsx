"use client";
import { twMerge } from "tailwind-merge";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useReducer,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Play,
  RefreshCcw,
  User,
  MessageSquare,
  Loader2,
  Volume2,
  Video,
  BanIcon,
} from "lucide-react";
import {
  CHARACTERS,
  FONTS,
  type Character,
  type FontOption,
  type Emotion,
} from "@/lib/characters";
import GIF from "gif.js";
import confetti from "canvas-confetti";
import { Slider } from "@/lib/slider";

// Undertale Dialog Box Dimensions
const BOX_WIDTH = 578;
const BOX_HEIGHT = 152;
const BORDER_SIZE = 4;
const PADDING = 10;
const PORTRAIT_SIZE = 100;

export default function UndertaleGenerator() {
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [text, setText] = useState(
    "* it's a beautiful day outside. birds are singing, flowers are blooming..."
  );
  const [selectedChar, setSelectedChar] = useState<Character>(CHARACTERS[0]);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(
    CHARACTERS[0].emotions?.[0] || null
  );
  const [selectedFont, setSelectedFont] = useState<FontOption>(FONTS[1]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genType, setGenType] = useState<"gif" | "video">("gif");
  const [progress, setProgress] = useState(0);
  const [previewResult, setPreviewResult] = useState<{
    url: string;
    type: "gif" | "video";
    extension: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const voiceBuffer = useRef<AudioBuffer | null>(null);
  const portraitCache = useRef<HTMLImageElement | null>(null);
  const [, rerender] = useReducer((x) => x + 1, 0); // force rerender for async image load

  // Initialize AudioContext
  const getAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContext.current;
  };

  // Preload voice sound
  useEffect(() => {
    const loadVoice = async () => {
      if (!selectedChar.voiceUrls) return;
      try {
        const voiceUrl = selectedChar.voiceUrls?.[selectedVoiceIndex];
        if (!voiceUrl) {
          voiceBuffer.current = null;
          return;
        }

        const response = await fetch(voiceUrl);

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const ctx = getAudioContext();

        // Use promise wrapper to handle potential issues with different decodeAudioData implementations
        const buffer = await new Promise<AudioBuffer>((resolve, reject) => {
          ctx.decodeAudioData(arrayBuffer, resolve, reject);
        });

        voiceBuffer.current = buffer;
      } catch (err) {
        console.error("Voice load error:", err);
        // We set to null so speak() can use the procedural fallback
        voiceBuffer.current = null;
      }
    };
    loadVoice();
  }, [selectedChar, selectedVoiceIndex]);

  const [speed, setSpeed] = useState(1);
  const speak = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    if (voiceBuffer.current) {
      const source = ctx.createBufferSource();
      source.buffer = voiceBuffer.current;

      const gain = ctx.createGain();
      gain.gain.value = 0.3;

      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
    } else {
      // Procedural fallback: square wave blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      // Pitch varies slightly by character or just use a default
      const freq =
        selectedChar.id === "sans"
          ? 110
          : selectedChar.id === "papyrus"
          ? 220
          : 330;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  }, [selectedChar.id]);

  // Draw the dialog box to canvas
  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    currentText: string,
    char: Character
  ) => {
    try {
      // Clear
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, BOX_WIDTH, BOX_HEIGHT);

      // Border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = BORDER_SIZE;
      ctx.strokeRect(
        BORDER_SIZE / 2,
        BORDER_SIZE / 2,
        BOX_WIDTH - BORDER_SIZE,
        BOX_HEIGHT - BORDER_SIZE
      );

      let textX = PADDING + 20;
      const textY = PADDING + 10;

      // Portrait
      const finalPortraitUrl = selectedEmotion?.url || char.portraitUrl;
      if (char.id !== "none" && finalPortraitUrl) {
        textX = PADDING + PORTRAIT_SIZE + 50;
      }

      const portrait = portraitCache.current;

      if (char.id !== "none" && portrait) {
        // textX = PADDING + PORTRAIT_SIZE + 30;

        // ctx.drawImage(
        //   portrait,
        //   PADDING + 15,
        //   (BOX_HEIGHT - PORTRAIT_SIZE) / 2,
        //   PORTRAIT_SIZE,
        //   PORTRAIT_SIZE
        // );
        ctx.imageSmoothingEnabled = false;

        const maxW = PORTRAIT_SIZE + 8;
        const maxH = BOX_HEIGHT - BORDER_SIZE * 2 - PADDING * 2 + 8;

        // Scale to fit within BOTH width and height, preserving aspect ratio
        const scaleByW =
          portrait.width < maxW
            ? Math.floor(maxW / portrait.width) || 1
            : maxW / portrait.width;
        const scaleByH =
          portrait.height < maxH
            ? Math.floor(maxH / portrait.height) || 1
            : maxH / portrait.height;

        // Use whichever is smaller so neither axis overflows
        let scale = Math.min(scaleByW, scaleByH);

        // For upscaling, keep integer steps to preserve pixel-art crispness
        if (scale > 1) scale = Math.floor(scale);
        if (char.id == "asriel") {
          scale = 2.7;
        }
        if (char.id == "toriel") {
          scale = 2.5;
        }
        if (char.id == "alphys") {
          scale = 1.8;
        }

        const drawWidth = portrait.width * scale;
        const drawHeight = portrait.height * scale;

        const x = Math.floor(PADDING + 15);
        const y = Math.floor((BOX_HEIGHT - drawHeight) / 2);

        ctx.drawImage(portrait, x, y, drawWidth, drawHeight);

        textX = x + drawWidth + 30;
      } else if (char.id !== "none") {
        // fallback placeholder while loading
        textX = PADDING + PORTRAIT_SIZE + 30;

        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          PADDING + 15,
          (BOX_HEIGHT - PORTRAIT_SIZE) / 2,
          PORTRAIT_SIZE,
          PORTRAIT_SIZE
        );
      }

      // Text settings
      ctx.fillStyle = "#ffffff";
      const font = selectedFont.name;
      ctx.font = `22px ${font}, "Press Start 2P", courier, monospace`;
      ctx.textBaseline = "top";

      const maxTextWidth = BOX_WIDTH - textX - 15;
      const paragraphs = currentText.split("\n");
      let allLines: string[] = [];

      paragraphs.forEach((paragraph, pIdx) => {
        const words = paragraph.split(" ");
        let currentLine = "";

        words.forEach((word) => {
          const testLine = currentLine ? currentLine + " " + word : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextWidth && currentLine !== "") {
            allLines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        allLines.push(currentLine);
      });

      // Split text by lines
      allLines.forEach((line, index) => {
        ctx.fillText(line, textX, textY + index * 32);
      });
      // allLines.forEach((line, lineIndex) => {
      //   let charX = textX;
      //   const baseY = textY + lineIndex * 32;

      //   for (const char of line) {
      //     const shakeX = (Math.random() - 0.5) * 3;
      //     const shakeY = (Math.random() - 0.5) * 3;
      //     ctx.fillText(char, charX + shakeX, baseY + shakeY);
      //     charX += ctx.measureText(char).width;
      //   }
      // });

      // Split text by lines
      // const lines = currentText.split("\n");
      // lines.forEach((line, index) => {
      //   const prefix = index === 0 ? "* " : "  ";
      //   ctx.fillText(prefix + line, textX, textY + index * 34);
      // });
    } catch (err) {
      console.error("Draw frame error:", err);
    }
  };

  // Update canvas preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawFrame(ctx, text, selectedChar);
      }
    } catch (err) {
      console.error("Effect preview error:", err);
    }
  }, [text, selectedChar, selectedFont, selectedEmotion]);

  useEffect(() => {
    const url = selectedEmotion?.url || selectedChar.portraitUrl;
    if (!url) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;

    img.onload = () => {
      portraitCache.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) drawFrame(ctx, text, selectedChar);
      }
    };

    img.onerror = () => {
      portraitCache.current = null;
    };
  }, [selectedChar, selectedEmotion]);

  const generateGif = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenType("gif");
    setProgress(0);
    setPreviewResult(null);
    setError(null);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not found");

      // Fix for Worker origin issue: fetch the script and create a blob URL
      const workerUrl =
        "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js";
      const response = await fetch(workerUrl);
      const scriptText = await response.text();
      const blob = new Blob([scriptText], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);

      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: BOX_WIDTH,
        height: BOX_HEIGHT,
        workerScript: blobUrl,
        debug: true,
      });

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Could not get 2D context");

      // We want to record the "typing" effect
      const fullText = text;
      const lines = fullText.split("\n");
      let currentLines: string[] = lines.map(() => "");

      const charsToType: { lineIdx: number; charIdx: number; char: string }[] =
        [];
      lines.forEach((line, lIdx) => {
        for (let i = 0; i < line.length; i++) {
          charsToType.push({ lineIdx: lIdx, charIdx: i, char: line[i] });
        }
      });

      // Add initial empty frame
      drawFrame(ctx, currentLines.join("\n"), selectedChar);
      gif.addFrame(ctx, { copy: true, delay: 100 });

      // Type character by character
      for (let i = 0; i < charsToType.length; i++) {
        const { lineIdx, char } = charsToType[i];
        currentLines[lineIdx] += char;

        drawFrame(ctx, currentLines.join("\n"), selectedChar);
        let delay = 40;
        if (
          char === "." &&
          (charsToType[i + 1]?.char === " " ||
            charsToType[i + 1]?.char === "\n")
        )
          delay = 300;
        else if (
          char === "," &&
          (charsToType[i + 1]?.char === " " ||
            charsToType[i + 1]?.char === "\n")
        )
          delay = 200;
        else if (
          (char === "!" || char === "?") &&
          (charsToType[i + 1]?.char === " " ||
            charsToType[i + 1]?.char === "\n")
        )
          delay = 300;
        else if (
          char === ";" &&
          (charsToType[i + 1]?.char === " " ||
            charsToType[i + 1]?.char === "\n")
        )
          delay = 200;

        delay /= speed;

        gif.addFrame(ctx, { copy: true, delay });

        setProgress(Math.round(((i + 1) / charsToType.length) * 0.8 * 100));
      }

      // Final frame hold
      gif.addFrame(ctx, { copy: true, delay: 2000 });

      gif.on("progress", (p: number) => {
        setProgress(80 + Math.round(p * 20));
      });

      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setPreviewResult({ url, type: "gif", extension: "gif" });
        setIsGenerating(false);
        setProgress(100);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      });

      gif.render();
    } catch (err: any) {
      console.error("GIF Init Error:", err);
      setError(err?.message || "An initialization error occurred.");
      setIsGenerating(false);
    }
  };

  const generateVideo = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenType("video");
    setProgress(0);
    setPreviewResult(null);
    setError(null);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not found");

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2D context");

      const audioCtx = getAudioContext();
      if (audioCtx.state === "suspended") await audioCtx.resume();

      // Setup audio stream
      const dest = audioCtx.createMediaStreamDestination();
      const canvasStream = canvas.captureStream(30); // 30 FPS

      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      let mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
      let extension = "mp4";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/mp4";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm";
        extension = "webm";
      }
      // for (const type of supportedMimeTypes) {
      //   if (MediaRecorder.isTypeSupported(type)) {
      //     mimeType = type;
      //     if (type.includes("mp4")) extension = "mp4";
      //     break;
      //   }
      // }

      if (!mimeType) throw new Error("No supported video mime type found");

      const mediaRecorder = new MediaRecorder(combinedStream, { mimeType });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setPreviewResult({ url, type: "video", extension });
        setIsGenerating(false);
        setProgress(100);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      };

      mediaRecorder.start();

      const fullText = text;
      const lines = fullText.split("\n");

      const charsToType: { lineIdx: number; charIdx: number; char: string }[] =
        [];
      lines.forEach((line, lIdx) => {
        for (let i = 0; i < line.length; i++) {
          charsToType.push({ lineIdx: lIdx, charIdx: i, char: line[i] });
        }
      });

      const speakAndDraw = async () => {
        let t = audioCtx.currentTime + 0.01;
        const startTime = t;

        // IMPORTANT: start from empty
        let workingLines = lines.map(() => "");

        charsToType.forEach(({ lineIdx, char }, i) => {
          // --- timing ---
          let delay = 40;
          if (
            char === "." &&
            (charsToType[i + 1]?.char === " " ||
              charsToType[i + 1]?.char === "\n")
          )
            delay = 300;
          else if (
            char === "," &&
            (charsToType[i + 1]?.char === " " ||
              charsToType[i + 1]?.char === "\n")
          )
            delay = 160;
          else if (
            (char === "!" || char === "?") &&
            (charsToType[i + 1]?.char === " " ||
              charsToType[i + 1]?.char === "\n")
          )
            delay = 300;
          else if (
            char === ";" &&
            (charsToType[i + 1]?.char === " " ||
              charsToType[i + 1]?.char === "\n")
          )
            delay = 200;

          delay /= speed;

          const step = delay / 1000;
          const isSilent = char === " " || char === "\n";

          // ensure future scheduling
          const now = audioCtx.currentTime;
          if (t < now + 0.005) {
            t = now + 0.005;
          }

          // ✅ APPLY CHARACTER (mutate working state)
          workingLines[lineIdx] += char;

          // ✅ SNAPSHOT STATE (this is the fix)
          const snapshot = workingLines.slice();

          // --- schedule audio ---
          if (!isSilent) {
            if (voiceBuffer.current) {
              const source = audioCtx.createBufferSource();
              source.buffer = voiceBuffer.current;

              const gain = audioCtx.createGain();
              gain.gain.setValueAtTime(0.75, t);
              gain.gain.exponentialRampToValueAtTime(0.001, t + 0.95);

              source.connect(gain);
              gain.connect(dest);

              source.start(t);
              source.stop(t + 0.95);
            } else {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();

              const freq =
                selectedChar.id === "sans"
                  ? 110
                  : selectedChar.id === "papyrus"
                  ? 220
                  : 330;

              osc.type = "square";
              osc.frequency.setValueAtTime(freq, t);

              gain.gain.setValueAtTime(0.75, t);
              gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

              osc.connect(gain);
              gain.connect(dest);

              osc.start(t);
              osc.stop(t + 0.05);
            }
          }

          // --- schedule draw (uses snapshot, NOT live state) ---
          const drawDelay = (t - audioCtx.currentTime) * 1000;

          setTimeout(() => {
            drawFrame(ctx, snapshot.join("\n"), selectedChar);
            setProgress(Math.round(((i + 1) / charsToType.length) * 100));
          }, Math.max(0, drawDelay));

          // advance timeline
          t += step;
        });

        // stop recording after everything
        const totalDuration = (t - startTime + 2) * 1000;

        // setTimeout(() => {
        //   mediaRecorder.stop();
        // }, totalDuration);
        const holdDuration = 1500;

        setTimeout(() => {
          const snapshot = workingLines.slice();
          drawFrame(ctx, snapshot.join("\n"), selectedChar);
          setTimeout(() => {
            drawFrame(ctx, snapshot.join("\n"), selectedChar);
            mediaRecorder.stop();
          }, holdDuration);
        }, totalDuration);
      };

      // Initial delay
      setTimeout(() => speakAndDraw(), 500);
    } catch (err: any) {
      console.error("Video Gen Error:", err);
      setError(err?.message || "Video initialization error.");
      setIsGenerating(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12 flex flex-col gap-10">
      {/* Hidden Active Portrait for Canvas Ref */}
      {selectedChar.portraitUrl.length != 0 && (
        <img
          id="active-portrait"
          src={selectedChar.portraitUrl}
          className="hidden"
          crossOrigin="anonymous"
          alt="active"
        />
      )}

      {/* Header */}
      <header className="flex flex-col gap-2 items-start">
        <h1 className="text-3xl font-medium tracking-tighter">
          <span className="opacity-80">Undertale Dialog Box</span> Generator
        </h1>
        <p className="opacity-50 text-sm font-normal">
          Undertale Dialogue Engine v1.0 - Create custom dialog boxes and export
          as GIF or Video!
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Controls */}
        <section className="flex flex-col gap-8  bg-black dark:bg-transparent dark:border-white/10 backdrop-blur-xl p-8 rounded border">
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-bold text-white opacity-50 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Character & Font
            </p>
            <div className="grid grid-cols-3 gap-3">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => {
                    setSelectedChar(char);
                    setSelectedEmotion(char.emotions?.[0] || null);
                    setSelectedVoiceIndex(0); // 👈 reset voice
                    // Automatically update font if character has a default
                    if (char.defaultFont) {
                      const font = FONTS.find((f) => f.id === char.defaultFont);
                      if (font) setSelectedFont(font);
                    }
                  }}
                  className={`
                    flex flex-col items-center p-3 rounded border transition-all duration-200 bg-black cursor-pointer
                    ${
                      selectedChar.id === char.id
                        ? "border-white/50"
                        : "border-white/10"
                    }
                  `}
                >
                  <div className="size-11 relative mb-2 flex items-center justify-center">
                    {char.portraitUrl ? (
                      <img
                        src={char.portraitUrl}
                        alt={char.name}
                        crossOrigin="anonymous"
                        className="object-contain w-full h-full pixelated pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full rounded flex items-center justify-center text-white">
                        <BanIcon className="size-5 mt-4" />
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium truncate w-full text-center ${
                      selectedChar.id === char.id
                        ? "text-white"
                        : "text-white/40"
                    }`}
                  >
                    {char.name}
                  </span>
                </button>
              ))}
            </div>
            {selectedChar.voiceUrls && selectedChar.voiceUrls.length > 1 && (
              <div className="mt-2 p-4 bg-black/20 rounded border border-white/10 flex flex-col gap-3">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  Voice
                </span>

                <div className="flex flex-wrap gap-2">
                  {selectedChar.voiceUrls.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVoiceIndex(idx)}
                      className={`
                      px-4 py-2 cursor-pointer rounded-md text-[10px] font-bold uppercase tracking-wider transition-all
                      ${
                        selectedVoiceIndex === idx
                          ? "bg-white text-black"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }
                    `}
                    >
                      Voice {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Emotions Selection */}
            {selectedChar.emotions && selectedChar.emotions.length > 1 && (
              <div className="mt-2 p-4 bg-black/20 rounded border border-white/10 flex flex-col gap-3">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  Emotion
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedChar.emotions.map((emotion) => (
                    <button
                      key={emotion.url}
                      onClick={() => setSelectedEmotion(emotion)}
                      className={`
                        px-4 py-2 cursor-pointer rounded-md text-[10px] font-bold uppercase tracking-wider transition-all
                        ${
                          selectedEmotion?.name === emotion.name
                            ? "bg-white text-black"
                            : "bg-white/5 text-white/40 hover:bg-white/10"
                        }
                      `}
                    >
                      {emotion.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-2 px-4 pt-4 bg-black/20 rounded border border-white/10 flex flex-col gap-3 pb-11">
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                Speed {"<"}- slower, faster -{">"}
              </span>
              <div className="mx-4">
                <Slider
                  minValue={0.2}
                  value={speed}
                  onChange={(newSpeed) => setSpeed(newSpeed as number)}
                  step={0.1}
                  maxValue={1.8}
                  labelPosition="bottom"
                />
              </div>
            </div>

            <div className="mt-2 p-4 bg-black/20 rounded border border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  Select Font
                </span>
                <button
                  onClick={speak}
                  className="p-1 cursor-pointer px-2 rounded-md bg-white/5 text-[9px] font-bold text-white/40 hover:bg-white/10 flex items-center gap-1 transition-colors"
                >
                  <Volume2 className="w-3 h-3" /> Test Voice
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setSelectedFont(font)}
                    className={`
                      px-4 py-2 cursor-pointer rounded-md text-xs font-medium transition-all ${
                        font.id == "papyrus" ? "uppercase" : "lowercase"
                      }
                      ${
                        selectedFont.id === font.id
                          ? "bg-white text-black"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }
                    `}
                    style={{ fontFamily: font.variable }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Message
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-black/30 border text-white border-white/10 rounded p-4 text-2xl focus:outline-none focus:border-white/30 transition-colors h-40 resize-none placeholder:text-white/10"
              style={{ fontFamily: selectedFont.variable }}
              placeholder="* it's a beautiful day outside. birds are singing, flowers are blooming..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto">
            <button
              onClick={generateGif}
              disabled={isGenerating}
              className={`
                py-4 cursor-pointer rounded-md font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300
                ${
                  isGenerating
                    ? "bg-white/10 text-white/30 cursor-not-allowed"
                    : "bg-white text-black active:scale-95"
                }
              `}
            >
              {isGenerating && genType === "gif" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {progress}%
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  GIF
                </>
              )}
            </button>
            <button
              onClick={generateVideo}
              disabled={isGenerating}
              className={`
                py-4 rounded-md cursor-pointer font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300
                ${
                  isGenerating
                    ? "bg-white/10 text-white/30 cursor-not-allowed"
                    : "bg-white/10 text-white border border-white/10 hover:bg-white/20 active:scale-95"
                }
              `}
            >
              {isGenerating && genType === "video" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {progress}%
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  VIDEO
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Side: Preview */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="relative group overflow-hidden bg-black dark:bg-transparent dark:border-white/10 p-10 rounded border flex flex-col items-center justify-center min-h-[400px]">
              <p className="absolute top-8 left-8 text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                <RefreshCcw className="w-3.5 h-3.5" /> Canvas Preview
              </p>

              <div className="relative z-10 scale-[0.8] sm:scale-100">
                <div className="overflow-hidden border-[6px] border-white bg-black">
                  <canvas
                    ref={canvasRef}
                    width={BOX_WIDTH}
                    height={BOX_HEIGHT}
                    className="w-full h-auto pixelated"
                  />
                </div>
              </div>

              {previewResult && !isGenerating && (
                <div className="absolute bottom-8 flex gap-3">
                  <div className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-md border border-white/10 text-[11px] font-medium text-white/60">
                    Type: {previewResult.type.toUpperCase()}
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-md border border-white/10 text-[11px] font-medium text-white/60">
                    Status: Rendered
                  </div>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {previewResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col gap-4"
              >
                <div className=" bg-black dark:bg-transparent dark:border-white/10 backdrop-blur-xl p-8 rounded border flex flex-col gap-6">
                  <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Final Export
                  </p>
                  <div className="bg-black/40 p-2 rounded border border-white/5 overflow-hidden ring-1 ring-white/10">
                    {previewResult.type === "gif" ? (
                      <img
                        src={previewResult.url}
                        alt="Generated GIF"
                        className="w-full"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <video
                        src={previewResult.url}
                        controls
                        className="w-full"
                      />
                    )}
                  </div>
                  <a
                    href={previewResult.url}
                    download={`undertale-dialog.${previewResult.extension}`}
                    className="w-full bg-white text-black px-6 py-4 rounded-md font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD {previewResult.type.toUpperCase()}
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!previewResult && !isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12  bg-black dark:bg-transparent dark:border-white/10 border-2 border-transparent border-dashed rounded dark:opacity-40 opacity-100">
              <p className="text-white/50 text-sm font-medium leading-relaxed uppercase tracking-tighter">
                Click a record button to render <br aria-hidden="true" /> high
                fidelity animation
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12  bg-black dark:bg-transparent dark:border-white/10 backdrop-blur-xl border rounded">
              <div className="relative w-24 h-24 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - progress / 100)}
                    className="text-white transition-all duration-300 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-white">
                  {progress}%
                </div>
              </div>
              <p className="text-white text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
                Encoding {genType.toUpperCase()}
              </p>
              {genType === "video" && (
                <p className="text-white/40 text-[10px] mt-2 italic uppercase tracking-widest">
                  Applying audio sync...
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-red-500/10 border border-red-500/20 rounded gap-4">
              <div className="w-12 h-12 rounded-md bg-red-300 flex items-center justify-center text-red-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-red-500 font-bold text-sm uppercase tracking-wider">
                  Determination Error
                </p>
                <p className="text-black text-xs">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 cursor-pointer rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Decorative elements */}
      <footer className="mt-8 pt-8 border-t border-neutral-100 text-black/35 dark:text-white/30 dark:border-white/10 text-center text-[10px] flex flex-col gap-3">
        <div className="flex gap-x-2 justify-center">
          <p className="uppercase tracking-[0.5em] font-medium">
            Stay Determined
          </p>
          <img
            className="size-2 my-auto pointer-events-none"
            src="https://forty1thousand.github.io/undertale-generator/images/Undertale_red_soul.svg.png"
          />
        </div>
        <div className="flex justify-center gap-6 opacity-50">
          <span>Toby Fox &copy; 2015</span>
          <span>Engine v1.0</span>
          <a
            className="hover:underline"
            href="https://github.com/forty1thousand/undertale-generator"
          >
            Open Source
          </a>
        </div>
      </footer>

      <style>{`
        .pixelated {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </main>
  );
}
