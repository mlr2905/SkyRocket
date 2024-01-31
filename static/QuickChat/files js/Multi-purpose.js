
function time_new() {
    Cells_manager.time_date = new Date();
    const a = Cells_manager.time_date.getHours();
    const b = Cells_manager.time_date.getMinutes();
    let minutes = 0
    let hours = 0
    hours = a < 10 ? `0${a}` : `${a}`;
    minutes = b < 10 ? `0${b}` : `${b}`;
    let time = `${hours}:${minutes}`
    return time
}

function date_day_new() {
    Cells_manager.time_date = new Date();
    const day = getDate()
    const Month = getMonth() + 1
    const Year = getFullYear()
    const date = `${day}/${Month}/${Year}`
    return date
}

function difference_in_seconds(time1, time2) {
    // divides the time into hours, minutes and seconds const hours1 = time1.getHours();
    const hours1 = time1.getHours();
    const minutes1 = time1.getMinutes();
    const seconds1 = time1.getSeconds();
    const hours2 = time2.getHours();
    const minutes2 = time2.getMinutes();
    const seconds2 = time2.getSeconds();
    // Calculates the difference in hours
    const hoursDiff = hours2 - hours1;
    // Calculates the difference in minutes
    const minutesDiff = minutes2 - minutes1;
    // Calculates the difference in seconds
    const secondsDiff = seconds2 - seconds1;
    // Returns the total difference in seconds
    return hoursDiff * 3600 + minutesDiff * 60 + secondsDiff;
}
