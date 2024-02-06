
function time_new() {
    mainPage.time_date = new Date();
    const a = mainPage.time_date.getHours();
    const b = mainPage.time_date.getMinutes();
    let minutes = 0
    let hours = 0
    hours = a < 10 ? `0${a}` : `${a}`;
    minutes = b < 10 ? `0${b}` : `${b}`;
    let time = `${hours}:${minutes}`
    return time
}

function date_day_new() {
    mainPage.time_date = new Date();
    const d = mainPage.time_date.getDate()
    const m = mainPage.time_date.getMonth() + 1
    const Year = mainPage.time_date.getFullYear()
    const day = d < 10 ? `0${d}` : `${d}`;
    const Month = m < 10 ? `0${m}` : `${m}`;
    let Date_dey = `${Year}-${Month}-${day}`
    return Date_dey
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
