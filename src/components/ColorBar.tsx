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

  let shiftX: number = 0;
  let newLeft: number = 0;

  function onMouseDown(e: MouseEvent) {
    e.preventDefault();
    setColor(id);
    setChanging(true);
    if (picker.current) {
      shiftX = e.clientX - picker.current.offsetLeft;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  }
  function onMouseMove(e: MouseEvent) {
    if (slider.current && picker.current) {
      newLeft = e.clientX - shiftX - slider.current.offsetLeft;
      setLeft(newLeft);
    }
  }
  function onMouseUp() {
    setChanging(false);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mousemove", onMouseMove);
  }

  function startTouch(e: TouchEvent) {
    var touch = e.touches[0];
    setColor(id);
    setChanging(true);
    if (picker.current) {
      shiftX = touch.clientX - picker.current.offsetLeft;
      console.log("touch");
      document.addEventListener("touchmove", keepTouch);
      document.addEventListener("touchend", exitTouch);
    }
  }

  function keepTouch(e: TouchEvent) {
    var touch = e.touches[0];
    if (slider.current && picker.current) {
      newLeft = touch.clientX - shiftX - slider.current.offsetLeft;
      setLeft(newLeft);
    }
  }

  function exitTouch() {
    setChanging(false);

    document.removeEventListener("touchmove", keepTouch);
    document.removeEventListener("touchend", exitTouch);
  }

  const barClick = (e: MouseEvent) => {
    if (slider.current && picker.current) {
      newLeft =
        e.clientX -
        slider.current.getBoundingClientRect().left -
        picker.current.offsetWidth / 2;

      setLeft(newLeft);
    }
  };

  const barTouch = (e: TouchEvent) => {
    var touch = e.touches[0];

    if (slider.current && picker.current) {
      newLeft =
        touch.clientX -
        slider.current.getBoundingClientRect().left -
        picker.current.offsetWidth / 2;
      setLeft(newLeft);
    }
  };

  function setLeft(newLeft: number) {
    if (slider.current && picker.current) {
      const context = slider.current.getContext("2d");
      if (newLeft < 0) {
        newLeft = 0;
      }
      let rightEdge = slider.current.offsetWidth - picker.current.offsetWidth;
      if (newLeft > rightEdge) {
        newLeft = rightEdge;
      }
      picker.current.style.left = newLeft + "px";

      var data = context!!.getImageData(
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

  useEffect(() => {
    if (!slider.current) {
      return;
    }
    const canvas: HTMLCanvasElement = slider.current;
    canvas.addEventListener("mousedown", barClick);
    canvas.addEventListener("touchstart", barTouch);

    return () => {
      canvas.removeEventListener("mousedown", barClick);
      canvas.removeEventListener("touchstart", barTouch);
    };
  }, [barClick, barTouch]);

  useEffect(() => {
    if (id == 0) {
      setRed(value);
    } else if (id == 1) {
      setGreen(value);
    } else {
      setBlue(value);
    }
  }, [value]);

  useEffect(() => {
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
    <div className="mb-4">
      <div className=" w-fit mx-auto">
        <div className="text-sm text-gray-400 font-bold mb-1">{color[id]}</div>
        <div className={`${isMobile ? "w-barX_mobile" : "w-barX"}`}>
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
      </div>
    </div>
  );
}
