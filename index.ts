namespace Root {
    document
        .getElementById('createButton')!
        .addEventListener('click', () => generateProblems(100), false);

    enum Operation {
        Add = 1,
        Subtract = 2,
        Multiply = 3,
    }

    class Problem {
        a: number;
        b: number;
        operation: number;

        constructor() {
            this.a = randomIntFromInterval(1, 12);
            this.b = randomIntFromInterval(1, 12);
            this.operation = randomIntFromInterval(1, 3);
        }

        result(): number {
            switch (this.operation) {
                case 1:
                    return this.a + this.b;
                case 2:
                    return this.a - this.b;
                case 3:
                    return this.a * this.b;
                default:
                    throw new Error('Invalid Operation');
            }
        }

        format(): string {
            switch (this.operation) {
                case 1:
                    return `${this.a} + ${this.b} =`;
                case 2:
                    return `${this.a} - ${this.b} =`;
                case 3:
                    return `${this.a} x ${this.b} =`;
                default:
                    console.log(this.operation);
                    console.log(typeof this.operation);
                    throw new Error('Invalid Operation');
            }
        }
    }

    function generateProblems(n: number) {
        const problems = Array.from({ length: 5 }, (_, i) => new Problem());
        console.log(problems.map((x) => x.format()));
        console.log(problems.map((x) => x.result()));
    }

    function getRandomEnumValue<T extends { [s: string]: any }>(
        enumObject: T
    ): T[keyof T] {
        const enumValues = Object.values(enumObject) as T[keyof T][];
        const randomIndex = Math.floor(Math.random() * enumValues.length);
        return enumValues[randomIndex];
    }

    function randomIntFromInterval(min: number, max: number) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
