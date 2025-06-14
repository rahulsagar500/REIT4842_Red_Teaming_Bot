// import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import NewChatbot from './pages/NewChatbot';
import NewChatbot from './pages/Chatbots';

function App() {
  return (
    <Router>
      <Navbar>
        <Routes>
          <Route path="/" element={<Overview/>}/>
          <Route path="/new" element={<NewChatbot/>}/>
          <Route path="/chatbots" element={<Chatbots/>}/>
        </Routes>
      </Navbar>
    </Router>
  );
}

export default App;
