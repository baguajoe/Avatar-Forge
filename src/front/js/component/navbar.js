import React from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-light">
			<div className="container">
				<Link to="/" className="navbar-brand">
					Avatar Creator
				</Link>
				
				<div className="collapse navbar-collapse">
					<ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex flex-row gap-3">
						<li className="nav-item">
							<Link className="nav-link" to="/upload">Upload</Link>
						</li>
						<li className="nav-item">
							<Link className="nav-link" to="/customize">Customize</Link>
						</li>
						<li className="nav-item">
							<Link className="nav-link" to="/rig">Rig</Link>
						</li>
						<li className="nav-item">
							<Link className="nav-link" to="/motion">Live Motion</Link>
						</li>
						<li className="nav-item">
							<Link className="nav-link" to="/motion-from-video">From Video</Link>
						</li>
						<li className="nav-item">
							<Link className="nav-link" to="/profile">Profile</Link>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
};
