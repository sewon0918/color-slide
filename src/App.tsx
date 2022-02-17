import { ColorBar } from "./components/ColorBar";
import { Canvas } from "./components/Canvas";
import { ColorProvider, useColorState } from "./context";

function App() {
  console.log(window.innerWidth * (2 / 3));
  return (
    <ColorProvider>
      <div className="container ">
        <Canvas />
        <ColorBar id={0} />
        <ColorBar id={1} />
        <ColorBar id={2} />
      </div>
    </ColorProvider>
  );
}

export default App;
