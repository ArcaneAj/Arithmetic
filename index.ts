declare const confetti: any;
namespace Root {
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

                const scoreElem = document.getElementById(
                    'score'
                ) as HTMLDivElement;
                const newScore =
                    parseInt(scoreElem.innerText.split('/')[0]) + 1;
                if (ans === this.resultString()) {
                    input.style.backgroundColor = 'green';
                    answer.innerText = '✓';
                    answer.style.visibility = 'visible';
                    answer.style.color = 'green';
                    input.disabled = true;
                    scoreElem.innerText = `${newScore}/100`;
                }
                if (ans !== this.resultString() && ans !== '') {
                    input.style.backgroundColor = 'red';
                    answer.innerText = this.resultString();
                    answer.style.visibility = 'visible';
                    answer.style.color = 'red';
                    input.disabled = true;
                }

                if (newScore === 100) {
                    fireworks(10);
                    fountain(10);
                }
            });

            root.appendChild(question);
            root.appendChild(input);
            root.appendChild(answer);

            return root;
        }
    }

    function generateProblems(n: number) {
        const body = document.getElementsByTagName('body').item(0)!;
        if (window.innerHeight / window.innerWidth < 1) {
            body.replaceChildren();
            const header = document.createElement('div');
            header.classList = 'header';
            body.appendChild(header);

            const grid = document.createElement('div');
            grid.id = 'grid';
            grid.classList = 'grid';
            body.appendChild(grid);

            const button = document.createElement('button');
            button.name = 'createButton';
            button.id = 'createButton';
            button.innerText = 'Regenerate';
            button.addEventListener(
                'click',
                () => generateProblems(100),
                false
            );
            header.appendChild(button);

            const score = document.createElement('div');
            score.id = 'score';
            score.innerText = '0/100';
            header.appendChild(score);

            const problems = Array.from({ length: n }, (_, i) => new Problem());
            grid.replaceChildren();
            for (const problem of problems) {
                grid.appendChild(problem.generateHTML());
            }
        } else {
            let score = document.getElementById('score') as HTMLDivElement;
            if (score == null) {
                score = document.createElement('div');
                score.id = 'score';
                score.innerText = '0/100';
                body.appendChild(score);
            }

            let problemWrapper = document.getElementById(
                'problemWrapper'
            ) as HTMLDivElement;
            if (problemWrapper == null) {
                problemWrapper = document.createElement('div');
                problemWrapper.id = 'problemWrapper';
                body.appendChild(problemWrapper);
            }

            problemWrapper.replaceChildren();
            const problem = new Problem();
            problemWrapper.appendChild(problem.generateHTML());

            let button = document.getElementById(
                'nextButton'
            ) as HTMLButtonElement;
            if (button == null) {
                button = document.createElement('button');
                button.name = 'nextButton';
                button.id = 'nextButton';
                button.innerText = 'Next';
                button.addEventListener(
                    'click',
                    () => generateProblems(1),
                    false
                );
                body.appendChild(button);
            }
        }
    }

    function randomIntFromInterval(min: number, max: number) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

function fireworks(seconds: number) {
    var duration = seconds * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function () {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
    }, 250);
}

function fountain(seconds: number) {
    var end = Date.now() + seconds * 1000;

    // go Buckeyes!
    var colors = ['#bb0000', '#ffffff'];

    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}
