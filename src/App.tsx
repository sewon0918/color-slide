import { ColorBar } from "./components/ColorBar";
import { Canvas } from "./components/Canvas";
import { ColorProvider, useColorState } from "./context";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { SelectColor } from "./components/SelectColor";

function App() {
  return (
    <ColorProvider>
      <div className=" ">
        <Canvas />
        <SelectColor />
      </div>
    </ColorProvider>
  );
}

export default App;
