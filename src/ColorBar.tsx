import React, { useRef, useState, useContext } from "react";
import { useColorState, useColorDispatch } from "./context";

interface ColorProps {
  change: number; // 0:red, 1:green, 2:blue
  fixed1: string;
  fixed2: string;
}

export function ColorBar({ change, fixed1, fixed2 }: ColorProps) {
  const [value, setValue] = useState<number>(0);
  const colorState = useColorState();
  const colorDispatch = useColorDispatch();

  const setRed = (red: number) => colorDispatch({ type: "SET_RED", red: red });
  const setGreen = (green: number) =>
    colorDispatch({ type: "SET_GREEN", green: green });
  const setBlue = (blue: number) =>
    colorDispatch({ type: "SET_BLUE", blue: blue });

  const color = ["red", "green", "blue"];
  let fromColor: string = "#";
  let toColor: string = "#";
  if (change == 0) {
    fromColor += "00" + fixed1 + fixed2;
    toColor += "ff" + fixed1 + fixed2;
  } else if (change == 1) {
    fromColor += fixed1 + "00" + fixed2;
    toColor += fixed1 + "ff" + fixed2;
  } else {
    fromColor += fixed1 + fixed2 + "00";
    toColor += fixed1 + fixed2 + "ff";
  }
  //   console.log(change, fromColor, toColor);

  const slider = useRef<HTMLCanvasElement>(null);
  //   const slider = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLDivElement>(null);

  let shiftX: number = 0;
  let newLeft: number = 0;
  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    console.log("mousedown", change);
    if (picker.current) {
      //   console.log(picker.current.getBoundingClientRect().left);
      //   console.log(e.clientX);
      shiftX = e.clientX - picker.current.getBoundingClientRect().left;
      //   console.log(shiftX);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      if (slider.current) {
        const canvas: HTMLCanvasElement = slider.current;
        const context = canvas.getContext("2d");
        if (context) {
          var gra = context.createLinearGradient(
            picker.current.offsetWidth / 2,
            0,
            canvas.width - picker.current.offsetWidth / 2,
            0
          );
          gra.addColorStop(0, fromColor);
          gra.addColorStop(1, toColor);
          context.fillStyle = gra;
          context.fillRect(0, 0, canvas.width, canvas.height);
          //   console.log(picker.current.getBoundingClientRect().width);
        }
      }
    }
  };
  function onMouseMove(e: MouseEvent) {
    if (slider.current && picker.current) {
      newLeft =
        e.clientX - shiftX - slider.current.getBoundingClientRect().left;
      if (newLeft < 0) {
        newLeft = 0;
      }
      let rightEdge = slider.current.offsetWidth - picker.current.offsetWidth;
      if (newLeft > rightEdge) {
        newLeft = rightEdge;
      }
      picker.current.style.left = newLeft + "px";
      if (!slider.current) {
        return;
      }
      const canvas: HTMLCanvasElement = slider.current;
      const context = canvas.getContext("2d");

      if (context) {
        var data = context.getImageData(
          newLeft + picker.current.offsetWidth / 2,
          0,
          1,
          1
        ).data;

        console.log(data[0], data[1], data[2]);
        if (change == 0) {
          console.log("red", data[0]);
          setValue(data[0]);
        } else if (change == 1) {
          console.log("green", data[1]);
          setValue(data[1]);
        } else {
          console.log("blue", data[2]);
          setValue(data[2]);
        }

        console.log(value);
      }
    }
  }

  function onMouseUp() {
    if (change == 0) {
      console.log(value);
      setRed(value);
    } else if (change == 1) {
      setGreen(value);
    } else {
      setBlue(value);
    }
    console.log(colorState.red, colorState.green, colorState.blue);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mousemove", onMouseMove);
  }

  return (
    <div className="relative">
      <canvas
        className="w-barX  rounded-full z-0 absolute"
        height="40"
        width="400"
        style={{
          background: `linear-gradient(to right, ${fromColor}, ${toColor})`,
        }}
        ref={slider}
      ></canvas>
      <div
        className="w-picker h-picker x-10 border-2 border-white mt-4 rounded-full bg-transparent z-10"
        style={{ position: "relative", left: "0px" }}
        onMouseDown={(event: any) => {
          onMouseDown(event);
        }}
        ref={picker}
      />
    </div>
  );
}

ColorBar.defaultProps = {
  change: 0,
  fixed1: "00",
  fixed2: "00",
};
