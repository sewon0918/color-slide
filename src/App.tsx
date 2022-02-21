import { ColorBar } from "./components/ColorBar";
import { Canvas } from "./components/Canvas";
import { ColorProvider, useColorState } from "./context";
import React, { useRef, useState, useEffect, useCallback } from "react";
function App() {
  return (
    <ColorProvider>
      <div>
        <Canvas />
      </div>
    </ColorProvider>
  );
}

export default App;
