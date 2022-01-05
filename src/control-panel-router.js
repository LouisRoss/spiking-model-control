import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { ControlPanel } from './control-panel.js'

const ControlPanelRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path=':model' element={<ControlPanel />} />
      </Routes>
    </Router>
  );
}

export { ControlPanelRouter };
