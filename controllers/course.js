const { ObjectId } = require("mongodb");
const database = require("../config/db");
const achievementManager = require("../helpers/achievementManager");

class Controller {

    static async getCourse(req, res, next){
        try {
            const courseData = await database.collection("Courses").find().toArray()

            res.status(200).json({courseData})

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async myCourse(req, res, next){
        try {
            const user = req.user

            const myCourse = await database.collection("UserCourses").find(
                {userId : user.id}
            ).toArray()

            res.status(200).json({myCourse})

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async myCourseDetail(req, res, next){
        try {
            const user = req.user

            const {detail} = req.params

            const response = await database.collection("UserCourses").aggregate([
                {
                    $match : { userId: user.id },
                },
                {
                    $match : { name: detail },
                },
                {
                    $unwind : { path: "$sections" },
                },
            ]).toArray()

            res.status(200).json({response})

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async postCourse(req, res, next){ // Nanti dihapus
        try {

            const {name, sections, cost} = req.body
            
            const course = await database.collection("Courses").insertOne({name, sections, cost})

            res.status(201).json({course})

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async unlockCourse(req, res, next){
        try {
            const user = req.user

            const {courseId} = req.body

            const course = await database.collection("Courses").findOne({_id : new ObjectId(courseId)})

            if(!course) throw {name : "Data not found"}

            delete course._id

            const userStat = await database.collection("UserStats").findOne({userId : new ObjectId(user.id)})

            if(userStat.stats.coin < course.cost){
                throw {name : "Insufficient Coin", message : "Insufficient Coin", status : 400}
            }

            const hasBought = await database.collection("UserCourses").findOne({userId : user.id, name : course.name})

            if(hasBought) throw {name : "You have already unlocked this course", message : "You have already unlocked this course", status : 400}

            const response = await database.collection("UserCourses").insertOne({
                userId : user.id,
                ...course
            })

            const response2 = await database.collection("UserStats").updateOne(
                {userId : new ObjectId(user.id)},
                {$set : {"stats.coin" : userStat.stats.coin - course.cost}}
            )

            await database.collection("UserStats").updateOne(
                {userId : new ObjectId(user.id)},
                {$inc : {"stats.courseUnlocked" : 1}}
            )

            await achievementManager(user.id)

            res.status(201).json({message : `Course unlocked, ${userStat.stats.coin - course.cost} coins remained`})

        } catch (error) {
            console.log(error);
            next(error)
        }
    }    

    static async completeCourse(req, res, next){
        try {
            const user = req.user

            const {courseTitle, section, index} = req.body

            const updateQuery = {
                $set: {}
            }

            updateQuery.$set[`sections.${section}.content.${index}.isComplete`] = true

            const response = await database.collection("UserCourses").updateOne(
                {name : courseTitle, userId : user.id},
                updateQuery
            )

            await database.collection("UserStats").updateOne(
                {userId : new ObjectId(user.id)},
                {$inc : {"stats.coin" : 50, "stats.exp" : 50}}
            )

            res.status(200).json({message : "Course Completed; Coin gained 50; Exp gained 50"})

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async getQuiz(req, res, next){
        try {
            const user = req.user

            const {courseTitle, title} = req.body

            const response = await database.collection("UserCourses").aggregate([
                {
                    $match : {userId: user.id},
                },
                {
                    $match : {name: courseTitle},
                },
                {
                    $unwind : {path: "$sections"},
                },
                {
                    $match : {"sections.title": title},
                },
                {
                    $project : {"sections.quiz": 1, _id: 0},
                },
            ]).toArray()

            res.status(200).json({response : response[0]})

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async submitQuiz(req, res, next){
        try {
            const user = req.user

            const {answers, courseTitle, title} = req.body

            const queryQuestionsAnswer = await database.collection("UserCourses").aggregate([
                { $match : { userId: user.id } },
                { $match : { name: courseTitle } },
                { $unwind : { path: "$sections" } },
                { $match : { "sections.title": title } },
                { $project : { "sections.quizAnswer": 1, _id: 0 } },
            ]).toArray()

            const quizAnswers = queryQuestionsAnswer[0].sections.quizAnswer

            let userScore = 0;

            for(let i = 1; i <= 10; i++){
                if(answers[i] === quizAnswers[i]){
                    userScore += 10
                }
            }

            const queryUserScore = await database.collection("UserCourses").aggregate([
                { $match: { userId: user.id } },
                { $match : { name: courseTitle } },
                { $unwind : { path: "$sections" } },
                { $match : { "sections.title": title } },
                { $project : { "sections.userScore": 1, _id: 0 } },
            ]).toArray()

            const currentScore = queryUserScore[0].sections.userScore
            const coinsGained = (userScore - currentScore) * 10
            const expGained = (userScore - currentScore) * 10
            let achievement = ""

            if(userScore > currentScore){
                const filter = {
                    userId : user.id,
                    name : courseTitle,
                    "sections.title" : title
                }
    
                const update = {
                    $set : {"sections.$.userScore" : userScore}
                }
    
                await database.collection("UserCourses").updateOne(filter, update)

                if(userScore == 100){
                    achievement = await achievementManager(user.id, "perfectionist")
                    console.log(achievement, "<<<");
                }
            }

            await database.collection("UserStats").updateOne(
                {userId : new ObjectId(user.id)},
                {$inc : {"stats.quizAnswered" : 10, "stats.coin" : coinsGained, "stats.exp" : expGained}}
            )

            let achievementNotif = ""

            if(achievement){
                achievementNotif = "Achievement Unlocked"
            }

            res.status(200).json({message : `Your Score is ${userScore}; Coined obtained ${coinsGained}; Exp gained ${expGained}; ${achievementNotif}`})

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

}

module.exports = Controller