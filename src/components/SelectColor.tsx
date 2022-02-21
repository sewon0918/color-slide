import React, { useRef, useState, useEffect } from "react";
import { useColorState, useColorDispatch } from "../context";
import { ColorBar } from "./ColorBar";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";

export function SelectColor() {
  const colorState = useColorState();
  const current_color =
    "#" +
    colorState.red.toString(16).padStart(2, "0") +
    colorState.green.toString(16).padStart(2, "0") +
    colorState.blue.toString(16).padStart(2, "0");
  console.log(current_color);
  const [isOpen, setIsOpen] = useState(false);
  function open() {
    console.log("open");
    // setIsOpen((isOpen) => !isOpen);
    setIsOpen(true);
  }
  function close() {
    console.log("close");
    setIsOpen(false);
  }
  return (
    <div className="relative">
      <button
        className="m-4 border-4  w-10 h-10 full rounded-full"
        style={{
          background: `${current_color}`,
        }}
        onClick={open}
      />
      <BrowserView>
        <div
          className={`fixed left-20 bottom-10  rounded-lg w-container bg-slate-100 ${
            isOpen ? "" : "hidden"
          }`}
        >
          <div className="flex justify-end">
            <button
              className=" w-8 h-8 mt-2 mr-2 rounded-full bg-gray-200 font-semibold text-gray-400 text-center text-xl"
              onClick={close}
            >
              ✕
            </button>
          </div>
          <div className="ml-3">
            <ColorBar id={0} />
            <ColorBar id={1} />
            <ColorBar id={2} />
          </div>
        </div>
      </BrowserView>
      <MobileView>
        <div
          className={`fixed left-0 bottom-0 rounded-lg w-container_mobile bg-slate-100  ${
            isOpen ? "" : "hidden"
          }`}
        >
          <div className="flex justify-end">
            <button
              className=" w-8 h-8 mt-2 mr-2 rounded-full bg-gray-200 font-semibold text-gray-400 text-center text-xl"
              onClick={close}
            >
              ✕
            </button>
          </div>
          <div className="ml-3">
            <ColorBar id={0} />
            <ColorBar id={1} />
            <ColorBar id={2} />
          </div>
        </div>
      </MobileView>
    </div>
  );
}
