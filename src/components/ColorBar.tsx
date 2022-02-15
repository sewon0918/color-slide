import React, { useRef, useState, useEffect } from "react";
import { useColorState, useColorDispatch } from "../context";

interface ColorProps {
  id: number; // 0:red, 1:green, 2:blue
}

export function ColorBar({ id }: ColorProps) {
  const [value, setValue] = useState<number>(0);
  const colorState = useColorState();
  const colorDispatch = useColorDispatch();
  const setRed = (red: number) => colorDispatch({ type: "SET_RED", red: red });
  const setGreen = (green: number) =>
    colorDispatch({ type: "SET_GREEN", green: green });
  const setBlue = (blue: number) =>
    colorDispatch({ type: "SET_BLUE", blue: blue });
  const setColor = (color: number) =>
    colorDispatch({ type: "SET_COLOR", color: color });
  const setChanging = (changing: boolean) =>
    colorDispatch({ type: "SET_CHANGING", changing: changing });

  let fixed1: string = "00";
  let fixed2: string = "00";
  let fromColor: string = "#";
  let toColor: string = "#";

  const slider = useRef<HTMLCanvasElement>(null);
  const picker = useRef<HTMLDivElement>(null);

  if (id == 0) {
    fromColor += "00" + fixed1 + fixed2;
    toColor += "ff" + fixed1 + fixed2;
  } else if (id == 1) {
    fromColor += fixed1 + "00" + fixed2;
    toColor += fixed1 + "ff" + fixed2;
  } else {
    fromColor += fixed1 + fixed2 + "00";
    toColor += fixed1 + fixed2 + "ff";
  }

  let shiftX: number = 0;
  let newLeft: number = 0;
  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setColor(id);
    setChanging(true);
    if (picker.current) {
      shiftX = e.clientX - picker.current.getBoundingClientRect().left;
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

        if (id == 0) {
          setValue(data[0]);
        } else if (id == 1) {
          setValue(data[1]);
        } else {
          setValue(data[2]);
        }
      }
    }
  }
  function onMouseUp() {
    setChanging(false);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mousemove", onMouseMove);
  }

  useEffect(() => {
    console.log("value: ", value);
    if (id == 0) {
      setRed(value);
    } else if (id == 1) {
      setGreen(value);
    } else {
      setBlue(value);
    }
  }, [value]);

  useEffect(() => {
    console.log("colorstate: ", colorState);
    fixed1 = "00";
    fixed2 = "00";
    fromColor = "#";
    toColor = "#";
    if (id == 0) {
      fixed1 = colorState.green.toString(16).padStart(2, "0");
      fixed2 = colorState.blue.toString(16).padStart(2, "0");
    } else if (id == 1) {
      fixed1 = colorState.red.toString(16).padStart(2, "0");
      fixed2 = colorState.blue.toString(16).padStart(2, "0");
    } else {
      fixed1 = colorState.red.toString(16).padStart(2, "0");
      fixed2 = colorState.green.toString(16).padStart(2, "0");
    }

    if (id == 0) {
      fromColor += "00" + fixed1 + fixed2;
      toColor += "ff" + fixed1 + fixed2;
    } else if (id == 1) {
      fromColor += fixed1 + "00" + fixed2;
      toColor += fixed1 + "ff" + fixed2;
    } else {
      fromColor += fixed1 + fixed2 + "00";
      toColor += fixed1 + fixed2 + "ff";
    }
    if (picker.current && slider.current) {
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
      }
    }
  }, [colorState]);

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

// ColorBar.defaultProps = {
//   change: 0,
//   fixed1: "00",
//   fixed2: "00",
// };
