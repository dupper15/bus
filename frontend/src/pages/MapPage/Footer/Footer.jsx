import React from 'react';

const Footer = () => {
    return (
        <footer className="flex justify-between items-center bg-gray-100 p-4 border-t">
            <div className="space-x-4">
                <button className="text-gray-600 hover:text-gray-800">Cam Đảm Đàm</button>
                <button className="text-gray-600 hover:text-gray-800">Legal</button>
                <button className="text-gray-600 hover:text-gray-800">Privacy</button>
            </div>
            <div className="w-6 h-6">
                <img
                    src="frontend/src/assets/default-profile-icon.png"
                    alt="Vietnam Flag"
                    className="w-full h-full object-cover"
                />
            </div>
        </footer>
    );
};

export default Footer;
