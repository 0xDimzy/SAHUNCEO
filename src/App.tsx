/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Detail from './pages/Detail';
import Watch from './pages/Watch';
import MyList from './pages/MyList';
import VIP from './pages/VIP';
import DubIndo from './pages/DubIndo';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/vip" element={<VIP />} />
        <Route path="/dubindo" element={<DubIndo />} />
        <Route path="/mylist" element={<MyList />} />
      </Routes>
    </Router>
  );
}
