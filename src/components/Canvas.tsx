import React, { useRef, useState, useEffect, useCallback } from "react";
import { useColorState, useColorDispatch } from "../context";

interface CanvasProps {
  width: number;
  height: number;
}

interface Coordinate {
  x: number;
  y: number;
}

export function Canvas() {
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
      canvas.style.height = `${windowSize.height}px`;
    }
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [windowSize]);

  console.log(windowSize);

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
      var c = context.getImageData(
        originalMousePosition.x,
        originalMousePosition.y,
        1,
        1
      ).data;
      console.log(c);
    }
  };

  const startPaint = useCallback((event: MouseEvent) => {
    const coordinates = getCoordinates(event);
    if (coordinates) {
      setIsPainting(true);
      setMousePosition(coordinates);
    }
  }, []);

  const paint = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (isPainting) {
        const newMousePosition = getCoordinates(event);
        if (mousePosition && newMousePosition) {
          drawLine(mousePosition, newMousePosition);
          setMousePosition(newMousePosition);
        }
      }
    },
    [isPainting, mousePosition]
  );

  const exitPaint = useCallback(() => {
    setIsPainting(false);
  }, []);

  const clearCanvas = () => {
    console.log("delete");
    if (!canvasRef.current) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.getContext("2d")!!.clearRect(0, 0, canvas.width, canvas.height);
  };

  //   useEffect(() => {
  //     if (!canvasRef.current) {
  //       return;
  //     }
  //     const canvas: HTMLCanvasElement = canvasRef.current;
  //     const context = canvas.getContext("2d");

  //     if (context) {
  //       console.log("fdsh");
  //       canvas.style.width = `${window.innerWidth}px`;
  //       canvas.style.height = `${window.innerHeight}px`;
  //     }
  //   }, [window.innerWidth, window.innerHeight]);

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
    <div className="container ">
      <canvas
        ref={canvasRef}
        height={windowSize.height}
        width={windowSize.width}
        className="rounded-lg bg-gray-200"
      />
      <button className="rounded-lg p-3 mt-3 bg-gray-100" onClick={clearCanvas}>
        delete
      </button>
    </div>
  );
}

// Canvas.defaultProps = {
//   width: 800,
//   height: 600,
// };
