const { ObjectId } = require("mongodb")
const database = require("../config/db")

async function achievementManager(userId, trigger){
    const achievementUnlocked = []
    const userStat = await database.collection("UserStats").findOne({userId : new ObjectId(userId)})
    const userAchievement = await database.collection("UserAchievements").findOne({userId : new ObjectId(userId)})

    // console.log(userStat, "<<<<<<<<<<<<<<", userAchievement);

    // console.log("<<", userStat.stats.courseUnlocked, "<<", userAchievement.achievements.find(el => el.name === "Explorer").status);

    if(trigger === "perfectionist"){
        const response = await database.collection("UserAchievements").updateOne(
            {userId : new ObjectId(userId), "achievements.name" : "Perfectionist"},
            {$set : {"achievements.$.status" : true}}
        )
        console.log(response, "RESPONSE");
        if(response.acknowledged){
            achievementUnlocked.push("Perfectionist unlocked")
        }
    }

    if(userStat.stats.courseUnlocked >= 2 && userAchievement.achievements.find(el => el.name === "First Step").status === false){
        const response = await database.collection("UserAchievements").updateOne(
            {userId : new ObjectId(userId), "achievements.name" : "First Step"},
            {$set : {"achievements.$.status" : true}}
        )
        if(response.acknowledged){
            achievementUnlocked.push("First Step unlocked")
        }
    }

    if(userStat.stats.courseUnlocked >= 5 && userAchievement.achievements.find(el => el.name === "Explorer").status === false){
        const response = await database.collection("UserAchievements").updateOne(
            {userId : new ObjectId(userId), "achievements.name" : "Explorer"},
            {$set : {"achievements.$.status" : true}}
        )
        if(response.acknowledged){
            achievementUnlocked.push("Explorer unlocked")
        }
    }

    if(userStat.stats.courseUnlocked >= 10 && userAchievement.achievements.find(el => el.name === "Trailblazer").status === false){
        const response = await database.collection("UserAchievements").updateOne(
            {userId : new ObjectId(userId), "achievements.name" : "Trailblazer"},
            {$set : {"achievements.$.status" : true}}
        )
        if(response.acknowledged){
            achievementUnlocked.push("Trailblazer unlocked")
        }
    }

    if(userStat.stats.exp >= 1000 && userAchievement.achievements.find(el => el.name === "Freshman").status === false){
        const response = await database.collection("UserAchievements").updateOne(
            {userId : new ObjectId(userId), "achievements.name" : "Freshman"},
            {$set : {"achievements.$.status" : true}}
        )
        if(response.acknowledged){
            achievementUnlocked.push("Freshman unlocked")
        }
    }

    if(userStat.stats.exp >= 10000 && userAchievement.achievements.find(el => el.name === "Expert").status === false){
        const response = await database.collection("UserAchievements").updateOne(
            {userId : new ObjectId(userId), "achievements.name" : "Expert"},
            {$set : {"achievements.$.status" : true}}
        )
        if(response.acknowledged){
            achievementUnlocked.push("Expert unlocked")
        }
    }

    if(userStat.stats.exp >= 25000 && userAchievement.achievements.find(el => el.name === "Professor").status === false){
        const response = await database.collection("UserAchievements").updateOne(
            {userId : new ObjectId(userId), "achievements.name" : "Professor"},
            {$set : {"achievements.$.status" : true}}
        )
        if(response.acknowledged){
            achievementUnlocked.push("Professor unlocked")
        }
    }
    return {achievementUnlocked}
}

module.exports = achievementManager

