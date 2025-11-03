import StudentSignIn from "./components/SignIn/StudentSigin"
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Route,Routes } from "react-router-dom";
import LogIn from "./components/LogIn/LogIn";
function App() {
  

  return (
    <>
    <Routes>
      <Route path="/sign-up" element={<StudentSignIn/>}/> 
      <Route path="/log-in" element={<LogIn/>}/>
    </Routes>
   
    <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  )
}

export default App
