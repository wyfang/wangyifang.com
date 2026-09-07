const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const source = fs.readFileSync(path.join(__dirname, '../scripts/site-age.js'), 'utf8');
const NativeDate = Date;

function createElement() {
    return {
        children: [],
        textContent: '',
        append(child) { this.children.push(child); },
        replaceChildren() { this.children = []; },
    };
}

function renderAt(iso) {
    let now = NativeDate.parse(iso);
    let tick;
    const elements = { htmer_time: createElement(), htmer_time2: createElement() };
    class ClockDate extends NativeDate {
        constructor(...args) { super(...(args.length ? args : [now])); }
        static now() { return now; }
    }
    vm.runInNewContext(source, {
        Date: ClockDate,
        document: {
            getElementById(id) { return elements[id]; },
            createElement,
        },
        setInterval(callback, delay) {
            assert.equal(delay, 1000);
            tick = callback;
        },
    });
    function text(element) {
        return element.children.map(child => typeof child === 'string' ? child : child.textContent).join('');
    }
    return {
        elements,
        elapsed() { return text(elements.htmer_time); },
        remainingYears() { return text(elements.htmer_time2); },
        tickAt(iso) { now = NativeDate.parse(iso); tick(); },
    };
}

test('首次执行立即显示，月份按周年后的天数计算', () => {
    const clock = renderAt('2026-09-07T11:13:32Z');
    assert.equal(clock.elapsed(), '14年352天00时00分00秒');
    assert.equal(clock.remainingYears(), '85');
    clock.tickAt('2026-10-20T11:13:32Z');
    assert.equal(clock.elapsed(), '15年30天00时00分00秒');
});

test('周年前一秒和周年时刻正确进位，不重复添加闰日', () => {
    const clock = renderAt('2026-09-20T11:13:31Z');
    assert.equal(clock.elapsed(), '14年364天23时59分59秒');
    clock.tickAt('2026-09-20T11:13:32Z');
    assert.equal(clock.elapsed(), '15年0天00时00分00秒');
    assert.equal(clock.remainingYears(), '85');
    clock.tickAt('2026-09-20T11:13:33Z');
    assert.equal(clock.remainingYears(), '84');
});

test('闰年二月和完整闰周年只计算实际经过的天数', () => {
    const clock = renderAt('2024-02-28T11:13:32Z');
    assert.equal(clock.elapsed(), '12年161天00时00分00秒');
    clock.tickAt('2024-02-29T11:13:32Z');
    assert.equal(clock.elapsed(), '12年162天00时00分00秒');
    clock.tickAt('2024-03-01T11:13:32Z');
    assert.equal(clock.elapsed(), '12年163天00时00分00秒');
    clock.tickAt('2024-09-20T11:13:31Z');
    assert.equal(clock.elapsed(), '12年365天23时59分59秒');
    clock.tickAt('2024-09-20T11:13:32Z');
    assert.equal(clock.elapsed(), '13年0天00时00分00秒');
});

test('每秒更新保留既有数字节点，百年倒数不会成为负数', () => {
    const clock = renderAt('2111-09-20T11:13:31Z');
    const numberNodes = clock.elements.htmer_time.children.slice();
    assert.equal(clock.elapsed(), '99年364天23时59分59秒');
    assert.equal(clock.remainingYears(), '00');
    clock.tickAt('2111-09-20T11:13:32Z');
    assert.equal(clock.elapsed(), '100年0天00时00分00秒');
    assert.equal(clock.remainingYears(), '00');
    numberNodes.forEach((node, index) => assert.equal(clock.elements.htmer_time.children[index], node));
    clock.tickAt('2112-09-20T11:13:32Z');
    assert.equal(clock.remainingYears(), '00');
});

test('时钟早于建站时间时显示零，不产生负数时长', () => {
    const clock = renderAt('2011-09-20T11:13:31Z');
    assert.equal(clock.elapsed(), '0年0天00时00分00秒');
    assert.equal(clock.remainingYears(), '100');
});

test('跨浏览器时区以及夏令时结果一致', () => {
    const timestamps = ['2024-03-10T10:00:00Z', '2026-09-20T11:13:32Z'];
    const expected = timestamps.map(iso => renderAt(iso).elapsed());
    const helper = `${createElement.toString()}\n${renderAt.toString()}`;
    for (const timezone of ['UTC', 'Asia/Shanghai', 'America/Los_Angeles', 'Pacific/Auckland']) {
        const code = `const vm = require('node:vm'); const assert = require('node:assert/strict');
            const NativeDate = Date; const source = ${JSON.stringify(source)};
            ${helper}
            process.stdout.write(JSON.stringify(${JSON.stringify(timestamps)}.map(iso => renderAt(iso).elapsed())));`;
        const result = spawnSync(process.execPath, ['-e', code], {
            env: { ...process.env, TZ: timezone },
            encoding: 'utf8',
            timeout: 10000,
        });
        assert.equal(result.status, 0, result.stderr);
        assert.deepEqual(JSON.parse(result.stdout), expected, timezone);
    }
});
