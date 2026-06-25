import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi'; // Dùng react-icons cho đẹp

const ThemeToggle = () => {
    // State để lưu trạng thái theme hiện tại trong React
    // Lấy giá trị ban đầu trực tiếp từ thẻ HTML (đã được script ở Bước 1 set)
    const [theme, setTheme] = useState(
        document.documentElement.getAttribute("data-theme") || "light"
    );

    // useEffect này sẽ chạy mỗi khi state 'theme' thay đổi
    useEffect(() => {
        // 1. Cập nhật thuộc tính trên thẻ HTML để DaisyUI đổi màu
        document.documentElement.setAttribute("data-theme", theme);
        
        // 2. Lưu lựa chọn vào LocalStorage để lần sau nhớ
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Hàm xử lý khi bấm nút
    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };

    return (
        // Dùng class btn-ghost để nút trong suốt, btn-circle để nút tròn
        <button 
            onClick={toggleTheme} 
            className="btn btn-ghost btn-circle text-base-content hover:bg-base-300 transition-all duration-300"
            title={theme === "light" ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"}
        >
            {theme === "light" ? (
                // Nếu đang là light, hiện hình mặt trăng để bấm chuyển sang dark
                <FiMoon size={22} className="text-indigo-600" />
            ) : (
                // Nếu đang là dark, hiện hình mặt trời để bấm chuyển sang light
                <FiSun size={22} className="text-yellow-400" />
            )}
        </button>
    );
};

export default ThemeToggle;