namespace Root {
    document
        .getElementById('createButton')!
        .addEventListener('click', () => generateProblems(100), false);
    document.addEventListener('DOMContentLoaded', () => generateProblems(100));

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
            if (this.operation === 2 && this.a < this.b) {
                const temp = this.a;
                this.a = this.b;
                this.b - temp;
            }
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
                    throw new Error('Invalid Operation');
            }
        }

        resultString(): string {
            return this.result().toString();
        }

        generateHTML(): HTMLElement {
            const root = document.createElement('div') as HTMLDivElement;
            root.classList.add('item');

            const question = document.createElement('div') as HTMLDivElement;
            question.classList.add('question');
            question.innerText = this.format();

            const answer = document.createElement('div') as HTMLDivElement;
            answer.classList.add('answer');
            answer.style.visibility = 'hidden';

            const input = document.createElement('input') as HTMLInputElement;
            input.classList.add('input');
            input.setAttribute('type', 'number');
            input.setAttribute('step', '1');
            input.addEventListener('blur', () => {
                const ans = input.value;

                if (ans === this.resultString()) {
                    input.style.backgroundColor = 'green';
                    answer.innerText = '✓';
                    answer.style.visibility = 'visible';
                    answer.style.color = 'green';
                    input.disabled = true;
                    const scoreElem = document.getElementById(
                        'score'
                    ) as HTMLDivElement;
                    const oldScore = parseInt(
                        scoreElem.innerText.split('/')[0]
                    );
                    scoreElem.innerText = `${oldScore + 1}/100`;
                }
                if (ans !== this.resultString() && ans !== '') {
                    input.style.backgroundColor = 'red';
                    answer.innerText = this.resultString();
                    answer.style.visibility = 'visible';
                    answer.style.color = 'red';
                    input.disabled = true;
                }
            });

            root.appendChild(question);
            root.appendChild(input);
            root.appendChild(answer);

            return root;
        }
    }

    function generateProblems(n: number) {
        const problems = Array.from({ length: n }, (_, i) => new Problem());
        const grid = document.getElementById('grid') as HTMLDivElement;
        grid.replaceChildren();
        for (const problem of problems) {
            grid.appendChild(problem.generateHTML());
        }
    }

    function randomIntFromInterval(min: number, max: number) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
