import { Console } from "console";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { SketchPicker, BlockPicker, PhotoshopPicker } from "react-color";
import { ColorBar } from "./ColorBar";
import { ColorProvider, useColorState } from "./context";

interface CanvasProps {
  width: number;
  height: number;
}

interface Coordinate {
  x: number;
  y: number;
}

function App({ width, height }: CanvasProps) {
  const colorState = useColorState();
  console.log("APP", colorState);
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

  return (
    <ColorProvider>
      <div className="container mx-auto my-10">
        <canvas
          ref={canvasRef}
          height={height}
          width={width}
          className="rounded-lg bg-gray-200"
        />
        <button
          className="rounded-lg p-3 mt-3 bg-gray-100"
          onClick={clearCanvas}
        >
          delete
        </button>
        {/* <BlockPicker color="#333" /> */}
        {/* <ColorBar change={0} fixed1={"00"} fixed2={"00"} />
        <ColorBar change={1} fixed1={"00"} fixed2={"00"} />
        <ColorBar change={2} fixed1={"00"} fixed2={"00"} /> */}
        <ColorBar id={0} />
        <ColorBar id={1} />
        <ColorBar id={2} />
        {/* <ColorBar
          change={0}
          fixed1={colorState.green.toString(16).padStart(2, "0")}
          fixed2={colorState.blue.toString(16).padStart(2, "0")}
        />
        <ColorBar
          change={1}
          fixed1={colorState.red.toString(16).padStart(2, "0")}
          fixed2={colorState.blue.toString(16).padStart(2, "0")}
        />
        <ColorBar
          change={2}
          fixed1={colorState.red.toString(16).padStart(2, "0")}
          fixed2={colorState.green.toString(16).padStart(2, "0")}
        /> */}
      </div>
    </ColorProvider>
  );
}

App.defaultProps = {
  width: 800,
  height: 600,
};

export default App;
