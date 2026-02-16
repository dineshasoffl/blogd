import { Link } from "react-router-dom";

function Footer(){
    return(
        <footer className="bg-dark text-light mt-5 py-4">
        <div className="container text-center">

            <div className="mb-2">
            <Link to="/privacy" className="text-light me-3 text-decoration-none">
            Privacy Policy
            </Link>
            <Link to="/terms"  className="text-light text-decoration-none">
            User Terms & Agreement
            </Link>
             </div>
             
             <small className="text-light">
                &copy; 2025 BlogD.All rights reserved.
                </small>
             </div>
             </footer>
    )
}

export default Footer;