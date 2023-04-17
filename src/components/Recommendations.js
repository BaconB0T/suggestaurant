import { getRestaurantById, getImageURLsForBusiness, updateGroupMember, getGroup, updateGroupHost } from "../firestore";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/fontawesome-free-solid'
import { withCookies, useCookies } from 'react-cookie';
import { Navigate, useNavigate } from "react-router-dom";
import TinderCard from 'react-tinder-card'
import memoize from "memoize-one";
// import { FaHome, FaRegUserCircle, FaArrowAltCircleLeft} from 'react-icons/fa';

import '../styles/Recommendations.css';
import { BackButton, HomeButton } from "./Buttons";

class Recommendations extends React.Component {
  constructor(props) {
    super(props);
    // idk why this cookie keeps being assigned the name 'businesslist', it's
    // driving me crazy.
    var restIds = props.recommendationIds || props.allCookies['businesslist'] || props.allCookies['businesslist']; // .reverse()
    restIds = restIds.sort();
    if (props.allCookies['groupCode'] != 0) {
      // in a group, insert groupDecision cards between each restaurant.
      const newRestIds = [];
      for (let i = 0; i < restIds.length * 2; ++i) {
        i % 2 == 0 ? newRestIds.push(restIds[Math.trunc(i / 2)]) : newRestIds.push(`groupDecision-${restIds.length * 2 - i}`);
      }
      restIds = newRestIds.reverse();
      // console.log(restIds);
    } else {
      const newRestIds = [];
      for (let i = 0; i < restIds.length; ++i) {
        newRestIds.push(restIds[i]);
      }
      restIds = newRestIds.reverse();
    }

    this.MINUTE_MS = 1000;
    this.state = {
      restIds: restIds,
      index: props.indexNum || restIds.length - 1,
      setGlobalState: props.setGlobalState,
      globalState: props.globalState,
      // need to memoize the VALUE, not a component. useMemo lets us do that,
      // but only in a function...
      childRefs: memoize(() => restIds.map((i) => React.createRef())),
      currentIndexRef: React.createRef(props.indexNum),
      host: props.allCookies['host'],
      groupCode: props.allCookies['groupCode'],
      showMap: false,
      goBack: false,
      showNoRecs: false,
      showNoRecsGroupMember: false
    }

  }

  updateIndex(val) {
    this.state.index = val;
    this.state.currentIndexRef.current = val;
  }

  canSwipe() {
    const onGroupDecision = this.state.restIds[this.state.index].includes('groupDecision');
    let acceptedOrRejected;
    // If index > 0 and (if i'm not on groupDecision or (I am the host and am on groupDecision))
    if (onGroupDecision) {
      // undefined if no decision. True for accepted, false for rejected;
      const restId = this.state.restIds[this.state.index + 1];
      acceptedOrRejected = this.state.group['suggestions'][restId]['decision'];
    }
    // Can swipe if there are cards remaining to swipe and
    // either I'm not on a group decision, OR if i AM on groupDecision
    // then I am either the host or there has been a decision made. 
    const canSwipe =
      this.state.index >= 0
      && (!onGroupDecision
        || (onGroupDecision
          && (this.state.host === 'true' || acceptedOrRejected !== undefined)
        )
      )
    return canSwipe;
    // return this.state.index < this.state.restIds.length;
  }

  //FUNCTION NOT NEEDED
  // displayBackButton(state) {
  //   if (state.groupCode == 0) {
  //     return true
  //   } else {
  //     return false
  //   }
  // }

  swiped(direction, nameToDelete, index, state) {
    this.updateIndex(index - 1);
    if (state.groupCode != 0) { // in group
      if (!nameToDelete.includes('groupDecision')) { // Regular card, host and member vote on suggestion.
        this.memberAction(direction === 'right');
      } else {  // After vote, Host must decide
        if (state.host === 'true') { // Host decides for the group.
          this.hostAction(this.state.restIds[index + 1], (direction === 'right')).then((v) => {
            if (direction === 'right') {
              this.navToMap({ setGlobalState: this.state.setGlobalState, business_id: this.state.restIds[index + 1] });
            }
          });
        } else if (direction === 'right') { // not the host, if accepted go to map
          this.navToMap({ setGlobalState: this.state.setGlobalState, business_id: this.state.restIds[index + 1] });
        }
      }
      console.log('this.state.index');
      console.log(this.state.index);
      console.log('this.state.childRefs.length');
      console.log(this.state.childRefs().length);
      if (this.state.index < 0) { // if there are no more recommendations
        if (this.state.host === 'true') { // Navigate to increase radius if host.
          // *** host decrements numUsersReady in /expandRadius. ***
          this.state.showNoRecs = true;
        } else { // group members wait for host.
          console.log('Recommendations Member groupCode')
          console.log(state.groupCode);
          updateGroupMember(state.groupCode, 'numUsersReady', null);
          this.state.showNoRecsGroupMember = true
        }
      }
    } else { // Not in a group.
      if (direction === 'right') { // Go to next recommendation.
        this.navToMap({ setGlobalState: this.state.setGlobalState, business_id: this.state.restIds[index] })
      } // Navigate to increase radius if last recommendation is swiped.
      if (this.state.index === this.state.childRefs.length) {
        this.state.showNoRecs = true;
      }
    }
  }

  outOfFrame(dir, name, idx) {
    console.log(`${name} at ${idx} has left the screen`);
    document.getElementById(name).setAttribute('style', 'display: none;');
  }

  async swipe(dir) {
    if (this.canSwipe()) {// && this.state.index < this.state.restIds.length) {
      // exists, but value is null. obv can't swipe on it.
      await this.state.childRefs()[this.state.index].current.swipe(dir) // Swipe the card!
    } else {
      console.warn("Can't swipe!");
    }
  }

  memberAction(accepted) {
    // When a member of a group accepts the suggestion
    // +1 because the previous index has the actual restaurant's id.
    // WIthout +1 we are accessing the GroupDecision component's id, 
    // Which is groupDecision-#
    const idx = this.state.index + 1;
    const acceptedRestaurantId = this.state.restIds[idx];
    updateGroupMember(this.state.groupCode, 'suggestions', [acceptedRestaurantId, accepted]);
  }

  async hostAction(business_id, decision) {
    const obj = {};
    obj[business_id] = decision;
    return await updateGroupHost(this.state.groupCode, 'decision', obj);
  }

  navToMap({setGlobalState, business_id}) {
    setGlobalState({
      ...this.state.globalState, 
      business_id: business_id
    });
    
    this.setState(prevState => {
      return {
        ...prevState,
        showMap: true,
        showMapBusinessId: business_id
      }
    })
  }

  // interval stuff
  async updateGroup() {
    const group = await getGroup(this.state.groupCode);
    this.setState(prevState => {
      return {
        ...prevState,
        group: group
      }
    });
    // If in group and current card is the groupDecision card:
    if (this.state.groupCode != 0) {
      // group decision card indices are +1  relative to their 
      // corresponding restaurant card.
      const currCardId = this.state.restIds[this.state.index];
      const currRestId = this.state.restIds[this.state.index + 1];
      if (currCardId.includes('groupDecision')) {
        const hostDecision = group['suggestions'][currRestId]['decision'];
        if (hostDecision !== undefined) {
          // a decision was made. Decision value is 
          // True for accepted, false for rejected
          if (this.state.host !== 'true') this.swipe(hostDecision ? 'right' : 'left');
        }
        // else no decision was made, keep waiting.
      }
    }
  }

  componentDidMount() {
    if (this.state.groupCode != 0) {
      const newIntervalId = setInterval(() => {
        this.updateGroup();
      }, this.MINUTE_MS);
      this.setState(prevState => {
        return {
          ...prevState,
          intervalId: newIntervalId
        }
      });
    }
  }

  componentWillUnmount() {
    console.log("Component unmounting!");
    // Exists only if the interval is created
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
    }
  }

  render() {
    const buttons =
      (<div className="recommendation--buttons">
        <button className='reject' onClick={() => this.swipe('left')}>Reject</button>
        <button className='accept' onClick={() => this.swipe('right')}>Accept</button>
      </div>);

    return (
      <div className="recommendations">
        {/* No recommendations, member */}
        {this.state.showNoRecsGroupMember && (<Navigate to={'/keywordGrab'} />)}
        {/* No recommendations solo or host */}
        {this.state.showNoRecs && (<Navigate to={'/expandRadius'} />)}
        {/* Accepted recommendation */}
        {this.state.showMap && (<Navigate to={`/recommendations/map?business_id=${this.state.showMapBusinessId}`} />)}
        <div id='enjoy' style={{ display: this.state.showMap ? 'auto' : 'none' }}>Enjoy!</div>
        <div className="recommendation--cards" style={{ display: this.state.showMap ? 'none' : 'auto' }}>
          {this.state.groupCode == 0 && (<BackButton to='/keywordGrab' />)}

          <HomeButton />
          {this.state.restIds.map((id, index) => (!id.includes('groupDecision')) ? (
            <Recommendation
              passRef={this.state.childRefs()[index]}
              onSwipe={(dir) => this.swiped(dir, id, index, this.state)}
              onCardLeftScreen={(dir) => this.outOfFrame(dir, id, index)}
              restId={id}
              key={id}
              id={id}
            />
          ) : (
            <GroupDecision
              passRef={this.state.childRefs()[index]}
              onSwipe={(dir) => this.swiped(dir, id, index, this.state)}
              onCardLeftScreen={(dir) => this.outOfFrame(dir, id, index)}
              restId={this.state.restIds[index + 1]}
              key={id}
              id={id}
              numAccepted={this.state.group && this.state.group['suggestions'][this.state.restIds[index + 1]].numAccepted}
              numRejected={this.state.group && this.state.group['suggestions'][this.state.restIds[index + 1]].numRejected}
              isHost={this.state.host}
            />
          ))}
        </div>
        {buttons}
      </div>
    );
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
    jsx.push(<FontAwesomeIcon key={`star-${i}`} icon="star" color="orange" size="2x" />);
  }
  // TODO make prettier
  if (isHalfStar) {
    jsx.push(<FontAwesomeIcon key="halfStar" icon="star-half" color="orange" size="2x" />);
  }
  for (let i = wholeStars + Number(isHalfStar); i < MAX_STARS; i++) {
    jsx.push(<FontAwesomeIcon key={`star-${i}`} icon="star" color="silver" size="2x" />);
  }
  return jsx;
}

const Recommendation = (props) => {
  const [textToCopy, setTextToCopy] = useState([]);
  const [restaurant, setRestaurant] = useState([]);
  const [imageURL, setImg] = useState("");
  const [cookies, setCookie] = useCookies(['user']);
  const { setGlobalState, id, restId, passRef, onSwipe, onCardLeftScreen } = props;

  useEffect(() => {
    async function setRes() {
      const rest = await getRestaurantById(String(restId));
      setRestaurant(rest);

      if (rest.location != null) {
        setTextToCopy(rest.location.streetAddress + ", " + rest.location.city + ", " + rest.location.state + " " + rest.location.postalCode);
      }

      document.addEventListener('DOMContentLoaded', () => {
        document.getElementById(id).addEventListener('mousedown', (e) => { e.preventDefault(); document.getElementById(id).classList.add('moving') });
        document.getElementById(id).addEventListener('mouseup', (e) => { e.preventDefault(); document.getElementById(id).classList.remove('moving') });
      });

      let images = await getImageURLsForBusiness(String(restId));
      setImg(images[0]);
    }
    setRes();
  }, [props.restId]);

  return (
    <div id={id}
      className='swipe recommendation--card'>
      <TinderCard
        ref={passRef}
        onSwipe={onSwipe}
        onCardLeftScreen={onCardLeftScreen}
        preventSwipe={['up', 'down']}
      >
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
        {/* <button onClick={() => handleClick3()}>
        Go to Map Page
      </button> */}
      </TinderCard>
    </div>
  );

}

const GroupDecision = (props) => {
  const { setGlobalState, id, restId, numAccepted, numRejected, passRef, onSwipe, onCardLeftScreen, isHost } = props;
  const [restaurant, setRestaurant] = useState([]);
  const [group, setGroup] = useState({});
  // Update restaurant;
  // console.log('passRef');
  // console.log(passRef);
  // console.log(props);
  useEffect(() => {
    async function setRes() {
      const rest = await getRestaurantById(restId);
      setRestaurant(rest);

      window.addEventListener('DOMContentLoaded', () => {
        document.getElementById(id).addEventListener('mousedown', (e) => { e.preventDefault(); document.getElementById(id).classList.add('moving') });
        document.getElementById(id).addEventListener('mouseup', (e) => { e.preventDefault(); document.getElementById(id).classList.remove('moving') });
      });

      // let images = await getImageURLsForBusiness(restId);
      // setImg(images[0]);
    }
    setRes();
  }, [props.restId]);
  const preventSwipeList = ['up', 'down'];
  const concatToPreventSwipeList =
    (isHost !== 'true' || numAccepted === undefined || numRejected === undefined)
      ? ['left', 'right'] : []

  concatToPreventSwipeList.forEach((value) => preventSwipeList.push(value));
  return (
    <div id={id} className='swipe recommendation--card'>
      {/* Guarantees the ref is tied to a tinder card, else we can never swipe the group decision card. */}
      <TinderCard
        ref={passRef}
        onSwipe={onSwipe}
        onCardLeftScreen={onCardLeftScreen}
        preventSwipe={preventSwipeList}>
        {isHost !== 'true'
          ? (<>Waiting for host...</>)
          : ((numAccepted === undefined || numRejected === undefined) ? (<>Loading...</>) :
            <>
              <h1>{restaurant.name}</h1>
              <div>Make a decision!</div>
              <div className='votes'>
                <div className='rejected'>Rejected: <span className='numRejected'>{numRejected}</span></div>
                <div className='accepted'>Accepted: <span className='numAccepted'>{numAccepted}</span></div>
              </div>
            </>
          )}
      </TinderCard>
    </div>
  )
}

export default withCookies(Recommendations);
