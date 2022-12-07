import { onSnapshot, collection, doc,  getDocs } from "firebase/firestore";
import {useEffect, useState} from "react";
import {db, getHistory, rateRestaurant} from "../firestore";

export default function HistoryTest(){

    const [resCol, setResCol] = useState(0);
    const [resDoc, setResDoc] = useState(0);
    const [dateAdd, setDateAdd] = useState(0);
    const [rating, setRating] = useState(0);
    useEffect(() => {
        async function getPath(){
            const path = await getHistory();
            setResCol(path[0].restaurant._key.path.segments[5]);
            setResDoc(path[0].restaurant._key.path.segments[6]);
            setDateAdd(path[0].dateAdded.toDate().toString());
            if (path[0].rating == 1){
                setRating('Liked')
            }else{
                setRating('Not Liked')
            }
        }
        getPath();
    }, []);
        // const docRef = doc(db, resCol.toString(), resDoc.toString())
        // const rname = onSnapshot(doc(db, resCol.toString(), resDoc.toString()), doc =>
        //     console.log(doc.data().name)
        // )

        const [resName, setResName] = useState(0);
        
        // For some reasone commenting/uncommenting makes this work
        // console.log(resName); 
        useEffect(
            () =>
                onSnapshot(doc(db, resCol.toString(), resDoc.toString()), doc => {
                setResName(doc.data().name);
            }),

        ""
        );

    return (
        <div>
            History
            <p>Restaurant: {resName}</p>
            <p>Date Added: {dateAdd}</p>
            <p>Rating: {rating}</p>
            {/* <div>
                <Button onClick={rateRestaurant()}>Add Restaurant</Button>
            </div> */}
        </div>
    );
}