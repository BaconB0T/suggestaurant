import { getRestaurantById, getImageURLsForBusiness } from "../firestore";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/fontawesome-free-solid'

class Recommendations extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            restIds: props.recommendationIds,
        }
    }


    render() {
        return (
            <div>
                <Recommendation restId={this.state.restIds[0]}></Recommendation>
            </div>

        )

    }


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
    const[imageURL, setImg] = useState([]);
    //const [location, setLocation] = useState([]);
    //const [falseDietaryRestrictions, setFalseDietRestrict] = useState([]);
    console.log(props)
    useEffect(() => {
        async function setRes() {
            const rest = await getRestaurantById(String(props.restId));
            setRestaurant(rest);
            //setLocation(rest.location)
            //const array = []
            //   for (const docRef of rest.dietaryRestrictions.false) {
            //     array.push(docRef.id)
            //   }
            //setFalseDietRestrict(array)
            setTextToCopy(rest.location.streetAddress + ", " + rest.location.city + ", " + rest.location.state + " " + rest.location.postalCode);
            //console.log(this.state.textToCopy);
            //this.setState({ textToCopy: "Simplilearn" });
            
            let images = await getImageURLsForBusiness(String(props.restId));
            //images = ["https://firebasestorage.googleapis.com/v0/b/suggestaurant-873aa.appspot.com/o/photos%2F-0FX23yAacC4bbLaGPvyxw%2FoYHkQ5nn1AZXBMrJhiLzCQ.jpg?alt=media&token=dd9f37fb-f572-49cd-bc52-53a2ab2b3fcb"];
            console.log("I'm back from calling getImageURLsForBusiness() !!");
            console.log("There are " + images.length + " elements in the list.");

            setImg(await images[0]);
        }
        setRes();
    }, []);

    return (
        <div>
            <h1>{restaurant.name} {restaurant.stars} </h1>
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

        </div>

    )

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