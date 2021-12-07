export class Benchmark {
    static now() {
        return (new Date()).getTime();
    }
    static diff(t1) {
        let t2 = Benchmark.now();
        return (t2 - t1) / 1000;
    }
    static startBenchmark(key) {
        Benchmark.start = Benchmark.now();
    }
    static endBenchmark(key) {
        let diff = Benchmark.diff(Benchmark.start);
        let sum = Benchmark.stats.get(key);
        if (sum === undefined)
            sum = 0;
        Benchmark.stats.set(key, sum + diff);
    }
    static summary() {
        console.log(Benchmark.stats);
    }
}
Benchmark.stats = new Map();
