const { ObjectId } = require("mongodb");
const database = require("../config/db");
const { comparePassword, hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
// const achievementManager = require("../helpers/achievementManager");

class Controller {

    static async login(req, res, next){
        try {
            const {email, password} = req.body

            if(!email || !password){
                throw {name : "Invalid Email/Password", message : "Invalid Email/Password"}
            }

            const user = await database.collection("Users").findOne({email})

            if(!user || !comparePassword(password, user.password)){
                throw {name : "Invalid Email/Password", message : "Invalid Email/Password"}
            }

            const accessToken = signToken({
                _id : user._id,
                name : user.name,
                email : user.email
            })

            // const achievement = await achievementManager(user._id)

            res.status(200).json({accessToken})

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async register(req, res, next){
        try {
            const {name, username, email, password, image} = req.body

            if(!name || !username || !email || !password){
                throw {name : "Data is required", message : "Please fill all the data"}
            }

            let findUserByEmail = await database.collection("Users").findOne({email})

            let findUserByUsername = await database.collection("Users").findOne({username})

            if(findUserByEmail){
                throw {name : "This email has been used", message : "This email has been used", status : 400}
            }

            if(findUserByUsername){
                throw {name : "This username has been user", message : "This username has been used", status : 400}
            }

            let newUser = await database.collection("Users").insertOne({
                name, 
                username, 
                email, 
                image, 
                password : hashPassword(password), 
                avatar : "",
                createdAt : new Date(),
                updatedAt : new Date()
            })

            let newUserStat = await database.collection("UserStats").insertOne({
                userId : newUser.insertedId,
                stats : {
                    exp : 0, 
                    coin : 2000,
                    courseUnlocked : 0,
                    quizAnswered : 0,
                }
            })

            // let achievementDocs = [
            //     {name : "First Step", description : "Pick your first 2 courses", status : false},
            //     {name : "Explorer", description : "Unlocked 5 courses", status : false},
            //     {name : "Trailblazer", description : "Unlocked 10 courses", status : false},
            //     {name : "Freshman", description : "Reach level 1", status : false},
            //     {name : "Expert", description : "Reach level 10", status : false},
            //     {name : "Professor", description : "Reach level 25", status : false},
            //     {name : "Perfectionist", description : "Achieve a perfect score on a quiz", status : false}
            // ]

            // let achievement = await database.collection("Achievements").insertMany(achievementDocs)
            let achievement = await database.collection("Achievements").find().toArray()

            let userAchievement = await database.collection("UserAchievements").insertOne({
                userId : newUser.insertedId,
                achievements : achievement
            })

            res.status(201).json({newUser, newUserStat})

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async userProfile(req, res, next){
        try {

            const user = await database.collection("Users").findOne({_id : new ObjectId(req.user.id)})

            const userStat = await database.collection("UserStats").findOne({userId : new ObjectId(req.user.id)})

            const userAchievement = await database.collection("UserAchievements").findOne({userId : new ObjectId(req.user.id)})

            res.status(200).json({user, userStat, userAchievement})

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async leaderBoard(req, res, next){
        try {
            const user = await database.collection("Users").aggregate([
                {
                  $lookup:
                    {
                      from: "UserStats",
                      localField: "_id",
                      foreignField: "userId",
                      as: "Stats",
                    },
                },
                {
                  $unwind:
                    {
                      path: "$Stats",
                    },
                },
                {
                  $sort:
                    {
                      "Stats.stats.exp": -1,
                    },
                },
              ]).toArray()

            res.status(200).json({user})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

}

module.exports = Controller