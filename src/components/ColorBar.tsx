import React, { useRef, useState, useEffect, useCallback } from "react";
import { useColorState, useColorDispatch } from "../context";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";
interface ColorProps {
  id: number; // 0:red, 1:green, 2:blue
}

export function ColorBar({ id }: ColorProps) {
  const [value, setValue] = useState<number>(127);
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

  const color = ["Red", "Green", "Blue"];
  let fixed1: string = "7f";
  let fixed2: string = "7f";
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
  // console.log(fromColor, toColor);
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

  const startTouch = useCallback((event: TouchEvent) => {
    var touch = event.touches[0];
    event.preventDefault();
    setColor(id);
    setChanging(true);
    if (picker.current) {
      shiftX = touch.clientX - picker.current.getBoundingClientRect().left;
      console.log("touch");
      document.addEventListener("touchmove", touch2);
      document.addEventListener("touchend", exitTouch);
    }
  }, []);

  function touch2(event: TouchEvent) {
    var touch = event.touches[0];
    if (slider.current && picker.current) {
      newLeft =
        touch.clientX - shiftX - slider.current.getBoundingClientRect().left;
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

  function exitTouch(event: TouchEvent) {
    setChanging(false);

    document.removeEventListener("touchmove", touch2);
    document.removeEventListener("touchend", exitTouch);
  }

  useEffect(() => {
    // console.log("value: ", value);
    if (id == 0) {
      setRed(value);
    } else if (id == 1) {
      setGreen(value);
    } else {
      setBlue(value);
    }
  }, [value]);

  useEffect(() => {
    // console.log("colorstate: ", colorState);
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
    <div className="w-fit mb-4 ">
      <div className="text-sm text-gray-400 font-bold mb-1">{color[id]}</div>
      <BrowserView>
        <canvas
          className="rounded-full z-0 absolute w-barX h-picker"
          height="40"
          width="400"
          style={{
            background: `linear-gradient(to right, ${fromColor}, ${toColor})`,
          }}
          ref={slider}
        ></canvas>
      </BrowserView>
      <MobileView>
        <canvas
          className="rounded-full z-0 absolute w-barX_mobile h-picker"
          height="40"
          width="350"
          style={{
            background: `linear-gradient(to right, ${fromColor}, ${toColor})`,
          }}
          ref={slider}
        ></canvas>
      </MobileView>
      <div
        className="w-picker h-picker border-2 border-white rounded-full  z-10"
        style={{
          position: "relative",
          ...(isBrowser ? { left: "180px" } : { left: "155px" }),
          background: `${
            "#" +
            colorState.red.toString(16).padStart(2, "0") +
            colorState.green.toString(16).padStart(2, "0") +
            colorState.blue.toString(16).padStart(2, "0")
          }`,
        }}
        onMouseDown={(event: any) => {
          onMouseDown(event);
        }}
        onTouchStart={(event: any) => {
          startTouch(event);
        }}
        ref={picker}
      />
    </div>
  );
}