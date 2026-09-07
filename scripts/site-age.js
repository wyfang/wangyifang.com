(function () {
    const SECONDS_PER_MINUTE = 60;
    const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * 60;
    const SECONDS_PER_DAY = SECONDS_PER_HOUR * 24;
    const startDate = new Date(Date.UTC(2011, 8, 20, 11, 13, 32));
    const centenaryDate = new Date(Date.UTC(2111, 8, 20, 11, 13, 32));
    const timeElement = document.getElementById('htmer_time');
    const yearsElement = document.getElementById('htmer_time2');

    if (!timeElement && !yearsElement) return;

    function padZero(value) {
        return String(value).padStart(2, '0');
    }

    function anniversary(date, year) {
        const result = new Date(date.getTime());
        result.setUTCFullYear(year);
        return result;
    }

    function calculateTimeDifference(now) {
        let years = now.getUTCFullYear() - startDate.getUTCFullYear();
        let lastAnniversary = anniversary(startDate, startDate.getUTCFullYear() + years);

        if (lastAnniversary > now) {
            years--;
            lastAnniversary = anniversary(startDate, startDate.getUTCFullYear() + years);
        }

        // 日期相减已包含闰日；剩余月份统一折算为最近周年之后的天数。
        const seconds = Math.floor((now.getTime() - lastAnniversary.getTime()) / 1000);
        return [
            years,
            Math.floor(seconds / SECONDS_PER_DAY),
            Math.floor(seconds / SECONDS_PER_HOUR) % 24,
            Math.floor(seconds / SECONDS_PER_MINUTE) % 60,
            seconds % 60,
        ];
    }

    function calculateYearsToCentenary(now) {
        if (now >= centenaryDate) return 0;

        let years = centenaryDate.getUTCFullYear() - now.getUTCFullYear();
        const boundary = anniversary(centenaryDate, centenaryDate.getUTCFullYear() - years);
        if (boundary < now) years--;
        return years;
    }

    function createNumber(parent) {
        const number = document.createElement('span');
        number.className = 'num';
        parent.append(number);
        return number;
    }

    const elapsedNumbers = [];
    if (timeElement) {
        timeElement.replaceChildren();
        ['年', '天', '时', '分', '秒'].forEach(function (unit) {
            elapsedNumbers.push(createNumber(timeElement));
            timeElement.append(unit);
        });
    }

    let centenaryNumber = null;
    if (yearsElement) {
        yearsElement.replaceChildren();
        centenaryNumber = createNumber(yearsElement);
    }

    function updateNumber(number, value) {
        if (number.textContent !== value) number.textContent = value;
    }

    function updateElapsedTime() {
        // 本机时钟早于建站时间时显示零，避免产生负数年和负数余数。
        const now = new Date(Math.max(Date.now(), startDate.getTime()));
        const elapsed = calculateTimeDifference(now);

        elapsedNumbers.forEach(function (number, index) {
            updateNumber(number, index < 2 ? String(elapsed[index]) : padZero(elapsed[index]));
        });

        if (centenaryNumber) {
            updateNumber(centenaryNumber, padZero(calculateYearsToCentenary(now)));
        }
    }

    updateElapsedTime();
    setInterval(updateElapsedTime, 1000);
})();
