import { NavLink, Outlet } from "react-router-dom";
import { ThemeToggle } from "../common/ThemeContext";
import  Header from "../common/Header";
//루트 레이아웃 컴포넌트 맨위에 뜨는 네비게이션 바 구현 가능파트
export default function RootLayout() {
    return (
        <div className="">
            <Header />
            <main>
                <Outlet />  {/* 여기에 각 페이지가 렌더링됨 */}
            </main>
        </div>
    );

        // <div className="">
        //     <header style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}>
        //         <div className="">
        //             <ThemeToggle /> {/* 다크/라이트 모드 버튼 */}



        //         </div>
        //         {/* 경로 네비게이션 바 */}
        //         <nav>    
        //             <button><NavLink to="/">Home</NavLink></button>
        //             <button><NavLink to="/about">About</NavLink></button>
        //             <button><NavLink to="/help">Help</NavLink></button>
        //         </nav>
        //     </header>

        //     <main>
        //         <Outlet />
        //     </main>
        // </div>
    //);
}