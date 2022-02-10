import React, { useRef, useState, useCallback, useEffect } from "react";

interface ColorProps {
  change: number; // 0:red, 1:green, 2:blue
  fixed1: string;
  fixed2: string;
}

export function ColorBar({ change, fixed1, fixed2 }: ColorProps) {
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
  console.log(change, fromColor, toColor);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLDivElement>(null);

  let shiftX: number = 0;
  let newLeft: number = 0;
  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    console.log("mousedown", change);
    if (picker.current) {
      console.log(picker.current.getBoundingClientRect().left);
      console.log(e.clientX);
      shiftX = e.clientX - picker.current.getBoundingClientRect().left;
      console.log(shiftX);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  };
  function onMouseMove(e: MouseEvent) {
    if (slider.current && picker.current) {
      newLeft =
        e.clientX - shiftX - slider.current.getBoundingClientRect().left;
      console.log(newLeft);
      // the pointer is out of slider => lock the thumb within the bounaries
      if (newLeft < 0) {
        newLeft = 0;
      }
      let rightEdge = slider.current.offsetWidth - picker.current.offsetWidth;
      if (newLeft > rightEdge) {
        newLeft = rightEdge;
      }
      picker.current.style.left = newLeft + "px";
      // if (!canvasRef.current) {
      //   return;
      // }
      // const canvas: HTMLCanvasElement = canvasRef.current;
      // const context = canvas.getContext("2d");
      // if (context) {
      //   var c = context.getImageData(newLeft, e.clientY, 1, 1).data;
      //   console.log(c[0], c[1], c[2]);
      // }
    }
  }

  function onMouseUp() {
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mousemove", onMouseMove);
  }

  return (
    <div>
      <div
        className="w-96 h-10 rounded-full mb-4"
        style={{
          background: `linear-gradient(to right, ${fromColor}, ${toColor})`,
        }}
        ref={slider}
      >
        <div
          className="w-10 h-10 x-10 border-4 border-white rounded-full bg-transparent"
          style={{ position: "relative", left: "0px" }}
          onMouseDown={(event: any) => {
            onMouseDown(event);
          }}
          ref={picker}
        />
      </div>
    </div>
  );
}

ColorBar.defaultProps = {
  change: 0,
  fixed1: "00",
  fixed2: "00",
};
