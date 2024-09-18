const jwt = require('jsonwebtoken');

module.exports = async function authentication(req, res, next){
    try {
        if(!req.headers.authorization){
            throw {name: "Invalid token"}
        }

        let [bearer, token] = req.headers.authorization.split(" ")
        // console.log(bearer, token, "DARI AUTHENTICATION");
        if(!token || bearer !== "Bearer"){
            throw ({name:"Invalid token"})
        }

        let user = jwt.verify(token, process.env.JWT_SECRET);
        if(!user){
            throw ({name:"Invalid token"})
        }
        // console.log(user, "<<< USER");
        req.user = {
            id: user._id,
            email: user.email
        }
        next()
    } catch (error) {
        if(error.message === "invalid token"){
            error.name = "Invalid token"
        }
        next(error)
    }
}