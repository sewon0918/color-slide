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
        {/* <div className="p-3 border-2 rounded-lg w-container">
          <ColorBar id={0} />
          <ColorBar id={1} />
          <ColorBar id={2} />
        </div> */}
      </div>
    </ColorProvider>
  );
}

export default App;
