import {Routes, Route} from 'react-router-dom'
export default function index() {
  return (
    <Routes>
        <Route path="/" element={<div>Home</div>} />    

    </Routes>
  )
}
