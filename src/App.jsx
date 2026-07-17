import { Routes, Route } from "react-router-dom";

import Layout from "src/components/common/Layout";
import LandingPage from "src/view/LandingPage";
import AiDemoPage from "src/view/AiDemoPage";
import NotFound from "src/view/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<Layout />}>
        <Route path="/demo" element={<AiDemoPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
