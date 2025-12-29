export function mapRoomTypeToDisplay(type) {
    if (type === undefined || type === null) return "";
    const key = String(type).toLowerCase();
    const map = {
        lab: "Lab",
        classroom: "Klassrum",
        publicarea: "Allmänt utrymme",
    };
    return map[key] || (String(type).charAt(0).toUpperCase() + String(type).slice(1));
}