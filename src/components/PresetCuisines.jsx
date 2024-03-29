import { useState, useEffect } from 'react';
import { getCuisines, updateUserCuisine, getFilters } from '../firestore';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
import "../styles/presetCuis.css";
import { BackButton, HomeButton } from './Buttons';

function PreSetCuisines({ user, setGlobalState }) {

    const [listOfCuisines, setCuisineList] = useState([]);
    const [userCuisineList, setUserCuisine] = useState([]);
    const [checked, setChecked] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [t, setT] = useState(false);


    useEffect(() => {
        if (!user.isAnonymous) {
            Promise.resolve(getFilters(user.uid)).then(val => {
                setUserCuisine(val.filters.excludedCuisines);
                setChecked(val.filters.excludedCuisines);
            })
        }
    }, []);



    if (listOfCuisines.length === 0) {
        Promise.resolve(getCuisines()).then(val => {
            let test = [];
            for (let i = 0; i < val.length; i++) {
                test.push(val[i].name);
            }
            setCuisineList(test);
        })
    }


    const handleCheck = (event) => {
        var updatedList = [...checked];
        setGlobalState(prevState => ({...prevState, 'updated': true }))
        if (event.target.checked) {
            updatedList = [...checked, event.target.value];
        } else {
            updatedList.splice(checked.indexOf(event.target.value), 1);
        }
        setChecked(updatedList);
        updateUserCuisine(user.uid, updatedList);
    };

    const dynamicSearch = () => {
        return (
            <div className='list-cont'>
                {listOfCuisines.filter(cuisine => cuisine.toLowerCase().includes(searchTerm.toLowerCase())).map((item, index) => (
                    <div key={index} className='tes'>
                        <input
                            id={'list-it' + index}
                            value={item}
                            type='checkbox'
                            checked={checked.includes(item)}
                            onClick={handleCheck}
                            hidden />
                        <label className='item-nam' for={'list-it' + index}>{item}</label>
                    </div>
                ))}
            </div>
        );
    }

    const editSearchTerm = (event) => {
        setSearchTerm(event.target.value);
    }

    return (
        <div>
            <BackButton to='/account/filters'/>
            <HomeButton/>
            <div id='content-container'>
                <h3>Exclude Some Cuisines</h3>
                <input type='text' value={searchTerm} onChange={editSearchTerm} placeholder='Search for a cuisine' />
                {dynamicSearch()}
            </div>
        </div>
    )
}

export default PreSetCuisines;