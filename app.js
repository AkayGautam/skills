import React from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom';

const app = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/about" element={<h1>About Page</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default app