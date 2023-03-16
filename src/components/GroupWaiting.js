import { getGroupInfo, getGroup } from "../firestore";
import React, { useEffect, useRef, useState } from 'react';

const GroupWaiting = () => {
    const [numUsers, setNumUsers] = useState(0);
    const [numUsersReady, setNumUsersReady] = useState(0);

    async function updateVars() {
        
        const group = await getGroup("016828")
        setNumUsers(group.numUsers)
        setNumUsersReady(group.numUsersReady)
    }
    const MINUTE_MS = 1000;

    useEffect(() => {
        const interval = setInterval(() => {
            updateVars()
            console.log('Logs every second');
        }, MINUTE_MS);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    useEffect(() => {
        async function idk() {
            const group = await getGroup("016828")
            setNumUsers(group.numUsers)
            setNumUsersReady(group.numUsersReady)
        }

        idk()

    }, [numUsers, numUsersReady]);




    return <>
        numUsers is {numUsers} and numUsersReady is {numUsersReady}
    </>

}

export default GroupWaiting