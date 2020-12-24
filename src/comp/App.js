import React, {useCallback, useMemo, useState} from "react";
import Session from "./Session";
import styles from "./App.module.css";

const SPEED_RACER_CONFIG = 'speed-racer-config';
const SPEED_RACER_SESSIONS = 'speed-racer-sessions';

const DEFAULT_CONFIG = {
    totalSums: 30,
    questionsEachSum: 4,
    digits: 3,
    negativePercentage: 0,
    delayBetweenQuestionsInMilliseconds: 500,
    playbackRate : 1.1
}

const onStartSession = (setStartSession) => () => {
    setStartSession(true);
}

export const AppContext = React.createContext({});

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

function createAppContextPersist(oldAppContext, setAppContext) {
    return (appContext) => {
        let newContext = appContext;
        if (isFunction(appContext)) {
            newContext = appContext(oldAppContext);
        }
        setAppContext(newContext);
        localStorage.setItem(SPEED_RACER_CONFIG,JSON.stringify(newContext.config));
        localStorage.setItem(SPEED_RACER_SESSIONS,JSON.stringify(newContext.sessions));
    }
}

export default function App() {

    const [appContext, setAppContext] = useState(() => {
        const config = JSON.parse(localStorage.getItem(SPEED_RACER_CONFIG) || JSON.stringify(DEFAULT_CONFIG))
        const sessions = JSON.parse(localStorage.getItem(SPEED_RACER_SESSIONS) || JSON.stringify([]))
        return {config,sessions}
    });
    const setAppContextPersist = useCallback(createAppContextPersist(appContext, setAppContext), [appContext]);
    const [startSession, setStartSession] = useState(false);
    return <AppContext.Provider value={useMemo(() => [appContext, setAppContextPersist], [appContext])}>
        <div className={styles.container}>
            {startSession && <Session onEnd={() => setStartSession(false)} />}
            {!startSession && <HomePage setStartSession={setStartSession} appContext={appContext}/>}
        </div>
    </AppContext.Provider>
}

const calculateScore = (session) => {
    if(!session || !session.questions){
        return 0;
    }
    let index = 0;
    let totalCorrect = 0;
    for (const question of session.questions) {
        const expectedAnswer = question.reduce((t,n) => t+parseInt(n),0);
        const answer = session.answers[index];
        if(expectedAnswer === answer){
            totalCorrect++;
        }
        index++;
    }
    return Math.round((totalCorrect / session.questions.length) * 100)
}

const month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const formatDate = (date) => {
    return `${date.getDate()}-${month[date.getMonth()]}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
}
function HomePage({setStartSession,appContext}){
    const [session,setSession] = useState(appContext?.sessions[appContext.sessions.length - 1]);
    if(session === null || session === undefined){
        return <div className={styles.homePage}><button className={styles.button} onClick={onStartSession(setStartSession)}>Start Session</button></div>
    }
    const indexOfCurrentSessionSelection = appContext.sessions.indexOf(session);
    const hasNext =  indexOfCurrentSessionSelection < appContext.sessions.length - 1;
    const hasPrevious = indexOfCurrentSessionSelection > 0

    return <div className={styles.homePage}>

        <div className={styles.buttonContainer}>
            <button className={styles.buttonPrevNext} disabled={!hasPrevious} onClick={() => setSession(appContext.sessions[indexOfCurrentSessionSelection-1])}>Prev Score</button>
            <div style={{flex:1}}/>
            <button className={styles.buttonPrevNext} disabled={!hasNext} onClick={() => setSession(appContext.sessions[indexOfCurrentSessionSelection+1])}>Next Score</button>
        </div>
        <div className={styles.title}>
            <div className={styles.score}>{calculateScore(session)} %</div>
            <div className={styles.date}>{formatDate(new Date(session.start))}</div>
        </div>
        <div className={styles.tableContainer}>
        <table className={styles.table}>
            <thead>
            <tr>
                <th>No</th>
                <th>Questions</th>
                <th>Answers</th>
                <th>Duration</th>
            </tr>
            </thead>
            <tbody>
            {session?.questions?.map((q,index) => {
                return <tr key={index}>
                    <td>{index+1}</td>
                    <td>{q.join(',')}</td>
                    <td className={styles.tdAnswer}>
                        <div className={styles.textCenter} >{session.answers[index]}</div>
                        /
                        <div className={styles.textCenter}>{session.answers[index]?q.reduce((tot,next) => tot + parseInt(next),0):''}</div>
                    </td>
                    <td>{session.durations[index]}</td>
                </tr>
            })}
            </tbody>
        </table>
        </div>
        <button className={styles.button} onClick={onStartSession(setStartSession)}>Start Session</button>
    </div>
}