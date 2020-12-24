import {useContext, useEffect, useRef, useState} from "react";
import {AppContext} from "./App";
import styles from "./Session.module.css";


const onMounted = (containerRef, setContainerWidth) => () => {
    return setContainerWidth(containerRef.current.offsetWidth);
}

const onSessionEnd = (isEnd, onEnd) => () => {
    if (isEnd) {
        onEnd();
    }
}

export default function Session({onEnd}) {
    const [appContext, setAppContext] = useContext(AppContext);
    const [session, setSession] = useState(initiateState(appContext));

    const [activeRowIndex, setActiveRowIndex] = useState(session.answers.length);
    const [activeColumnIndex, setActiveColumnIndex] = useState(0);
    const {delayBetweenQuestionsInMilliseconds} = appContext.config;
    const [containerWidth, setContainerWidth] = useState(800);
    let {questions} = session;
    questions = questions || [];
    const totalQuestions = questions && questions[activeRowIndex] && questions[activeRowIndex].length || 0;
    useEffect(() => setActiveColumnIndex(0), [activeRowIndex])
    useEffect(startNewQuestion({
        activeColumnIndex,
        setActiveColumnIndex,
        columnsEachRow: totalQuestions,
        delayBetweenColumnsInMilliseconds: delayBetweenQuestionsInMilliseconds,
        activeRowIndex,
        playbackRate: appContext.config.playbackRate
    }), [activeColumnIndex, totalQuestions]);
    const isEnd = session.end.length > 0;
    const isWaitingForAnswer = activeColumnIndex === totalQuestions && !isEnd;
    const numberValue = getValue(questions, activeRowIndex, activeColumnIndex);
    useEffect(onSessionUpdated(setAppContext, session), [session]);
    const waitingForAnswerRef = useRef(null);
    useEffect(onWaitingForAnswer(waitingForAnswerRef, isWaitingForAnswer), [isWaitingForAnswer]);
    const containerRef = useRef();
    useEffect(onMounted(containerRef, setContainerWidth), []);
    useEffect(onSessionEnd(isEnd, onEnd), [isEnd]);

    const progress = Math.round(((activeRowIndex + 1) / questions.length) * 100);
    return <div ref={containerRef} className={styles.container}>
        <div style={{width: '100%', position: 'absolute', top: 0, background: 'rgba(0,0,0,0.1)'}}>
            <div style={{width: `${progress}%`, background: 'green', height: 10,transition:'width 1000ms ease-in-out'}}/>
        </div>
        {questions.map((q, rowIndex) => {
            return <div key={rowIndex}>{q.map((n, colIndex) => {
                return <audio key={`${rowIndex}-${colIndex}`} data-audio={`${rowIndex}-${colIndex}`}>
                    <source src={`audio/${n}.wav`} type="audio/wav"/>
                    Your browser does not support the audio element.
                </audio>
            })}</div>
        })}
        <div style={{fontSize: containerWidth * 0.45}}>{numberValue}</div>
        {isWaitingForAnswer && <Answer containerWidth={containerWidth} onAnswer={(answer) => {
            if (answer) {
                setSession(session => {
                    const answers = session['answers'] || [];
                    const durations = session['durations'] || [];
                    answers[activeRowIndex] = answer;
                    durations[activeRowIndex] = new Date().getTime() - waitingForAnswerRef.current.getTime();
                    const isEnd = answers.length === session.questions.length;
                    return {...session, answers, durations, end: isEnd ? new Date().toISOString() : ''};
                })
                setActiveRowIndex(activeRowIndex + 1);
            }
        }}/>}
    </div>
}

function buildQuestions({totalSums, questionsEachSum, digits, negativePercentage}) {
    let sums = [];
    while (sums.length < totalSums) {
        let questions = [];
        while (questions.length < questionsEachSum) {
            let number = parseInt((Array.from({length: digits}).map((_, index) => {
                if (index === 0) {
                    return Math.ceil(Math.random() * 9)
                } else {
                    return Math.floor(Math.random() * 10)
                }
            }).join('')));

            const isNegative = Math.ceil(Math.random() * 10) <= (10 * negativePercentage);
            number = isNegative ? -1 * number : number;
            const hasSimilarItemInQuestions = questions.indexOf(number) >= 0;
            const ifTotalIsLesserThanZero = questions.reduce((total, next) => total + next, number) <= 0;
            if (!hasSimilarItemInQuestions && !ifTotalIsLesserThanZero) {
                questions.push(number);
            }
        }
        sums.push(questions);
    }
    return sums;
}


const startNewQuestion = ({
                              activeColumnIndex,
                              setActiveColumnIndex,
                              columnsEachRow,
                              delayBetweenColumnsInMilliseconds, activeRowIndex, playbackRate
                          }) => () => {
    const audio = document.querySelector(`[data-audio="${activeRowIndex}-${activeColumnIndex}"]`);

    if (audio) {
        audio.addEventListener('ended', () => {
            setTimeout(() => {
                if (activeColumnIndex < columnsEachRow) {
                    setActiveColumnIndex(activeColumnIndex + 1);
                }
            }, delayBetweenColumnsInMilliseconds);
        })
        audio.playbackRate = playbackRate;
        audio.play();
    } else {
        if (activeColumnIndex < columnsEachRow) {
            setActiveColumnIndex(activeColumnIndex + 1);
        }
    }
}


const getValue = (questions, rowIndex, columnIndex) => {
    try {
        return questions[rowIndex][columnIndex]
    } catch (err) {
    }
    return 0;
}

const onSessionUpdated = (setAppContext, session) => () => {
    if (session.start) {
        setAppContext(oldAppContext => {
            const oldSession = oldAppContext.sessions.filter(s => s.start !== session.start);
            return {...oldAppContext, sessions: [...oldSession, session]};
        });

    }
}

const onWaitingForAnswer = (waitingForAnswerRef, isWaitingForAnswer) => () => {
    if (isWaitingForAnswer) {
        waitingForAnswerRef.current = new Date();
    }
}


const initiateState = (appContext) => () => {
    const {config, sessions} = appContext;
    // ok now we have the config lets open last session
    const unfinishedSessions = sessions.filter(s => 'end' in s && s.end.length === 0);
    if (unfinishedSessions && unfinishedSessions.length > 0) {
        return unfinishedSessions[0];
    } else {
        return {
            start: new Date().toISOString(),
            questions: buildQuestions(config),
            answers: [],
            durations: [],
            end: ''
        };
    }

}


const handleSubmit = (onAnswer) => (event) => {
    event.preventDefault();
    const answer = event.target.elements.answer.value;
    onAnswer(parseInt(answer));
}

function Answer({onAnswer, containerWidth}) {
    return <form onSubmit={handleSubmit(onAnswer)}>
        <input style={{fontSize: containerWidth * 0.3}} className={styles.answerBox} name={"answer"} autoFocus={true}/>
    </form>
}