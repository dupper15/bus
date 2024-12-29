export const formatToVND = (input) => {
    const number = Number(input);
    return number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export const convertMinutesToHoursAndMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60); // Tính số giờ
    const remainingMinutes = minutes % 60; // Lấy số phút còn lại
    return `${hours}h ${remainingMinutes}m`;
}