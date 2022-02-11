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
          var gradient = context.createLinearGradient(0, 0, 50, 0);
          gradient.addColorStop(0, "#000000");
          gradient.addColorStop(1, "#ff0000");
          context.fillStyle = gradient;
          console.log(canvas.offsetHeight);
          context.rect(10, 10, 50, 50);
          context.fill();
          console.log(newLeft, e.clientY);
          var c = context.getImageData(newLeft, 12, 1, 1).data;
          //   var c = context.getImageData(110, 13, 1, 1).data;
          console.log(c);
        }
      }
    }
  };
  function onMouseMove(e: MouseEvent) {
    if (slider.current && picker.current) {
      newLeft =
        e.clientX - shiftX - slider.current.getBoundingClientRect().left;
      // the pointer is out of slider => lock the thumb within the bounaries
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
        // console.log(
        //   context.getImageData(
        //     e.clientX - slider.current.getBoundingClientRect().left,
        //     e.clientY - slider.current.getBoundingClientRect().top,
        //     1,
        //     1
        //   ).data
        // );
        // var c = context.getImageData(newLeft, 7, 1, 1).data;
        // console.log(c);
        // var c = context.getImageData(e.clientX, e.clientY, 1, 1).data;
      }
    }
  }

  function onMouseUp() {
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mousemove", onMouseMove);
  }

  return (
    <div className="relative">
      <canvas
        className="w-96 h-10 rounded-full mb-4 z-0 absolute bg-gradient-to-r from-cyan-500 to-blue-500"
        style={
          {
            //   background: `linear-gradient(to right, ${fromColor}, ${toColor})`,
          }
        }
        ref={slider}
      ></canvas>
      <div
        className="w-10 h-10 x-10 border-4 border-white rounded-full bg-transparent z-10"
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
