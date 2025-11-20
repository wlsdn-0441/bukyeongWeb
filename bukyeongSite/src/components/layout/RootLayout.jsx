import { NavLink, Outlet } from "react-router-dom";
import { ThemeToggle } from "../common/ThemeContext";
import  DraggableFloatingNav from "../common/DraggableFloatingNav";
import "./RootLayout.css";

//루트 레이아웃 컴포넌트
export default function RootLayout() {
    return (
        <div className="root-layout">
            <ThemeToggle /> {/* 테마 토글 버튼 */}

            <main className="root-main">
                <Outlet />  {/* 여기에 각 페이지가 렌더링됨 */}
            </main>

            <DraggableFloatingNav /> {/* 하단 네비게이션 */}
        </div>
    );
}