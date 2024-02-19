const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function hasNameProperty(req, res, next) {
    const { data = {} } = req.body;

    if (!data.name) {
        next({
            status: 400,
            message: "Dish must include a name.",
        });
    }
    //Pass the request body data to middleware functions using response.locals
    res.locals.reqBody = data;
    return next();

}

function hasDescriptionProperty(req, res, next) {
    const reqBody = res.locals.reqBody;

    if (!reqBody.description) {
        next({
            status: 400,
            message: "Dish must include a description.",
        });
    }
    return next();
}

function hasPriceProperty(req, res, next) {
    const reqBody = res.locals.reqBody;

    if (!reqBody.price || reqBody.price <= 0 || !Number.isInteger(reqBody.price)) {
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0",
        })
    }
    return next();
}

 function hasImageUrlProperty(req, res, next) {
    const reqBody = res.locals.reqBody;

    if (!reqBody || !reqBody.image_url || reqBody.image_url.trim() === "") {
      next({
        status: 400,
        message: "Dish must include a image_url",
      }); 
    }

    return next();
 }

 //Function for Read and update

 function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    if (foundDish) {
        res.locals.dish = foundDish
        res.locals.dishId = dishId;
        return next()
    }
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}.`,
    });
 }

 function idMatchesRouteId(req, res, next) {
    const dishId = res.locals.dishId;
    const reqBody = res.locals.reqBody;

    if (reqBody.id) {
        if (reqBody.id === dishId) {
            return next();
        }
        next ({
            status: 400,
            message: `Dish id does not match route id. Dish: ${reqBody.id}, Route: ${dishId}`,
        })
    }
    return next();
 }
//create function
function create(req, res) {
    const reqBody = res.locals.reqBody;
    const newDish = {
        ...reqBody,
        id: nextId(),
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

//read function
function read(req, res) {
    res.json({ data: res.locals.dish });
}

//update
function update(req, res) {
    const dish = res.locals.dish;
    const reqBody = res.locals.reqBody;

    for (const propertyName in dish) {
        if (reqBody.hasOwnProperty(propertyName)) {
            dish[propertyName] = reqBody[propertyName];
        }
    }
    res.json({ data: dish });
}
//list

function list(req, res) {
    res.json({ data: dishes });
}

module.exports = {
    create: [
        hasNameProperty,
        hasDescriptionProperty,
        hasPriceProperty,
        hasImageUrlProperty,
        create,

    ],
    read: [dishExists, read],
    update: [
        dishExists,
        hasNameProperty,
        hasDescriptionProperty,
        hasPriceProperty,
        hasImageUrlProperty,
        idMatchesRouteId,
        update,
    ],
    list,
}