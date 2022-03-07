import React, { useRef, useState, useEffect, useCallback } from "react";
import { useColorState, useColorDispatch } from "../context";
import { SelectColor } from "./SelectColor";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";

interface Coordinate {
  x: number;
  y: number;
}

export function Canvas() {
  const filenames = ["🎨", "🖍", "🧽"];

  if (isMobile) {
    document.body.style.overscrollBehaviorY = "none";
  }
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const handleResize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      canvas.style.width = `${windowSize.width}px`;
      canvas.style.height = `${windowSize.height * 0.8}px`;
      if (image) {
        context.putImageData(image, 0, 0);
      }
    }
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [windowSize]);

  const colorState = useColorState();
  const color: string =
    "#" +
    colorState.red.toString(16).padStart(2, "0") +
    colorState.green.toString(16).padStart(2, "0") +
    colorState.blue.toString(16).padStart(2, "0");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(
    undefined
  );
  const [isMoving, setIsMoving] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [image, setImage] = useState<ImageData | null>(null);

  let undoArray: ImageData[] = [];
  let redoArray: ImageData[] = [];

  const eraseLineWidth = 20;

  const getCoordinates = (event: MouseEvent): Coordinate | undefined => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    return {
      x: event.pageX - canvas.offsetLeft,
      y: event.pageY - canvas.offsetTop,
    };
  };

  const drawLine = (
    originalMousePosition: Coordinate,
    newMousePosition: Coordinate
  ) => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      context.strokeStyle = color;
      context.lineJoin = "round";
      context.lineWidth = 5;

      context.beginPath();
      context.moveTo(originalMousePosition.x, originalMousePosition.y);
      context.lineTo(newMousePosition.x, newMousePosition.y);
      context.closePath();

      context.stroke();
    }
  };

  const startPaint = useCallback(
    (event: MouseEvent) => {
      const coordinates = getCoordinates(event);
      if (coordinates) {
        setIsMoving(true);
        setMousePosition(coordinates);
        if (!canvasRef.current) {
          return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext("2d");

        if (context && !isErasing) {
          undoArray.push(
            context.getImageData(0, 0, canvas.width, canvas.height)
          );
          redoArray = [];
          console.log("Start", undoArray);
        }
      }
    },
    [isErasing]
  );

  function lengthBetweenTwoPoints(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** (1 / 2);
  }

  const paint = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!canvasRef.current) {
        return;
      }
      const canvas: HTMLCanvasElement = canvasRef.current;
      const context = canvas.getContext("2d");
      if (isMoving) {
        const newMousePosition = getCoordinates(event);

        if (context && mousePosition && newMousePosition) {
          if (isErasing) {
            context.save();
            context.beginPath();
            context.arc(
              newMousePosition.x,
              newMousePosition.y,
              eraseLineWidth / 2,
              0,
              2 * Math.PI
            );
            if (
              lengthBetweenTwoPoints(
                mousePosition.x,
                mousePosition.y,
                newMousePosition.x,
                newMousePosition.y
              ) /
                (eraseLineWidth / 4) >=
              1
            ) {
              const n = Math.floor(
                lengthBetweenTwoPoints(
                  mousePosition.x,
                  mousePosition.y,
                  newMousePosition.x,
                  newMousePosition.y
                ) /
                  (eraseLineWidth / 4)
              );
              for (var i = 0; i < n + 1; i++) {
                context.arc(
                  (mousePosition.x * i + newMousePosition.x * (n + 1 - i)) /
                    (n + 1),
                  (mousePosition.y * i + newMousePosition.y * (n + 1 - i)) /
                    (n + 1),
                  eraseLineWidth / 2,
                  0,
                  2 * Math.PI
                );
              }
            }
            context.clip();
            context.clearRect(0, 0, canvas.width, canvas.height);

            setMousePosition(newMousePosition);

            context.restore();
          } else {
            drawLine(mousePosition, newMousePosition);
            setMousePosition(newMousePosition);
          }
        }
      }
    },
    [isMoving, mousePosition]
  );

  const exitPaint = useCallback(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext("2d");
    if (context) {
      let imageData = context.getImageData(
        0,
        0,
        windowSize.width,
        windowSize.height
      );
      setImage(imageData);
    }
    setIsMoving(false);
  }, []);

  const startTouch = useCallback((event: TouchEvent) => {
    event.preventDefault();
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    var touch = event.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    canvas.dispatchEvent(mouseEvent);
  }, []);

  const touch = useCallback((event: TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    var touch = event.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    canvas.dispatchEvent(mouseEvent);
  }, []);

  const exitTouch = useCallback((event: TouchEvent) => {
    event.preventDefault();

    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    var mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;

    canvas.addEventListener("mousedown", startPaint);
    canvas.addEventListener("mousemove", paint);
    canvas.addEventListener("mouseup", exitPaint);

    canvas.addEventListener("touchstart", startTouch);
    canvas.addEventListener("touchmove", touch);
    canvas.addEventListener("touchend", exitTouch);

    return () => {
      canvas.removeEventListener("mousedown", startPaint);
      canvas.removeEventListener("mousemove", paint);
      canvas.removeEventListener("mouseup", exitPaint);

      canvas.removeEventListener("touchstart", startTouch);
      canvas.removeEventListener("touchmove", touch);
      canvas.removeEventListener("touchend", exitTouch);
    };
  }, [startPaint, paint, exitPaint, startTouch, touch, exitTouch]);

  const clearCanvas = () => {
    console.log("delete");
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.getContext("2d")!!.clearRect(0, 0, canvas.width, canvas.height);
    setImage(null);
  };

  const undo = useCallback(() => {
    console.log("undo", undoArray);
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext("2d");
    if (context) {
      if (undoArray.length == 0) {
        console.log("없어");
      } else {
        redoArray.push(context.getImageData(0, 0, canvas.width, canvas.height));
        context.putImageData(undoArray[undoArray.length - 1], 0, 0);
        undoArray.pop();
      }
    }
  }, []);

  const redo = useCallback(() => {
    console.log("redo", redoArray);

    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext("2d");
    if (context) {
      if (redoArray.length == 0) {
        console.log("없어");
      } else {
        undoArray.push(context.getImageData(0, 0, canvas.width, canvas.height));
        context.putImageData(redoArray[redoArray.length - 1], 0, 0);
        redoArray.pop();
      }
    }
  }, []);

  function downloadCanvas(filename: string) {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const link: HTMLAnchorElement = document.createElement("a");
    link.href = canvas.toDataURL();
    link.download = filename;
    link.click();
  }

  const erase = () => {
    setIsErasing(true);
  };
  const draw = () => {
    setIsErasing(false);
  };
  return (
    <div className=" ">
      <div className="mt-3 flex justify-between mx-3">
        <button
          className="w-10 h-10 rounded-full font-bold text-4xl"
          onClick={clearCanvas}
        >
          🎨
        </button>
        <p className=" font-bold text-sm text-gray-600"> </p>
        <div>
          <button
            className="w-10 h-10 rounded-full  bg-gray-100 font-bold mr-3"
            onClick={undo}
          >
            ◀️
          </button>
          <button
            className="w-10 h-10 rounded-full bg-gray-100 font-bold mr-3"
            onClick={redo}
          >
            ▶️
          </button>
          <button
            className="w-10 h-10 rounded-full bg-gray-100 font-bold "
            onClick={
              () => downloadCanvas(filenames[0]) //Math.floor(Math.random() * 3)
            }
          >
            💥
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        height={windowSize.height * 0.8}
        width={windowSize.width}
        className="rounded-lg bg-gray-100 mt-3 overscroll-y-none"
      />
      <div className="mt-3 mx-3 flex justify-between">
        <div>
          <button
            className={`w-10 h-10 rounded-full  font-bold mr-3 ${
              isErasing ? "text-lg" : "text-4xl"
            }`}
            onClick={draw}
          >
            🖍
          </button>
          <button
            className={`w-10 h-10 rounded-full  font-bold mr-3  ${
              isErasing ? "text-4xl" : "text-lg"
            }`}
            onClick={erase}
          >
            🧽
          </button>
        </div>
        <SelectColor />
      </div>
    </div>
  );
}
