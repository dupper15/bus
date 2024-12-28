export const formatToVND = (input) => {
    const number = Number(input);
    return number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}