import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
       <nav className="p-4 bg-gray-800 text-white shadow">
            <ul className="flex space-x-6">
                <li><Link to="/">Overview</Link></li>
                <li><Link to="/new">New Chatbot</Link></li>
                <li><Link to="/chatbots">Chatbots</Link></li>
            </ul>
        </nav>
    )
}

export default Navbar