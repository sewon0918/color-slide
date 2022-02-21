import { ColorBar } from "./components/ColorBar";
import { Canvas } from "./components/Canvas";
import { ColorProvider, useColorState } from "./context";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { SelectColor } from "./components/SelectColor";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";
function App() {
  return (
    <ColorProvider>
      <div className="overflow-hidden">
        <Canvas />
        {/* <SelectColor /> */}
      </div>
    </ColorProvider>
  );
}

export default App;
