import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 25px",
            background: "#0a0a0a",
            borderBottom: "1px solid #222",
            position: "sticky",
            top: 0, zIndex: 1000

        }}>
            <Link to="/" style={{ color: "#1e560b", fontSize: "1.5rem", fontWeight: "bold", textDecoration: "none" }}>
                🎬 Movie Explorer
            </Link>
            <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
                <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>Home</Link>
            </div>
        </nav>
    );
}
export default Navbar;