import { ColorBar } from "./components/ColorBar";
import { Canvas } from "./components/Canvas";
import { ColorProvider, useColorState } from "./context";

function App() {
  return (
    <ColorProvider>
      <div className="container mx-auto my-10">
        <Canvas width={800} height={600} />
        <ColorBar id={0} />
        <ColorBar id={1} />
        <ColorBar id={2} />
      </div>
    </ColorProvider>
  );
}

export default App;
