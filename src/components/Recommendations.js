import { getRestaurantById, getImageURLsForBusiness } from "../firestore";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/fontawesome-free-solid'
import { useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";


class Recommendations extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            restIds: props.recommendationIds,
            index: props.indexNum,
            rest: (<Recommendation setGlobalState={props.setState} restId={props.recommendationIds[props.indexNum]}></Recommendation>),
            setGlobalState: props.setState,
        }
    }

    handleClick() {
        this.setState(prevState => ({
            index: this.state.index + 1,
            rest: (<Recommendation setGlobalState={this.state.setGlobalState} restId={this.state.restIds[this.state.index]}></Recommendation>)
          }));
    }

    render() {
        return (
            <div>
                {this.state.index}
                {this.state.rest}
                <button onClick={() => this.handleClick()}>
                    Reject Recommendation
                </button>
            </div >

        )

    }


}


const Categories = (props) => {
    const myArr = props.categories;
    if (myArr == null) {
        return;
    }
    const myArrCreatedFromMap = myArr.map((item, i) => (<li key={item + i}>{item}</li>)); // `.map()` creates/returns a new array from calling a function on every element in the array it's called on
    const myList = (
        <ul>{myArrCreatedFromMap}</ul> // `myArrCreatedFromMap` will evaluate to a list of `<li>` elements
    );
    return myList;
}

const Stars = (props) => {
    const MAX_STARS = 5;
    const wholeStars = Math.floor(props.rating);
    let isHalfStar = (props.rating - wholeStars) > 0.2 && (props.rating - wholeStars) < 0.7;
    if (props.rating - wholeStars >= 0.7) {
        wholeStars += 1;
    }
    let jsx = [];
    for (let i = 0; i < wholeStars; i++) {
        jsx.push(<FontAwesomeIcon icon="star" color="orange" size="2x" />);
    }
    // TODO make prettier
    if (isHalfStar) {
        jsx.push(<FontAwesomeIcon icon="star-half" color="orange" size="2x" />);
    }
    for (let i = wholeStars + Number(isHalfStar); i < MAX_STARS; i++) {
        jsx.push(<FontAwesomeIcon icon="star" color="silver" size="2x" />);
    }
    return jsx;
}

const Recommendation = (props) => {
    const [textToCopy, setTextToCopy] = useState([]);
    const [restaurant, setRestaurant] = useState([]);
    const [imageURL, setImg] = useState([]);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const {setGlobalState} = props;
    //const [location, setLocation] = useState([]);
    //const [falseDietaryRestrictions, setFalseDietRestrict] = useState([]);
    useEffect(() => {
        async function setRes() {
            const rest = await getRestaurantById(String(props.restId));
            setRestaurant(rest);
            setTextToCopy(rest.location.streetAddress + ", " + rest.location.city + ", " + rest.location.state + " " + rest.location.postalCode);
            let images = await getImageURLsForBusiness(String(props.restId));
            setImg(images[0]);
        }
        setRes();
    }, [restaurant]);

    // const handleClick2 = (your_lat, your_lng) => {
    //     window.open("https://maps.google.com?q="+your_lat+","+your_lng );
    // }
    const handleClick3 = () => {
        setGlobalState({business_id: restaurant.business_id});
        navigate('/recommendations/map');
        // window.open("http://localhost:3000/recommendations/map" );
    }

    
    return (
        <div>
            <h1>{restaurant.name}</h1>
            <img src={imageURL}></img>
            <table>
                <tbody>
                    <tr>
                        <td>
                            <p>{restaurant.location ? restaurant.location.streetAddress : "Please wait"} <br />
                                {restaurant.location ? restaurant.location.city + ", " + restaurant.location.state + " " + restaurant.location.postalCode : "Please wait"} </p>
                        </td>
                        <td>
                            <div>
                                <button onClick={() => { navigator.clipboard.writeText(textToCopy) }}>
                                    <FontAwesomeIcon icon={faCopy} outline="none" color="green" size="2x" />
                                </button>
                            </div>
                        </td>
                        <td>
                            <Stars rating={restaurant.stars} />
                        </td>
                    </tr>


                </tbody>

            </table>
            <Categories categories={restaurant.categories} />

            {/* <button onClick={() => handleClick2(restaurant.location.latitude, restaurant.location.longitude)}>
                    Open Map
            </button> */}
            <button onClick={() => handleClick3()}>
                    Go to Map Page
            </button>
        </div>
    );

}

// const starRating = useMemo(() => {
//     return Array(count)
//     .fill(0)
//     .map((_,i)=> i+1)
//     .map((idx) => (
//         <FontAwesomeIcon
//             key = {idx}
//             className = "cursor-pointer"
//             icon="star"
//         />
//     ));
// }, [count, rating]);

export default Recommendations

// getImageURLsForBusiness(business_id)
// getImagesForBusiness(business_id)