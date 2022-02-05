import React, { useRef, useState, useCallback, useEffect } from "react";
import { SketchPicker } from "react-color";

interface CanvasProps {
  width: number;
  height: number;
}

interface Coordinate {
  x: number;
  y: number;
}

function App({ width, height }: CanvasProps) {
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
      context.strokeStyle = "red";
      context.lineJoin = "round";
      context.lineWidth = 5;

      context.beginPath();
      context.moveTo(originalMousePosition.x, originalMousePosition.y);
      context.lineTo(newMousePosition.x, newMousePosition.y);
      context.closePath();

      context.stroke();
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

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;

    canvas.addEventListener("mousedown", startPaint);
    canvas.addEventListener("mousemove", paint);
    canvas.addEventListener("mouseup", exitPaint);
    // canvas.addEventListener("mouseleave", exitPaint);

    return () => {
      canvas.removeEventListener("mousedown", startPaint);
      canvas.removeEventListener("mousemove", paint);
      canvas.removeEventListener("mouseup", exitPaint);
      // canvas.removeEventListener("mouseleave", exitPaint);
    };
  }, [startPaint, paint, exitPaint]);

  const slider: HTMLElement | null = document.querySelector("#slider");
  const picker: HTMLElement | null = document.querySelector("#picker");
  let shiftX: number = 0;
  let newLeft: number = 0;
  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    console.log("왜안돼");
    if (picker) {
      console.log(picker.getBoundingClientRect().left);
      console.log(e.clientX);
      let shiftX = e.clientX - picker.getBoundingClientRect().left;
      console.log(shiftX);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  };
  function onMouseMove(e: MouseEvent) {
    newLeft = e.clientX - shiftX - slider!.getBoundingClientRect().left;
    console.log(newLeft);
    // the pointer is out of slider => lock the thumb within the bounaries
    if (newLeft < 0) {
      newLeft = 0;
    }
    let rightEdge = slider!.offsetWidth - picker!.offsetWidth;
    if (newLeft > rightEdge) {
      newLeft = rightEdge;
    }
    picker!.style.left = newLeft + "px";
  }

  function onMouseUp() {
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mousemove", onMouseMove);
  }

  return (
    <div className="container mx-auto my-10">
      <canvas
        ref={canvasRef}
        height={height}
        width={width}
        className="rounded-lg bg-gray-200"
      />
      <button className="rounded-lg p-3 mt-3 bg-gray-100" onClick={clearCanvas}>
        delete
      </button>
      {/* <SketchPicker /> */}
      <div
        className="w-96 h-10 rounded-full bg-gradient-to-r from-black to-real-red"
        id="slider"
      >
        <div
          className="w-10 h-10 x-10 border-4 border-white rounded-full bg-gray-500"
          style={{ position: "relative", left: "0px" }}
          onMouseDown={(event: any) => {
            onMouseDown(event);
          }}
          id="picker"
        />
      </div>
    </div>
  );
}

App.defaultProps = {
  width: 800,
  height: 600,
};

export default App;
