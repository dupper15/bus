const Header = () => {
    return (
        <header className="flex justify-between items-center bg-gray-100 p-4 shadow">
            <h1 className="text-lg font-bold text-green-700">BusMap</h1>
            <button className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600">
                TP. Hồ Chí Minh
            </button>
        </header>
    );
};

export default Header;
