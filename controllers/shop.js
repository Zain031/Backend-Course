const { ObjectId } = require("mongodb");
const database = require("../config/db");

class Controller {

    static async addCoin(req, res, next){
        try {
            console.log("MASUK");
            const user = req.user

            const {coins} = req.body

            const findUser = await database.collection("UserStats").findOne({userId : new ObjectId(user.id)})

            if(!findUser) throw {name : "Data not found"}

            const response = await database.collection("UserStats").updateOne(
                {userId : new ObjectId(user.id)},
                {$set : {"stats.coin" : findUser.stats.coin + coins}}
            )

            res.status(200).json({response})

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async paymentNotificationHandler(req, res, next){
        try {
            console.log(req.body);
            res.status(200).json({message : "TEST"})
        } catch (error) {
            console.log(error);
        }
    }

}

module.exports = Controller