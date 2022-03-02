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

  //   useEffect(() => {
  //     if (!canvasRef.current) {
  //       return;
  //     }
  //     const canvas: HTMLCanvasElement = canvasRef.current;
  //     const context = canvas.getContext("2d");
  //     if (context) {
  //       context.fillStyle = "#f3f4f6";
  //       context.fillRect(0, 0, windowSize.width, windowSize.height);
  //     }
  //   }, []);

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

  //   console.log(windowSize);

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
  const [isPainting, setIsPainting] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [image, setImage] = useState<ImageData | null>(null);

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
      if (isErasing) {
        // context.strokeStyle = "#f3f4f6";
        context.strokeStyle = color;
      } else {
        context.strokeStyle = color;
      }
      //   context.strokeStyle = color;
      context.lineJoin = "round";
      context.lineWidth = 5;

      context.beginPath();
      context.moveTo(originalMousePosition.x, originalMousePosition.y);
      context.lineTo(newMousePosition.x, newMousePosition.y);
      context.closePath();

      context.stroke();
    }
  };
  const eraseLineWidth = 20;
  const startPaint = useCallback((event: MouseEvent) => {
    const coordinates = getCoordinates(event);
    if (coordinates) {
      setIsPainting(true);
      setMousePosition(coordinates);
    }
  }, []);

  function lengthBetweenTwoPoints(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** (1 / 2);
  }

  function getAngle(x1: number, y1: number, x2: number, y2: number) {
    var rad = Math.atan2(y2 - y1, x2 - x1);
    return (rad * 180) / Math.PI;
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
      if (isPainting) {
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
    [isPainting, mousePosition]
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
      console.log(imageData);
      setImage(imageData);
    }

    setIsPainting(false);
  }, []);

  const clearCanvas = () => {
    console.log("delete");
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.getContext("2d")!!.clearRect(0, 0, canvas.width, canvas.height);
    setImage(null);
  };

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
    console.log(isErasing);
  };
  const draw = () => {
    setIsErasing(false);
  };

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
    // canvas.addEventListener("mouseleave", exitPaint);

    return () => {
      canvas.removeEventListener("mousedown", startPaint);
      canvas.removeEventListener("mousemove", paint);
      canvas.removeEventListener("mouseup", exitPaint);
      // canvas.removeEventListener("mouseleave", exitPaint);

      canvas.removeEventListener("touchstart", startTouch);
      canvas.removeEventListener("touchmove", touch);
      canvas.removeEventListener("touchend", exitTouch);
    };
  }, [startPaint, paint, exitPaint]);

  const startTouch = useCallback((event: TouchEvent) => {
    // MouseEvent인터페이스를 TouchEvent로
    event.preventDefault();
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    var touch = event.touches[0]; // event로 부터 touch 좌표를 얻어낼수 있습니다.
    var mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    canvas.dispatchEvent(mouseEvent); // 앞서 만든 마우스 이벤트를 디스패치해줍니다
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
  return (
    <div className=" ">
      <div className="mt-3 flex justify-between mx-3">
        <button className="w-10 h-10 rounded-full font-bold text-4xl">
          🎨
        </button>
        <p className=" font-bold text-sm text-gray-600"> </p>
        <div>
          <button
            className="w-10 h-10 rounded-full  bg-gray-100 font-bold mr-3"
            onClick={clearCanvas}
          >
            ◀️
          </button>
          <button
            className="w-10 h-10 rounded-full bg-gray-100 font-bold mr-3"
            onClick={clearCanvas}
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

// Canvas.defaultProps = {
//   width: 800,
//   height: 600,
// };
