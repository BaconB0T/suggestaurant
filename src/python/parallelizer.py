import multiprocessing
from geopy.distance import geodesic
from functools import partial
from datetime import datetime

def distanceFilter(user_loc, req, x):
	if geodesic(user_loc,(x["location"]['latitude'], x["location"]['longitude'])).miles < int(req):
		return x
	return None

def initDietFilter(x):
    if x["dietaryRestrictions"] is not None and x["dietaryRestrictions"]["true"] is not None:
        return x
    return None

def dietFilter(req, x):
    dietList = ["Halal", "Vegan", "Dairy-free", "Gluten-free", "Kosher", "Vegetarian", "Soy-free"]
    for y in dietList:
        if req["diet"][y] != "":
            if x["dietaryRestrictions"]["true"] is not None:
                if req['diet'][y] not in x["dietaryRestrictions"]["true"]:
                    return None
            if x["dietaryRestrictions"]["true"] is None:
                return None
    return x

def timeFilter(time, x):
    dt = datetime.now()
    if x is None:
        return None
    if "hours" in x.keys():
        if x["hours"] == None:
            return None
        if dt.strftime('%a') in x["hours"]:
            if x["hours"][dt.strftime('%A')]["end"] <= time or x["hours"][dt.strftime('%A')]["start"] >= time:
                return None
    return x

def distanceHandlerParallel(user_loc, req, id_list):
    try:
        cpus = multiprocessing.cpu_count()
        print(cpus)
    except NotImplementedError:
        cpus = 2   # arbitrary default
    print("Check 1 2")
    pool = multiprocessing.Pool(processes=cpus)
    print("Check 1 2")
    parallelized = pool.map(partial(distanceFilter, user_loc, req["latlong"]["distance"]), id_list)
    print("Check 1 2")
    ret_list = [x for x in parallelized if x]
    return ret_list

def allergyHandlerParallel(req, id_list):
    try:
        cpus = multiprocessing.cpu_count()
    except NotImplementedError:
        cpus = 2   # arbitrary default
    pool = multiprocessing.Pool(processes=cpus)
    parallelized = pool.map(initDietFilter, id_list)
    parallelized = [x for x in parallelized if x]
    parallelized = pool.map(partial(dietFilter, req), id_list)
    ret_list = [x for x in parallelized if x]
    return ret_list

def timeHandlerParallel(time, id_list):
    try:
        cpus = multiprocessing.cpu_count()
    except NotImplementedError:
        cpus = 2   # arbitrary default
    pool = multiprocessing.Pool(processes=cpus)
    parallelized = pool.map(partial(timeFilter, time), id_list)
    ret_list = [x for x in parallelized if x]
    return ret_list
